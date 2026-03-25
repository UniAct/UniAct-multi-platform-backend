import { Job } from "bullmq";
import { GetWorkerSingleton } from "../../Utils/BullMQConfig";
import { logger } from "../../Utils/Logger";
import { Queues } from "../../Enums/Queues";
import { BulkCreateResult, CreateStudentRequest, FailedRow } from "../../Interfaces/Student";
import { getTenantClient } from "../../Utils/prismaClient";
import { MinioRepository } from "../../Repositories/MinioRepository";
import ExcelJS from "exceljs";
import { ValidateStudentRow } from "./Helpers/ValidateStudentRow";
import { StudentRepository } from "../../Repositories/StudentRepository";
import {  ResolveDbError } from "./Helpers/ResolvePrismaErrors";
import { BuildRawData } from "./Helpers/BulkRawData";
import { hashNationalIds } from "./Helpers/HashNationalId";
// ─── Prerequisites ────────────────────────────────────────────────────────────
//
//  This worker connects to Redis (BullMQ) and MinIO (file storage) on startup.
//  Both services must be running BEFORE you start this process, or it will fail
//  immediately trying to connect.
//
//  Spin them up with Docker Compose (once per machine, data persists):
//
//    docker compose up -d
//
//  Services:
//    • Redis  — job queue broker          → localhost:6379
//    • MinIO  — object storage            → localhost:9000
//
// ─────────────────────────────────────────────────────────────────────────────

// ─── Constants ───────────────────────────────────────────────────────────────

/** Number of student rows inserted in parallel per batch. */
const CONCURRENCY = 10;


// ─── Worker Handler ───────────────────────────────────────────────────────────

/**
 * Main BullMQ job handler for bulk student imports.
 *
 * Flow:
 *  1. Mark the job as "Processing" in the database.
 *  2. Download and parse the Excel file from MinIO.
 *  3. Validate every data row; split rows into validRows / failedRows buckets.
 *  4. Ensure a fee record exists for the target program level + semester.
 *  5. Insert valid rows in concurrent batches; collect any DB-level failures.
 *  6. Persist the final job status and error log.
 */
async function handler(job: Job<BulkCreateResult>) {
  const jobStart = Date.now();

  try {
    const { objectName, jobId, schemaName, programId, programLevelId, semesterId } = job.data;
    const prisma = getTenantClient(schemaName);

    // ── Step 1: Mark job as in-progress ─────────────────────────────────────
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "Processing", started_at: new Date() },
    });

    // ── Step 2: Download and parse the Excel file from MinIO ─────────────────
    const streamStart = Date.now();

    const stream   = await MinioRepository.GetObject(schemaName, objectName);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.read(stream);

    const streamDuration = Date.now() - streamStart;

    const worksheet = workbook.worksheets[0];
    if (!worksheet) throw new Error("Excel file is empty or invalid");

    // Build a map of { "Column Header" → columnIndex } from the first row.
    const headerMap = new Map<string, number>();
    (worksheet.getRow(1).values as any[]).forEach((value, index) => {
      if (value) headerMap.set(String(value).trim(), index);
    });

    // ── Step 3: Validate all data rows (skip header row 1) ───────────────────
    const validationStart = Date.now();

    const validRows:  { rowNumber: number; data: Record<string, any> }[] = [];
    const failedRows: FailedRow[] = [];

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header

      const result = ValidateStudentRow(row.values as any[], headerMap, rowNumber);

      if (result.valid) {
        validRows.push({ rowNumber, data: result.data! });
      } else {
        // One FailedRow entry per validation error so each issue is logged individually.
        const rawData = BuildRawData(row.values as any[], headerMap);
        result.errors.forEach((error) => {
          failedRows.push({
            row:    error.row,
            data:   rawData,
            reason: `${error.field}: ${error.message}`,
          });
        });
      }
    });

    const validationDuration = Date.now() - validationStart;
    const totalRows = validRows.length + failedRows.length;

    logger.info({
      action:          "StudentImportWorker",
      phase:           "Validation",
      jobId,
      total_rows:      totalRows,
      valid_rows:      validRows.length,
      invalid_rows:    failedRows.length,
      duration_ms:     validationDuration,
      rows_per_second: Math.round(totalRows / (validationDuration / 1000)),
    });

    // ── Step 4: Pre-hash all national IDs in a dedicated thread ────────────
    const hashStart = Date.now();
    
    const hashMap = await hashNationalIds(validRows.map(r => r.data.nationalId as string));
    
    logger.info({
      action:      "StudentImportWorker",
      phase:       "Hashing",
      jobId,
      count:       validRows.length,
      duration_ms: Date.now() - hashStart,
    });
    

    // ── Step 5: Verify a fee exists for this program level + semester ─────────
    // Every row in this job shares the same programLevelId and semesterId,
    // so a single prefetch is enough instead of querying inside each row insertion.
    const fee = await prisma.fee.findFirst({
      where: {
        programLevelId: Number(programLevelId),
        semesterId:     Number(semesterId),
      },
    });

    if (!fee) {
      // Without a fee we cannot enroll anyone — fail the entire job early.
      await prisma.job.update({
        where: { id: jobId },
        data: {
          status:        "Failed",
          completed_at:  new Date(),
          inserted_rows: 0,
          failed_rows:   totalRows,
          error_log:     [{ row: 0, username: "N/A", reason: "No fee assigned for the selected program level and semester" }],
        },
      });

      logger.warn({
        action:         "StudentImportWorker",
        phase:          "FeePrefetch",
        jobId,
        reason:         "No fee found — job terminated early",
        programLevelId,
        semesterId,
      });

      return;
    }

    // ── Step 6: Insert valid rows in concurrent batches ───────────────────────
    const insertionStart = Date.now();
    let insertedCount = 0;

    for (let i = 0; i < validRows.length; i += CONCURRENCY) {
      const batch = validRows.slice(i, i + CONCURRENCY);

      // Run up to CONCURRENCY insertions in parallel; collect every outcome
      // without letting a single failure abort the rest of the batch.
      const batchResults = await Promise.allSettled(
        batch.map(async ({ rowNumber, data: row }) =>
          StudentRepository.CreateStudentWithFee(
            {
              ...(row as CreateStudentRequest),
              programId:      Number(programId),
              programLevelId: Number(programLevelId),
              semesterId:     Number(semesterId),
            },
            hashMap.get(row.nationalId as string)!,
            fee,
            prisma
          )
          .then(() => ({ rowNumber, row, success: true  as const }))
          .catch((err: any) => ({ rowNumber, row, success: false as const, err }))
        )
      );

      // Tally successes and accumulate DB-level failures into failedRows.
      for (const result of batchResults) {
        if (result.status === "fulfilled") {
          const { rowNumber, row, success } = result.value;

          if (success) {
            insertedCount++;
            logger.debug({
              action:   "StudentImportWorker",
              phase:    "InsertRow",
              jobId,
              row:      rowNumber,
              username: row.username,
            });
          } else {
            const { err } = result.value as {
              rowNumber: number;
              row: Record<string, any>;
              success: false;
              err: any;
            };

            const reason = ResolveDbError(err, row);
            failedRows.push({ row: rowNumber, data: row, reason });

            logger.warn({
              action:   "StudentImportWorker",
              phase:    "InsertRow",
              jobId,
              row:      rowNumber,
              username: row.username,
              reason,
            });
          }
        }
      }
    }

    const insertionDuration = Date.now() - insertionStart;

    logger.info({
      action:          "StudentImportWorker",
      phase:           "Insertion",
      jobId,
      attempted:       validRows.length,
      inserted:        insertedCount,
      failed:          validRows.length - insertedCount,
      duration_ms:     insertionDuration,
      rows_per_second: validRows.length > 0 ? Math.round(insertedCount / (insertionDuration / 1000)) : 0,
      avg_ms_per_row:  validRows.length > 0 ? Math.round(insertionDuration / validRows.length)       : 0,
    });

    // ── Step 7: Persist final job status and error log ────────────────────────
    const totalDuration = Date.now() - jobStart;

    const finalStatus =
      failedRows.length === 0 ? "Completed"
      : insertedCount   === 0 ? "Failed"
      :                         "CompletedWithErrors";

    await prisma.job.update({
      where: { id: jobId },
      data: {
        status:        finalStatus,
        completed_at:  new Date(),
        inserted_rows: insertedCount,
        failed_rows:   failedRows.length,
        error_log:     failedRows.length > 0
          ? failedRows.map(({ row, data, reason }) => ({
              row,
              username: data.username,
              reason,
            }))
          : undefined,
      },
    });

    logger.info({
      action:          "StudentImportWorker",
      phase:           "Summary",
      jobId,
      total_rows:      totalRows,
      inserted:        insertedCount,
      failed:          failedRows.length,
      stream_ms:       streamDuration,
      validation_ms:   validationDuration,
      insertion_ms:    insertionDuration,
      total_ms:        totalDuration,
      rows_per_second: Math.round(totalRows / (totalDuration / 1000)),
    });

  } catch (err: any) {
    logger.error({
      action:      "StudentImportWorker",
      status:      "Failed",
      jobId:       job.id,
      reason:      err.message,
      duration_ms: Date.now() - jobStart,
    });
    throw err;
  }
}

// ─── Bootstrap ────

GetWorkerSingleton<BulkCreateResult>(Queues.StudentBulkData, handler);

process.title = "Student Import Worker";

logger.info({
  action:       "Worker",
  message:      "Student Import Worker started...",
  process_id:   process.pid,
  process_name: process.title,
});
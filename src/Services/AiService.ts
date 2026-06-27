import { LearningGroupRepository } from "../Repositories/LearningGroupRepository";
import { TranscriptService } from "./TranscriptService";
import { GetTenantClient } from "../Utils/prismaClient";
import { BadRequestError, ConnectionError, NotFoundError } from "../Types/Errors";
import { DownloadCloudinaryFile } from "../Utils/ImageUpload";

type AiHttpMethod = "GET" | "POST";

type AiAttachment = {
  attachmentId: number;
  fileName: string;
  fileType: string;
  url: string;
  fileSize: number | null;
};

type AiChatPayload = {
  text: string;
  sessionId?: string;
  includeTranscript?: boolean;
  studentId?: number;
  limit?: number;
};

type AiGeneratePayload = {
  content?: string;
  difficulty?: string;
  num_mcq?: number;
  num_written?: number;
  chapters?: string[];
  file_chapter_filters?: Array<{ file_id: string; chapter_title: string }>;
};

const SUPPORTED_AI_EXTENSIONS = [".pdf", ".txt"];

function aiBaseUrl(): string {
  return (process.env.AI_SERVICE_URL ?? "http://127.0.0.1:8000/api/v1").replace(/\/$/, "");
}

function makeProjectId(schemaName: string, groupId: number): string {
  return `${schemaName}-learning-group-${groupId}`.replace(/[^a-zA-Z0-9_-]/g, "_");
}

function isSupportedAttachment(attachment: AiAttachment): boolean {
  const name = attachment.fileName.toLowerCase();
  return SUPPORTED_AI_EXTENSIONS.some((ext) => name.endsWith(ext));
}

function cleanAiFileName(fileName: string): string {
  return fileName.trim().replace(/[^\w.]/g, "").replace(/\s+/g, "_");
}

function hasIndexedFile(existingFileNames: Set<string>, originalFileName: string): boolean {
  const cleaned = cleanAiFileName(originalFileName).toLowerCase();
  return [...existingFileNames].some((existingName) => {
    const normalized = cleanAiFileName(existingName).toLowerCase();
    return normalized === cleaned || normalized.endsWith(`_${cleaned}`);
  });
}

function getChapterAssetIds(chaptersResponse: unknown): Set<string> {
  const chapters = (chaptersResponse as any)?.chapters;
  if (!Array.isArray(chapters)) return new Set();

  return new Set(
    chapters
      .map((chapter: any) => chapter?.asset_id ?? chapter?.file_id)
      .filter((assetId: unknown): assetId is string | number => typeof assetId === "string" || typeof assetId === "number")
      .map(String)
  );
}

async function downloadAttachmentBytes(attachment: AiAttachment): Promise<ArrayBuffer> {
  const response = await fetch(attachment.url);
  if (response.ok) return response.arrayBuffer();

  if (response.status === 401 || response.status === 403) {
    const cloudinaryBytes = await DownloadCloudinaryFile(attachment.url);
    if (cloudinaryBytes) return cloudinaryBytes;
  }

  throw new Error(`Could not download material (${response.status})`);
}

function aiHeaders(body: unknown, schemaName?: string): HeadersInit | undefined {
  const headers: Record<string, string> = {};

  if (body) {
    headers["Content-Type"] = "application/json";
  }

  if (schemaName?.trim()) {
    headers["x-tenant-schema"] = schemaName.trim();
  }

  return Object.keys(headers).length > 0 ? headers : undefined;
}

async function requestJson<T>(method: AiHttpMethod, path: string, body?: unknown, schemaName?: string): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_SERVICE_TIMEOUT_MS ?? 120000));

  try {
    const response = await fetch(`${aiBaseUrl()}${path}`, {
      method,
      headers: aiHeaders(body, schemaName),
      body: body ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      const message = payload?.detail || payload?.error || payload?.signal || `AI request failed (${response.status})`;
      throw new ConnectionError(message);
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ConnectionError) throw error;
    const message = error instanceof Error ? error.message : "AI service is unavailable";
    throw new ConnectionError(message);
  } finally {
    clearTimeout(timeout);
  }
}

function formatTranscriptContext(transcripts: any): string {
  const semesters = transcripts?.semesters;
  if (!Array.isArray(semesters) || semesters.length === 0) return "";

  const lines = semesters.map((semester: any) => {
    const label = semester.semester
      ? `${semester.semester.type ?? "Semester"} ${semester.semester.year ?? ""}`.trim()
      : `Semester ${semester.semesterId}`;
    const courses = Array.isArray(semester.courses)
      ? semester.courses
          .map((course: any) => `${course.courseCode ?? ""} ${course.courseName ?? ""}: ${course.grade ?? "N/A"}`)
          .join("; ")
      : "";
    return `${label}: semester GPA ${semester.semesterGpa}, cumulative GPA ${semester.cumulativeGpa}. ${courses}`;
  });

  return `\n\nStudent transcript context:\n${lines.join("\n")}`;
}

export class AiService {
  static GetProjectId(schemaName: string, groupId: number): string {
    return makeProjectId(schemaName, groupId);
  }

  static async Health() {
    return requestJson("GET", "/");
  }

  static async GetProjectFiles(schemaName: string, groupId: number) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("GET", `/data/files/${encodeURIComponent(projectId)}`, undefined, schemaName);
  }

  static async GetProjectChapters(schemaName: string, groupId: number) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("GET", `/data/chapters/${encodeURIComponent(projectId)}`, undefined, schemaName);
  }

  static async GetIndexInfo(schemaName: string, groupId: number) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("GET", `/nlp/index/info/${encodeURIComponent(projectId)}`, undefined, schemaName);
  }

  static async Search(schemaName: string, groupId: number, payload: { text: string; limit?: number; chapters?: string[]; file_chapter_filters?: Array<{ file_id: string; chapter_title: string }> }) {
    if (!payload.text?.trim()) throw new BadRequestError("Search text is required.");
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("POST", `/nlp/index/search/${encodeURIComponent(projectId)}`, {
      text: payload.text,
      limit: payload.limit ?? 5,
      chapters: payload.chapters,
      file_chapter_filters: payload.file_chapter_filters,
    }, schemaName);
  }

  static async SyncGroupMaterials(schemaName: string, groupId: number) {
    const prisma = GetTenantClient(schemaName);
    const rawPosts = await LearningGroupRepository.GetGroupPosts(groupId, undefined, 1, 500, prisma);
    const projectId = makeProjectId(schemaName, groupId);
    const attachments = rawPosts.items.flatMap((post) =>
      post.attachments.map((attachment) => ({
        attachmentId: attachment.id,
        fileName: attachment.fileName,
        fileType: attachment.fileType,
        url: attachment.storagePath,
        fileSize: attachment.fileSize ? Number(attachment.fileSize) : null,
      }))
    ).filter(isSupportedAttachment);

    let indexedFileNames = new Set<string>();
    try {
      const [existing, chapters] = await Promise.all([
        this.GetProjectFiles(schemaName, groupId) as Promise<any>,
        this.GetProjectChapters(schemaName, groupId).catch(() => undefined),
      ]);
      const chunkedAssetIds = getChapterAssetIds(chapters);
      indexedFileNames = new Set(
        (existing.assets ?? [])
          .filter((asset: any) => Number(asset.chunk_count ?? 0) > 0 || chunkedAssetIds.has(String(asset.asset_id)))
          .map((asset: any) => String(asset.asset_name ?? asset.file_name ?? asset.name ?? ""))
      );
    } catch {
      indexedFileNames = new Set();
    }

    const results: Array<{ attachmentId: number; fileName: string; status: string; detail?: string }> = [];

    for (const attachment of attachments) {
      if (hasIndexedFile(indexedFileNames, attachment.fileName)) {
        results.push({ attachmentId: attachment.attachmentId, fileName: attachment.fileName, status: "skipped" });
        continue;
      }

      try {
        const bytes = await downloadAttachmentBytes(attachment);
        const formData = new FormData();
        formData.append("file", new globalThis.Blob([bytes], { type: attachment.fileType }), attachment.fileName);

        const ingestResponse = await fetch(`${aiBaseUrl()}/data/ingest/${encodeURIComponent(projectId)}`, {
          method: "POST",
          headers: {
            "x-tenant-schema": schemaName,
            "x-source-file-name": attachment.fileName,
            "x-source-attachment-id": String(attachment.attachmentId),
          },
          body: formData,
        });
        const payload = await ingestResponse.json().catch(() => ({}));
        if (!ingestResponse.ok) {
          throw new Error(payload?.detail || payload?.error || payload?.signal || "AI ingestion failed");
        }

        results.push({ attachmentId: attachment.attachmentId, fileName: attachment.fileName, status: "indexed" });
        indexedFileNames.add(attachment.fileName);
      } catch (error) {
        results.push({
          attachmentId: attachment.attachmentId,
          fileName: attachment.fileName,
          status: "failed",
          detail: error instanceof Error ? error.message : "Unknown ingestion error",
        });
      }
    }

    return {
      projectId,
      supportedMaterials: attachments.length,
      indexed: results.filter((item) => item.status === "indexed").length,
      skipped: results.filter((item) => item.status === "skipped").length,
      failed: results.filter((item) => item.status === "failed").length,
      results,
    };
  }

  static async CreateSession(schemaName: string, groupId: number, title?: string) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("POST", `/sessions/project/${encodeURIComponent(projectId)}`, {
      title: title || "UniAct Assistant",
    }, schemaName);
  }

  static async ListSessions(schemaName: string, groupId: number) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("GET", `/sessions/project/${encodeURIComponent(projectId)}/list`, undefined, schemaName);
  }

  static async GetSessionHistory(schemaName: string, sessionId: string) {
    return requestJson("GET", `/sessions/${encodeURIComponent(sessionId)}/history`, undefined, schemaName);
  }

  static async Chat(schemaName: string, groupId: number, userId: number, payload: AiChatPayload) {
    const text = payload.text?.trim();
    if (!text) throw new BadRequestError("Message text is required.");

    let sessionId = payload.sessionId;
    if (!sessionId) {
      const session = await this.CreateSession(schemaName, groupId) as any;
      sessionId = session.session_id;
    }

    if (!sessionId) throw new NotFoundError("AI session could not be created.");

    let prompt = text;
    if (payload.includeTranscript) {
      const transcriptStudentId = payload.studentId ?? userId;
      try {
        const transcripts = await TranscriptService.GetStudentTranscripts(transcriptStudentId, schemaName);
        prompt += formatTranscriptContext(transcripts);
      } catch {
        prompt += "\n\nStudent transcript context: No generated transcript is currently available.";
      }
    }

    const response = await requestJson("POST", `/sessions/${encodeURIComponent(sessionId)}/chat`, {
      text: prompt,
      limit: payload.limit ?? 5,
    }, schemaName) as any;

    return {
      sessionId,
      answer: response.answer,
      signal: response.signal,
    };
  }

  static async Summarize(schemaName: string, groupId: number, payload: { content?: string }) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("POST", `/nlp/index/summarize/${encodeURIComponent(projectId)}`, {
      content: payload.content ?? "",
    }, schemaName);
  }

  static async Exam(schemaName: string, groupId: number, payload: AiGeneratePayload) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("POST", `/nlp/index/exam/${encodeURIComponent(projectId)}`, {
      content: payload.content ?? "",
      difficulty: payload.difficulty ?? "medium",
      num_mcq: payload.num_mcq ?? 5,
      num_written: payload.num_written ?? 2,
      chapters: payload.chapters,
      file_chapter_filters: payload.file_chapter_filters,
    }, schemaName);
  }

  static async MindMap(schemaName: string, groupId: number, payload: { content?: string; chapters?: string[]; file_chapter_filters?: Array<{ file_id: string; chapter_title: string }> }) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("POST", `/nlp/index/mindmap/${encodeURIComponent(projectId)}`, {
      content: payload.content ?? "",
      chapters: payload.chapters,
      file_chapter_filters: payload.file_chapter_filters,
    }, schemaName);
  }

  static async ListStudyFiles(schemaName: string, groupId: number) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("GET", `/study/files/${encodeURIComponent(projectId)}`, undefined, schemaName);
  }

  static async GetStudyData(schemaName: string, groupId: number, fileId: string) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("GET", `/study/data/${encodeURIComponent(projectId)}/${encodeURIComponent(fileId)}`, undefined, schemaName);
  }

  static async SaveStudyData(schemaName: string, groupId: number, fileId: string, payload: { notes?: string; bookmarks?: Array<{ label: string; page: number }> }) {
    const projectId = makeProjectId(schemaName, groupId);
    return requestJson("POST", `/study/data/${encodeURIComponent(projectId)}/${encodeURIComponent(fileId)}`, {
      notes: payload.notes ?? "",
      bookmarks: payload.bookmarks ?? [],
    }, schemaName);
  }
}

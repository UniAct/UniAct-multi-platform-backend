#!/usr/bin/env ts-node
/**
 * ============================================================================
 *  Truncate All Tables in a Tenant Schema
 * ============================================================================
 *
 *  Usage:
 *      ts-node truncate.ts <schema_name> [--dry-run] [--include-migrations]
 *
 *  Examples:
 *      ts-node truncate.ts alex_university
 *      ts-node truncate.ts alex_university --dry-run
 *      ts-node truncate.ts alex_university --include-migrations
 *
 *  What it does:
 *      - Connects to the tenant schema via GetTenantClient()
 *      - Lists all tables in that schema (via pg_tables)
 *      - Excludes the Prisma `migrations` table by default
 *        (use --include-migrations to also truncate it — WARNING: this
 *        will make Prisma re-run all migrations on the next deploy)
 *      - Executes a single TRUNCATE TABLE ... RESTART IDENTITY CASCADE
 *      - All foreign key constraints are handled automatically by CASCADE
 *      - All auto-increment sequences are reset to start from 1
 *
 *  Safety:
 *      - Refuses to truncate protected schemas: public, template,
 *        information_schema, pg_catalog
 *      - Use --dry-run to preview without executing
 *
 *  Requirements:
 *      - Same as seeding.ts (Prisma client, adapter, DATABASE_URL)
 *      - Adjust the import path of `GetTenantClient` below to match
 *        your project structure.
 * ============================================================================
 */

import { GetTenantClient } from "./Utils/prismaClient";
import dotenv from 'dotenv';
dotenv.config();

// Schemas that must NEVER be truncated — they contain shared/system data.
const FORBIDDEN_SCHEMAS = [
  "public",
  "template",
  "information_schema",
  "pg_catalog",
  "pg_toast",
  "pg_temp",
  "pg_toast_temp",
];

async function main(): Promise<void> {
  const schemaName = process.argv[2]?.trim();
  const dryRun = process.argv.includes("--dry-run");
  const includeMigrations = process.argv.includes("--include-migrations");

  if (!schemaName) {
    console.error("❌ Usage: ts-node truncate.ts <schema_name> [--dry-run] [--include-migrations]");
    console.error("   Example: ts-node truncate.ts alex_university");
    console.error("            ts-node truncate.ts alex_university --dry-run");
    process.exit(1);
  }

  // ------------------------------------------------------------------
  // Safety: refuse protected schemas
  // ------------------------------------------------------------------
  if (FORBIDDEN_SCHEMAS.includes(schemaName.toLowerCase())) {
    console.error(`\n❌ REFUSING to truncate schema "${schemaName}".`);
    console.error("   Protected schemas: " + FORBIDDEN_SCHEMAS.join(", "));
    console.error("   These contain shared/system data and must not be cleared.");
    process.exit(1);
  }

  const prisma = GetTenantClient(schemaName);

  console.log("=".repeat(72));
  console.log(`  ${dryRun ? "[DRY RUN] " : ""}Truncating schema: ${schemaName}`);
  console.log("=".repeat(72));

  // ------------------------------------------------------------------
  // 1. Discover all tables in the schema (via pg_tables)
  // ------------------------------------------------------------------
  const allTables: Array<{ tablename: string }> = await prisma.$queryRaw`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = ${schemaName}
    ORDER BY tablename
  `;

  if (allTables.length === 0) {
    console.log(`\n⚠️  No tables found in schema "${schemaName}".`);
    console.log("    Make sure the schema exists and has been migrated.");
    process.exit(0);
  }

  // Filter out the migrations table unless explicitly requested.
  const tables = includeMigrations
    ? allTables
    : allTables.filter((t) => t.tablename !== "migrations");

  if (tables.length === 0 && !includeMigrations) {
    console.log(`\n⚠️  Schema "${schemaName}" contains only the migrations table.`);
    console.log("    Use --include-migrations to truncate it (not recommended).");
    process.exit(0);
  }

  // ------------------------------------------------------------------
  // 2. Print the list of tables that will be truncated
  // ------------------------------------------------------------------
  console.log(`\n  Found ${tables.length} table(s) to truncate in schema "${schemaName}":\n`);
  tables.forEach((t, i) => {
    console.log(`    ${(i + 1).toString().padStart(3)}. ${t.tablename}`);
  });

  if (!includeMigrations && allTables.some((t) => t.tablename === "migrations")) {
    console.log("\n  ℹ️  The Prisma `migrations` table is preserved by default.");
    console.log("     Use --include-migrations to also truncate it (not recommended).");
  }

  // ------------------------------------------------------------------
  // 3. Build the TRUNCATE statement
  //    - RESTART IDENTITY resets serial/identity sequences to start from 1
  //    - CASCADE handles foreign key constraints automatically
  // ------------------------------------------------------------------
  const tableList = tables
    .map((t) => `"${schemaName}"."${t.tablename}"`)
    .join(", ");
  const sql = `TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`;

  // ------------------------------------------------------------------
  // 4. Dry-run: print the SQL and exit
  // ------------------------------------------------------------------
  if (dryRun) {
    console.log("\n  SQL that would be executed:");
    console.log("  " + "─".repeat(68));
    // Wrap long SQL for readability
    const wrappedSql = sql.length > 68
      ? sql.match(/.{1,68}/g)!.map((line) => "  " + line).join("\n")
      : "  " + sql;
    console.log(wrappedSql);
    console.log("  " + "─".repeat(68));
    console.log("\n  [DRY RUN] No tables were actually truncated.");
    console.log("  Remove --dry-run to perform the truncation.");
    console.log("=".repeat(72));
    process.exit(0);
  }

  // ------------------------------------------------------------------
  // 5. Execute the TRUNCATE
  // ------------------------------------------------------------------
  console.log("\n  Executing TRUNCATE TABLE ... RESTART IDENTITY CASCADE");
  console.log("  (This is fast — typically < 1 second even for large datasets.)");

  const startTime = Date.now();
  await prisma.$executeRawUnsafe(sql);
  const elapsed = Date.now() - startTime;

  console.log(`\n  ✅ Truncated ${tables.length} table(s) in ${elapsed} ms.`);
  console.log("  All auto-increment sequences have been reset to start from 1.");
  console.log("=".repeat(72));

  process.exit(0);
}

main().catch((err) => {
  console.error("\n❌ Truncate failed:", err);
  process.exit(1);
});

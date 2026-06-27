import fs from "fs";
import path from "path";
import { Pool } from "pg";
import "dotenv/config";
import Permissions from "../src/Utils/PermissionsParser";
import SystemRoles from "../src/Enums/SystemRoles";

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma/migrations");
const MIGRATIONS_TABLE_MIGRATION = path.normalize("20260330102822_added_migration_table/migration.sql");
const DEFAULT_PERMISSIONS = Permissions;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// this function is created to apply the schema migration for all tenants automatically 
// so if you make any change to the template schema like adding a new column 
// and want all other tenants to sync with the new migration so you simply run this function


export async function runMigrations() {
  //get all schemas that we have e.g(anu,cairo..etc)
  const schemas = await getAllSchemas();
  const files = getMigrationFiles();

  for (const schema of schemas) {
    if(schema === "ppg") {continue}
    console.log(`\n🚀 Migrating schema: ${schema}`);
    //this makes sure that the tenant has the new table called (migrations) which keep track of applied migrations to this sepcific tenant NOTE(Will be uncessary later)
    await ensureMigrationsTable(schema);

    const appliedMigrations = await getAppliedMigrations(schema);


    //if i find any migration file that is not included in the applied migration for this tenant, then it's a pending migration and i need to apply them
    const pending = files.filter(migration => !appliedMigrations.has(migration));

    for (const file of pending) {
      if (path.normalize(file) === MIGRATIONS_TABLE_MIGRATION) {
        await recordMigration(schema, file);
        console.log(`ℹ️ ${schema} -> ${file} skipped (already managed by the tenant migration table)`);
        continue;
      }

      await applyMigration(schema, file);
    }

    await syncDefaultPermissions(schema);
  }

  console.log("\n🎉 All migrations applied");
}



async function getAllSchemas(): Promise<string[]> {
  const res = await pool.query(`
    SELECT schema_name
    FROM information_schema.schemata
    WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'public', 'pg_toast', 'template')
  `);

  return res.rows.map(r => r.schema_name);
}

async function ensureMigrationsTable(schema: string) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS "${schema}"."migrations" (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMP DEFAULT now()
    );
  `);
}

async function getAppliedMigrations(schema: string): Promise<Set<string>> {

  const res = await pool.query(`
    SELECT name FROM "${schema}"."migrations"
  `);

  return new Set(res.rows.map(r => r.name));
}

function getMigrationFiles(): string[] {
  const folders = fs.readdirSync(MIGRATIONS_DIR);

  const files: string[] = [];

  for (const folder of folders) {
    const fullDir = path.join(MIGRATIONS_DIR, folder);
    if (fs.statSync(fullDir).isDirectory()) {
      const file = path.join(fullDir, "migration.sql");
      if (fs.existsSync(file)) {
        files.push(path.normalize(path.relative(MIGRATIONS_DIR, file)));
      }
    }
  }

  return files.sort();
}

async function applyMigration(schema: string, file: string) {
  let sql = fs.readFileSync(
    path.join(MIGRATIONS_DIR, file),
    "utf8"
  );
  sql = transformMigrationSQL(sql, schema);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(`SET search_path TO "${schema}"`);

    await client.query(sql);

    await client.query(
      `INSERT INTO "${schema}".migrations (name) VALUES ($1)`,
      [file]
    );

    await client.query("COMMIT");

    console.log(`✅ ${schema} -> ${file}`);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(`❌ ${schema} -> ${file}`, err);
    throw err;
  } finally {
    client.release();
  }
}

async function recordMigration(schema: string, file: string) {
  await pool.query(
    `INSERT INTO "${schema}".migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING`,
    [file]
  );
}

async function syncDefaultPermissions(schema: string) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    await client.query(`SET search_path TO "${schema}"`);

    if (DEFAULT_PERMISSIONS.length > 0) {
      const permissionValues: string[] = [];
      const permissionParams: string[] = [];

      DEFAULT_PERMISSIONS.forEach((permission, index) => {
        const nameIndex = index * 3 + 1;
        const descIndex = index * 3 + 2;
        const updatedAtIndex = index * 3 + 3;
        permissionValues.push(`($${nameIndex}, $${descIndex}, $${updatedAtIndex})`);
        permissionParams.push(permission.name, permission.description, new Date().toISOString());
      });

      await client.query(
        `INSERT INTO "${schema}"."Permission" ("name", "description", "updated_at") VALUES ${permissionValues.join(", ")}
         ON CONFLICT ("name") DO UPDATE SET "description" = EXCLUDED."description", "updated_at" = EXCLUDED."updated_at"`,
        permissionParams,
      );
    }

    const roleResult = await client.query(
      `INSERT INTO "${schema}"."Role" ("name", "description", "updated_at")
       VALUES ($1, $2, $3)
       ON CONFLICT ("name") DO UPDATE SET "description" = EXCLUDED."description", "updated_at" = EXCLUDED."updated_at"
       RETURNING id`,
      [SystemRoles.RootAccount, "Root account with full permissions", new Date().toISOString()],
    );

    const rootRoleId = roleResult.rows[0]?.id;
    if (!rootRoleId) {
      throw new Error(`Unable to resolve root role for schema ${schema}`);
    }

    const permissionNames = DEFAULT_PERMISSIONS.map((permission) => permission.name);
    const permissionResult = await client.query(
      `SELECT id, name FROM "${schema}"."Permission" WHERE name = ANY($1::text[])`,
      [permissionNames],
    );

    const permissionIdsByName = new Map<string, number>(
      permissionResult.rows.map((row) => [row.name, row.id]),
    );

    const rolePermissionValues: string[] = [];
    const rolePermissionParams: number[] = [];
    let rolePermissionParamIndex = 1;

    permissionNames.forEach((permissionName) => {
      const permissionId = permissionIdsByName.get(permissionName);
      if (!permissionId) return;

      rolePermissionValues.push(`($${rolePermissionParamIndex}, $${rolePermissionParamIndex + 1})`);
      rolePermissionParams.push(rootRoleId, permissionId);
      rolePermissionParamIndex += 2;
    });

    if (rolePermissionValues.length > 0) {
      await client.query(
        `INSERT INTO "${schema}"."RolePermission" ("role_id", "permission_id")
         VALUES ${rolePermissionValues.join(", ")}
         ON CONFLICT ("role_id", "permission_id") DO NOTHING`,
        rolePermissionParams,
      );
    }

    await client.query("COMMIT");
    console.log(`🔐 ${schema} permissions synchronized`);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(`❌ ${schema} permissions sync failed`, error);
    throw error;
  } finally {
    client.release();
  }
}

function transformMigrationSQL(sql: string, schema: string): string {
  // 1. Split into statements
  const statements = splitSQLStatements(sql);

  // 2. Keep only template-related ones
  const filtered = filterTemplateStatements(statements);

  // 3. Rebuild SQL
  let result = buildSQL(filtered);

  // 4. Replace schema
  result = result
    .replace(/"template"\./g, `"${schema}".`)
    .replace(/template\./g, `"${schema}".`)
    .replace(/"template"/g, `"${schema}"`);

  return result;
}

function splitSQLStatements(sql: string): string[] {
  return sql
    .split(/;\s*\n/) // split by semicolon + newline
    .map(s => s.trim())
    .filter(Boolean);
}
function filterTemplateStatements(statements: string[]): string[] {
  return statements.filter(stmt =>
    stmt.includes('"template"') || stmt.includes('template.')
  );
}

function buildSQL(statements: string[]): string {
  return statements.map(s => s + ";").join("\n");
}


runMigrations()
  .catch(err => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => pool.end());

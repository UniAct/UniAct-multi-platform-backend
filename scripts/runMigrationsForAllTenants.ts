import fs from "fs";
import path from "path";
import { Pool } from "pg";
import "dotenv/config"; 

const MIGRATIONS_DIR = path.join(process.cwd(), "prisma/migrations");

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
      console.log(`\n🚀 Migrating schema: ${schema}`);
      //this makes sure that the tenant has the new table called (migrations) which keep track of applied migrations to this sepcific tenant NOTE(Will be uncessary later)
      await ensureMigrationsTable(schema);
      
      const appliedMigrations = await getAppliedMigrations(schema);
      
      //if i find any migration file that is not included in the applied migration for this tenant, then it's a pending migration and i need to apply them
      const pending = files.filter(migration=> !appliedMigrations.has(migration));
      
      for (const file of pending) {
         await applyMigration(schema, file);
      }
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
        files.push(path.relative(MIGRATIONS_DIR,file));
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
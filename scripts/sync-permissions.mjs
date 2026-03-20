/*
How to use:

- Sync permissions for all tenant schemas from University.db_schema run:
npm run permissions:sync

- Sync one schema only run:
npm run permissions:sync -- --schema your_schema_name
*/


import dotenv from "dotenv";
import path from "path";
import { pathToFileURL } from "url";
import pg from "pg";

dotenv.config();

const { Client } = pg;

function parseSchemaArg(argv) {
  const schemaFlag = argv.indexOf("--schema");
  if (schemaFlag === -1) return undefined;

  const value = argv[schemaFlag + 1];
  if (!value || value.startsWith("--")) {
    throw new Error("Missing value for --schema. Example: npm run permissions:sync -- --schema tenant_a");
  }

  return value;
}

function quoteIdent(identifier) {
  return `"${identifier.replace(/"/g, '""')}"`;
}

function qualify(schema, table) {
  return `${quoteIdent(schema)}.${quoteIdent(table)}`;
}

async function loadDefaultPermissions() {
  const modulePath = path.join(process.cwd(), "dist", "Repositories", "RBACRepository.js");
  const moduleUrl = pathToFileURL(modulePath).href;
  const mod = await import(moduleUrl);

  if (!mod?.RBACRepository?.GetDefaultPermissionDefinitions) {
    throw new Error("RBACRepository.GetDefaultPermissionDefinitions() was not found in dist output.");
  }

  return mod.RBACRepository.GetDefaultPermissionDefinitions();
}

async function loadRootRoleName() {
  const modulePath = path.join(process.cwd(), "dist", "Enums", "SystemRoles.js");
  const moduleUrl = pathToFileURL(modulePath).href;
  const mod = await import(moduleUrl);

  if (!mod?.default?.RootAccount) {
    return "Root";
  }

  return mod.default.RootAccount;
}

async function getTargetSchemas(client, explicitSchema) {
  if (explicitSchema) {
    return [explicitSchema];
  }

  const result = await client.query(
    `SELECT db_schema FROM public."University" WHERE db_schema IS NOT NULL ORDER BY id ASC`
  );

  return result.rows.map((row) => row.db_schema);
}

async function syncSchemaPermissions(client, schema, permissions, rootRoleName) {
  const permissionTable = qualify(schema, "Permission");
  const roleTable = qualify(schema, "Role");
  const rolePermissionTable = qualify(schema, "RolePermission");

  const roleTableExists = await client.query(
    `SELECT to_regclass($1) AS table_name`,
    [`${quoteIdent(schema)}.${quoteIdent("Role")}`]
  );

  if (!roleTableExists.rows[0]?.table_name) {
    console.log(`- Skipping schema '${schema}' (Role table not found).`);
    return { inserted: 0, linked: 0, skipped: true };
  }

  let inserted = 0;

  for (const permission of permissions) {
    const result = await client.query(
      `INSERT INTO ${permissionTable} ("name", "description", "created_at", "updated_at")
       VALUES ($1, $2, NOW(), NOW())
       ON CONFLICT ("name") DO UPDATE
       SET "description" = EXCLUDED."description",
           "updated_at" = NOW()
       RETURNING 1`,
      [permission.Name, permission.Description]
    );

    inserted += result.rowCount;
  }

  const roleResult = await client.query(
    `SELECT id FROM ${roleTable} WHERE name = $1 LIMIT 1`,
    [rootRoleName]
  );

  if (roleResult.rowCount === 0) {
    console.log(`- Schema '${schema}': permissions upserted, but role '${rootRoleName}' not found.`);
    return { inserted, linked: 0, skipped: false };
  }

  const rootRoleId = roleResult.rows[0].id;

  const linkResult = await client.query(
    `INSERT INTO ${rolePermissionTable} ("role_id", "permission_id")
     SELECT $1, p.id
     FROM ${permissionTable} p
     WHERE p."name" = ANY($2::text[])
     ON CONFLICT ("role_id", "permission_id") DO NOTHING`,
    [rootRoleId, permissions.map((p) => p.Name)]
  );

  return { inserted, linked: linkResult.rowCount, skipped: false };
}

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set.");
  }

  const explicitSchema = parseSchemaArg(process.argv);
  const client = new Client({ connectionString: process.env.DATABASE_URL });

  await client.connect();

  try {
    const permissions = await loadDefaultPermissions();
    const rootRoleName = await loadRootRoleName();
    const schemas = await getTargetSchemas(client, explicitSchema);

    if (schemas.length === 0) {
      console.log("No schemas found to sync.");
      return;
    }

    console.log(`Syncing ${permissions.length} permissions across ${schemas.length} schema(s)...`);

    for (const schema of schemas) {
      const result = await syncSchemaPermissions(client, schema, permissions, rootRoleName);
      if (!result.skipped) {
        console.log(
          `- Schema '${schema}': upserted ${result.inserted} permission rows, linked ${result.linked} role-permission rows.`
        );
      }
    }

    console.log("Permission sync completed.");
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error("Permission sync failed:", error.message);
  process.exit(1);
});

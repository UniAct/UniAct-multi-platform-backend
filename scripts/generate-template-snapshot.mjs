import { exec } from "child_process";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

dotenv.config(); // loads .env

// Ensure prisma folder exists
const prismaDir = path.join(process.cwd(), "prisma");
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir);
}

const snapshotFile = path.join(prismaDir, "template_snapshot.sql");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set in .env");
  process.exit(1);
}

console.log("📦 Generating template schema snapshot...");

const cmd = [
  `pg_dump`,
  `"${process.env.DATABASE_URL}"`,
  `--schema=template`,
  `--schema-only`,       // schema only
  `--no-owner`,          // do not include ownership
  `--no-privileges`,     // do not include privileges
  `--file="${snapshotFile}"`
].join(" ");


exec(cmd, (err, stdout, stderr) => {
  if (err) {
    console.error("❌ Error generating snapshot:", stderr || err);
    process.exit(1);
  }
  console.log(`✅ Snapshot saved to ${snapshotFile}`);


  let sql = fs.readFileSync(snapshotFile, "utf-8");

  // Remove CREATE SCHEMA template
  sql = sql.replace(/CREATE SCHEMA\s+template;/g, "CREATE SCHEMA __SCHEMA__;");
  
  // Replace all occurrences of template. with __SCHEMA__.
  sql = sql.replace(/template\./g, "__SCHEMA__.");

  // Remove psql meta commands
  sql = sql
    .split("\n")
    .filter(line => !line.startsWith("\\"))
    .join("\n");

  // Save the as a reusable tenant snapshot
  fs.writeFileSync(snapshotFile, sql, "utf-8");


});



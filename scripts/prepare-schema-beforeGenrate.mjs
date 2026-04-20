import { exec, execSync } from "child_process";
import fs from "fs";
import path from "path";
import { stderr } from "process";

const prismaSchema = path.join(process.cwd(), "prisma", "schema.prisma");

console.log("🧹 Removing schema-related lines...");

let content = fs.readFileSync(prismaSchema, "utf-8");

const cleaned = content
  .split("\n")
  .filter(line => {
    const lower = line.toLowerCase();

    // keep the line if it contains db_schema
    if (lower.includes("db_schema")|| lower.includes("prepare")) return true;

    // remove if it contains schema or schemas
    if (/\bschemas?\b/i.test(line)) return false;

    return true;
  })
  .join("\n");

fs.writeFileSync(prismaSchema, cleaned, "utf-8");
console.log("✅ schema lines removed safely");

try {
  console.log("🚀 Running Prisma Generate...");
  // Use execSync so the script blocks until generation is 100% done
  execSync("npx prisma generate", { stdio: 'inherit' }); 
} catch (err) {
  console.error("❌ Generation failed", err);
} finally {
  // Now it's safe to restore
  fs.writeFileSync(prismaSchema, content);
  console.log("🔄 Schema restored");
}
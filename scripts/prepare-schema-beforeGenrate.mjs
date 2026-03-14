import { exec } from "child_process";
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

let cmd = "npx prisma generate"
exec(cmd,(err,stdout,stderr)=>{
  if(err){
    console.error(err)
    process.exit(1);
  }

})

console.log("✅ schema lines removed safely");
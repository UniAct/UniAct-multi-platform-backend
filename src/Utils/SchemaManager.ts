import { Pool, PoolClient } from 'pg';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { constants } from 'fs';
import { PrismaClient } from '../generated/tenants/alexandria_national_university';

export class SchemaManager {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async CreateSchema(universityName: string): Promise<void> {
        const client = await this.pool.connect();
        const schema_name = this.ToSchemaName(universityName);
        const template_path = path.join(__dirname, './../../prisma/Template/PrivateSchema.prisma');
        const tenant_folder = path.join(__dirname, './../../prisma/Tenant', schema_name);
        const env_path = path.join(__dirname, "../../.env");
        const new_schema_path = path.join(tenant_folder, 'schema.prisma');

        const base_url = process.env.DATABASE_SCHEMA_URL;
        if (!base_url) {
            throw new Error('DATABASE_SCHEMA_URL not found in .env');
        }

        const env_var_name = `${schema_name.toUpperCase()}_SCHEMA_URL`;

        try {
            await client.query('BEGIN');

            const { rows } = await client.query(
                `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
                [schema_name]
            );

            if (rows.length > 0) {
                console.log(`[INFO] Schema "${schema_name}" already exists. Skipping creation.`);
                await client.query('ROLLBACK');
                return;
            }

            await client.query(`CREATE SCHEMA "${schema_name}"`);
            console.log(`[INFO] Created schema "${schema_name}"`);

            await mkdir(tenant_folder, { recursive: true });

            let prisma_template = await readFile(template_path, 'utf-8');

            prisma_template = prisma_template.replace(
                /url\s*=\s*env\("DATABASE_URL"\)/,
                `url = env("${env_var_name}")`
            );

            prisma_template = prisma_template.replace(
                /generator\s+client\s+\{[^}]*\}/s,
                (match) => {
                    if (/output\s*=/.test(match)) {
                        return match.replace(
                            /output\s*=.*(\r?\n)?/,
                            `output = "../../../src/generated/tenants/${schema_name}"\n`
                        );
                    } else {
                        return match.replace(
                            /\}/,
                            `  output = "../../../src/generated/tenants/${schema_name}"\n}`
                        );
                    }
                }
            );

            await writeFile(new_schema_path, prisma_template);
            console.log(`[INFO] Tenant Prisma schema written to ${new_schema_path}`);

            let env_content = '';
            try {
                env_content = await readFile(env_path, 'utf-8');
            } catch {
                console.warn('[WARN] .env not found, creating new one.');
            }

            const new_env_line = `${env_var_name}="${base_url}?schema=${schema_name}"`;

            if (!env_content.includes(env_var_name)) {
                env_content += `\n${new_env_line}\n`;
                await writeFile(env_path, env_content, { encoding: 'utf-8' });
                console.log(`[INFO] Added ${env_var_name} to .env`);
            } else {
                console.log(`[INFO] ${env_var_name} already exists in .env`);
            }

            await client.query('COMMIT');
            console.log(`[INFO] Schema "${schema_name}" created successfully.`);
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error creating schema:', err);
            throw err;
        } finally {
            client.release();
        }
    }

    private ToSchemaName(universityName: string): string {
        return universityName.toLowerCase().replace(/\s+/g, '_');
    }

    public static GetTenantPrismaClient(schema_name = 'public') {
        const env_var_name = `${schema_name.toUpperCase().replace(/\s+/g, '_')}_SCHEMA_URL`;
        
        const tenant_url = process.env[env_var_name];
        console.log(env_var_name , ": " , tenant_url);
        const base_url = process.env.DATABASE_SCHEMA_URL;
        if (!base_url) {
            throw new Error('DATABASE_SCHEMA_URL not found in .env');
        }

        const final_url = tenant_url || `${base_url}?schema=${schema_name}`;

        console.log(`[INFO] Using Prisma client for schema: ${schema_name}`);
        console.log(`[DEBUG] Database URL source: ${tenant_url ? env_var_name : 'DATABASE_SCHEMA_URL (fallback)'}`);

        // TODO: there are critical issue here
        return new PrismaClient({
            datasources: {
                db: {
                    url: final_url,
                },
            },
        });
    }
}

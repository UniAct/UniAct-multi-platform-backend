import { Pool, PoolClient } from 'pg';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { constants } from 'fs';
import { PrismaClient } from '../generated/tenants/alexandria_national_university';
import { exec } from 'child_process';
import { promisify } from 'util';
import { cp } from 'fs/promises';

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

            // Copy migrations from alexandria_national_university template
            try {
                const source_migrations_path = path.join(__dirname, './../../prisma/Tenant/alexandria_national_university/migrations');
                const dest_migrations_path = path.join(tenant_folder, 'migrations');
                
                await cp(source_migrations_path, dest_migrations_path, { recursive: true });
                console.log(`[INFO] Migrations copied from template to ${dest_migrations_path}`);
            } catch (copyError: any) {
                console.error(`[WARN] Failed to copy migrations:`, copyError.message);
                throw new Error(`Failed to copy migrations: ${copyError.message}`);
            }

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

            // Automatically run Prisma migrations to create all tables
            try {
                console.log(`[INFO] Running Prisma migrations for schema "${schema_name}"...`);
                await this.RunMigrations(schema_name);
                console.log(`[INFO] Migrations completed for schema "${schema_name}".`);
            } catch (migrationError) {
                console.error(`[ERROR] Failed to run migrations for schema "${schema_name}":`, migrationError);
                throw migrationError;
            }
        } catch (err) {
            await client.query('ROLLBACK');
            console.error('Error creating schema:', err);
            throw err;
        } finally {
            client.release();
        }
    }

    private async RunMigrations(schema_name: string): Promise<void> {
        const tenant_folder = path.join(__dirname, './../../prisma/Tenant', schema_name);
        const execAsync = promisify(exec);

        try {
            const base_url = process.env.DATABASE_SCHEMA_URL;
            if (!base_url) {
                throw new Error('DATABASE_SCHEMA_URL not found in .env');
            }
            
            // Construct the schema URL directly instead of relying on environment variable
            const schemaUrl = `${base_url}?schema=${schema_name}`;

            console.log(`[INFO] Applying migrations to schema "${schema_name}"`);
            console.log(`[DEBUG] Schema folder: ${tenant_folder}`);
            console.log(`[DEBUG] Schema URL: ${schemaUrl}`);

            // Method 1: Try prisma migrate deploy first
            try {
                const command = `npx prisma migrate deploy --schema="${tenant_folder}/schema.prisma"`;
                console.log(`[DEBUG] Attempting prisma migrate deploy...`);
                
                const { stdout, stderr } = await execAsync(command, {
                    env: {
                        ...process.env,
                        DATABASE_SCHEMA_URL: schemaUrl
                    },
                    cwd: path.join(__dirname, '../../'),
                    maxBuffer: 10 * 1024 * 1024
                });

                if (stdout) console.log(`[INFO] Migration output:\n${stdout}`);
                if (stderr && !stderr.includes('No pending migrations')) {
                    console.log(`[INFO] Migration info:\n${stderr}`);
                }

                console.log(`[SUCCESS] ✓ Migrations applied via prisma migrate deploy`);
                return;
            } catch (migrateError: any) {
                console.warn(`[WARN] prisma migrate deploy failed, trying prisma db push...`);
                console.warn(`[WARN] Error: ${migrateError.message}`);
            }

            // Method 2: Fallback to prisma db push (syncs schema without migrations table)
            try {
                const command = `npx prisma db push --schema="${tenant_folder}/schema.prisma" --skip-generate`;
                console.log(`[DEBUG] Attempting prisma db push (fallback)...`);
                
                const { stdout, stderr } = await execAsync(command, {
                    env: {
                        ...process.env,
                        DATABASE_SCHEMA_URL: schemaUrl
                    },
                    cwd: path.join(__dirname, '../../'),
                    maxBuffer: 10 * 1024 * 1024
                });

                if (stdout) console.log(`[INFO] DB push output:\n${stdout}`);
                if (stderr) console.log(`[INFO] DB push info:\n${stderr}`);

                console.log(`[SUCCESS] ✓ Schema synchronized via prisma db push`);
                return;
            } catch (pushError: any) {
                console.error(`[ERROR] Both migration methods failed`);
                console.error(`[ERROR] db push error: ${pushError.message}`);
                throw pushError;
            }
        } catch (error: any) {
            console.error(`[ERROR] Failed to apply migrations for schema "${schema_name}"`);
            console.error(`[ERROR] Error: ${error.message}`);
            if (error.stderr) console.error(`[ERROR] Details: ${error.stderr}`);
            throw new Error(`Failed to apply migrations for schema ${schema_name}: ${error.message}`);
        }
    }

    async DeleteSchema(schema_name: string): Promise<void> {
        const client = await this.pool.connect();
        const env_path = path.join(__dirname, "../../.env");
        const tenant_folder = path.join(__dirname, './../../prisma/Tenant', schema_name);
        const env_var_name = `${schema_name.toUpperCase()}_SCHEMA_URL`;

        try {
            await client.query('BEGIN');

            // Drop the schema from database
            console.log(`[INFO] Dropping schema "${schema_name}" from database...`);
            await client.query(`DROP SCHEMA IF EXISTS "${schema_name}" CASCADE`);
            console.log(`[INFO] Schema "${schema_name}" dropped successfully.`);

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            console.error(`[ERROR] Failed to drop schema "${schema_name}":`, err);
            throw err;
        } finally {
            client.release();
        }

        // Remove the environment variable from .env
        try {
            const env_content = await readFile(env_path, 'utf-8');
            const lines = env_content.split('\n');
            const filtered_lines = lines.filter(line => !line.includes(env_var_name));
            const new_env_content = filtered_lines.join('\n').replace(/\n\n+/g, '\n');
            await writeFile(env_path, new_env_content, { encoding: 'utf-8' });
            console.log(`[INFO] Removed ${env_var_name} from .env`);
        } catch (envError: any) {
            console.warn(`[WARN] Failed to remove ${env_var_name} from .env:`, envError.message);
        }

        // Remove the tenant folder
        try {
            const { rm } = await import('fs/promises');
            await rm(tenant_folder, { recursive: true, force: true });
            console.log(`[INFO] Removed tenant folder: ${tenant_folder}`);
        } catch (folderError: any) {
            console.warn(`[WARN] Failed to remove tenant folder:`, folderError.message);
        }

        console.log(`[SUCCESS] ✓ Schema "${schema_name}" completely deleted`);
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

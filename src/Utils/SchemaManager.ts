import { Pool, PoolClient } from 'pg';
import { readFile, writeFile, mkdir, access } from 'fs/promises';
import path from 'path';
import { constants } from 'fs';

export class SchemaManager {
    private pool: Pool;

    constructor(pool: Pool) {
        this.pool = pool;
    }

    async CreateSchema(universityName: string): Promise<void> {
        const client = await this.pool.connect();
        const schemaName = this.ToSchemaName(universityName);
        const template_path = path.join(__dirname, './../../prisma/Template/PrivateSchema.prisma');
        const tenant_folder = path.join(__dirname, './../../prisma/Tenant', schemaName);
        const new_schema_path = path.join(tenant_folder, 'schema.prisma');
        const baseUrl = process.env.DATABASE_SCHEMA_URL;

        try {
            await client.query('BEGIN');

            const { rows } = await client.query(
                `SELECT schema_name FROM information_schema.schemata WHERE schema_name = $1`,
                [schemaName]
            );

            if (rows.length > 0) {
                console.log(`[INFO] Schema "${schemaName}" already exists. Skipping creation.`);
                await client.query('ROLLBACK');
                return;
            }

            await client.query(`CREATE SCHEMA "${schemaName}"`);
            await client.query(`SET search_path TO "${schemaName}"`);

            await mkdir(tenant_folder, { recursive: true });
            let prismaTemplate = await readFile(template_path, 'utf-8');

            prismaTemplate = prismaTemplate.replace(
                /url\s*=\s*env\("DATABASE_URL"\)/,
                `url = "${baseUrl}?schema=${schemaName}"`
            );

            await writeFile(new_schema_path, prismaTemplate);
            console.log(`[INFO] Tenant Prisma schema written to ${new_schema_path}`);

            await this.GenerateTemplate(client);

            await client.query(`SET search_path TO public`);

            await client.query('COMMIT');
            console.log(`[INFO] Schema "${schemaName}" created and Prisma template prepared.`);
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

    private async GenerateTemplate(client: PoolClient): Promise<void> {
        const templatePath = path.join(__dirname, 'DdlTemplate.SQL');
        const sql = await readFile(templatePath, 'utf-8');
        await client.query(sql);
    }
}

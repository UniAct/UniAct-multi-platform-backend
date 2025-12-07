import { Request, Response, NextFunction } from "express";
import { TenantService } from "../Services/TenantService";
import { Tenant } from "../generated/public";
import { HostsManager } from "../Utils/HostManager";

/**
 * MULTI-TENANT RESOLVER
 * 
 * Detects tenant from subdomain in request host header.
 * Supports three access patterns:
 * 
 * 1. SUPERADMIN ACCESS (no tenant):
 *    - http://localhost:3000 (development)
 *    - http://127.0.0.1:3000 (development)
 *    - http://uniact.edu.eg (production)
 *    → Routes to superadmin endpoints (/superadmin, /tenant, /university)
 * 
 * 2. TENANT ACCESS (with subdomain):
 *    - http://anu:3000 (development - hosts file entry)
 *    - http://auc:3000 (development - hosts file entry)
 *    - http://anu.uniact.edu.eg (production)
 *    → Routes to tenant-specific endpoints (/user, /rbac, /university/:tenantId)
 *    → Automatically isolates database schema per tenant
 * 
 * 3. WWW PREFIX (backward compatibility):
 *    - http://www.anu.local:3000
 *    - http://www.auc.local:3000
 *    → Extracts tenant from subdomain after "www"
 */
export async function TenantResolver(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const host = req.headers.host;

    if (!host) {
      return res.status(400).json({
        status: "fail",
        message: "Missing Host header. Cannot determine tenant.",
      });
    }

    const cleanHost = host.split(":")[0].toLowerCase();
    console.log(`[TenantResolver] Processing host: '${cleanHost}'`);

    /**
     * SUPERADMIN DETECTION
     * If accessing from main domain or localhost, treat as superadmin
     */
    const isSuperAdminHost =
      cleanHost === 'localhost' ||
      cleanHost === '127.0.0.1' ||
      cleanHost === 'uniact.edu.eg' ||
      cleanHost === 'uniact.local' ||
      cleanHost === 'public';

    if (isSuperAdminHost) {
      console.log(`[TenantResolver] SuperAdmin access detected from '${cleanHost}'`);
      req.tenant = undefined; // No tenant for superadmin
      return next();
    }

    /**
     * TENANT EXTRACTION
     * Supports multiple host formats:
     * - Simple: "anu" or "auc" (requires hosts file entry)
     * - WWW prefix: "www.anu.local" → extract "anu"
     * - Full domain: "anu.uniact.edu.eg" → extract "anu"
     */
    const parts = cleanHost.split(".");
    let subdomain: string | null = null;

    if (parts.length >= 3 && parts[0] === "www") {
      // Format: www.anu.local → anu
      subdomain = parts[1];
    } else if (parts.length === 1) {
      // Format: anu (single part, from hosts file)
      subdomain = parts[0];
    } else if (parts.length >= 2) {
      // Format: anu.uniact.edu.eg → anu (take first part)
      subdomain = parts[0];
    }

    if (!subdomain) {
      return res.status(400).json({
        status: "fail",
        message: `Cannot extract tenant subdomain from host '${cleanHost}'.`,
      });
    }

    console.log(`[TenantResolver] Extracted subdomain: '${subdomain}'`);

    // Ensure the host exists in system hosts file
    if (!HostsManager.ValidateTenantHost(cleanHost)) {
      console.error(`[TenantResolver] Host '${cleanHost}' not found in system hosts file.`);
      return res.status(400).json({
        status: "fail",
        message: `Access Denied: Host '${cleanHost}' not registered. Add to hosts file to enable access.`,
      });
    }

    console.log(`[TenantResolver] Host '${cleanHost}' verified in hosts file.`);

    // Fetch tenant by subdomain
    const tenant: Tenant | null = await TenantService.GetBySubdomain(subdomain);

    if (!tenant || !tenant.is_active) {
      return res.status(404).json({
        status: "fail",
        message: `Tenant not found or inactive for subdomain '${subdomain}'.`,
      });
    }

    // Attach tenant info to request
    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      schema_name: tenant.db_schema,
      subdomain: tenant.subdomain,
      university_id: tenant.university_id!,
    };

    console.log(`[TenantResolver] ✓ Tenant resolved: ${tenant.name} (schema: ${tenant.db_schema})`);
    next();
  } catch (err) {
    console.error("[TenantResolver] Error:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error while resolving tenant.",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

import { Request, Response, NextFunction } from "express";
import { TenantService } from "../Services/TenantService";
import { Tenant } from "../generated/public";
import { HostsManager } from "../Utils/HostManager";

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

    // Ensure the host exists in system hosts file
    if (!HostsManager.ValidateTenantHost(cleanHost)) {
    console.error(`[ERROR] Host '${cleanHost}' not found in system hosts file.`);
      return res.status(400).json({
        status: "fail",
        message: `Access Denied`,
      });
    }

    console.log(`[OK] Host '${cleanHost}' verified in hosts file.`);

    /**
     * Extract tenant subdomain:
     * Example:
     *  - www.anu.local          → "anu" --> development
     *  - www.cairo.local        → "cairo" --> development
     *  - anu.uniact.edu.eg      → "anu" --> production url
     */
    const parts = cleanHost.split(".");
    let subdomain: string | null = null;

    if (parts.length >= 3 && parts[0] === "www") {
      subdomain = parts[1]; // skip "www"
    } else {
      subdomain = parts[0]; // e.g. anu.uniact.edu.eg → anu
    }

    if (!subdomain) {
      return res.status(400).json({
        status: "fail",
        message: `Cannot extract tenant subdomain from host '${cleanHost}'.`,
      });
    }

    console.log(`[INFO] Extracted subdomain: '${subdomain}'`);

    const tenant: Tenant | null = await TenantService.GetBySubdomain(subdomain);

    if (!tenant || !tenant.is_active) {
      return res.status(404).json({
        status: "fail",
        message: `Tenant not found or inactive for subdomain '${subdomain}'.`,
      });
    }

    req.tenant = {
      id: tenant.id,
      name: tenant.name,
      schema_name: tenant.db_schema,
      subdomain: tenant.subdomain,
      university_id: tenant.university_id!,
    };

    console.log(`[INFO] Tenant resolved successfully: ${tenant.name}`);
    next();
  } catch (err) {
    console.error("TenantResolver error:", err);
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error while resolving tenant.",
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

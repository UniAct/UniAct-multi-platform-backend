function trimTrailingSlash(url: string): string {
  return url.replace(/\/+$/, "");
}

function slugifyTenant(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function GetBackendPublicUrl(): string {
  const configuredUrl =
    process.env.BACKEND_PUBLIC_URL ||
    process.env.API_PUBLIC_URL ||
    process.env.RENDER_EXTERNAL_URL ||
    (process.env.RENDER_EXTERNAL_HOSTNAME
      ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
      : undefined);

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  return `http://localhost:${process.env.PORT || 30092}`;
}

export function GetFrontendPublicUrl(tenantName?: string): string {
  const baseDomain = process.env.FRONTEND_BASE_DOMAIN || process.env.APP_BASE_DOMAIN;

  if (baseDomain && tenantName) {
    const tenant = slugifyTenant(tenantName);
    if (tenant) {
      return `https://${tenant}.${baseDomain.replace(/^\.+/, "")}`;
    }
  }

  if (process.env.FRONTEND_URL) {
    return trimTrailingSlash(process.env.FRONTEND_URL);
  }

  return "http://localhost:5173";
}

export function GetStoragePublicUrl(bucketName: string, objectName: string): string {
  return `${GetBackendPublicUrl()}/api/storage/${encodeURIComponent(bucketName)}/${encodeURIComponent(objectName)}`;
}

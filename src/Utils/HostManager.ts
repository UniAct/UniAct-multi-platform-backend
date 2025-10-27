import fs from "fs";
import os from "os";

export class HostsManager {

  private static get HostsPath(): string {
    const platform = os.platform();
    if (platform === "win32") {
      return "C:\\Windows\\System32\\drivers\\etc\\hosts";
    } else {
      return "/etc/hosts";
    }
  }

  private static IsProduction(): boolean {
    return (process.env.NODE_ENV ?? "").toLowerCase() === "production";
  }

  /**
   * Registers a domain (e.g., www.uni1.local) locally by mapping it to an IP.
   * disabled in production.
   */
  public static RegisterDomain(domain: string, ip: string = "127.0.0.1") {
    if (this.IsProduction()) {
      console.log("[INFO] Skipping hosts modification for production.");
      return;
    }

    const filePath = this.HostsPath;

    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`[WARN] Hosts file not found at: ${filePath}`);
        return;
      }

      const content = fs.readFileSync(filePath, "utf-8");

      if (content.includes(domain)) {
        console.log(`[INFO] Domain ${domain} already exists in hosts file.`);
        return;
      }

      const newEntry = `\n${ip}   ${domain}`;
      fs.appendFileSync(filePath, newEntry);
      console.log(`[OK] Added ${domain} → ${ip} to hosts file.`);
    } catch (error) {
      console.error(
        `[ERROR] Unable to update hosts file (${filePath}): ${(error as Error).message}`
      );
    }
  }

  /**
   * Removes a previously registered domain from the hosts file (for local dev cleanup).
   */
  public static RemoveDomain(domain: string) {
    if (this.IsProduction()) {
      console.log("[INFO] Skipping hosts modification for production.");
      return;
    }

    const filePath = this.HostsPath;

    try {
      if (!fs.existsSync(filePath)) {
        console.warn(`[WARN] Hosts file not found at: ${filePath}`);
        return;
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const updated = content
        .split(/\r?\n/)
        .filter((line) => !line.includes(domain))
        .join(os.EOL);

      fs.writeFileSync(filePath, updated, "utf-8");
      console.log(`[OK] Removed ${domain} from hosts file.`);
    } catch (error) {
      console.error(
        `[ERROR] Unable to modify hosts file (${filePath}): ${(error as Error).message}`
      );
    }
  }

  /**
   * Utility method to build the correct domain depending on environment.
   * - development: www.uni1.local
   * - production:  uni1.example.com
   */
  public static BuildDomain(subdomain: string): string {
    const prod = this.IsProduction();
    const baseDomain = prod
      ? process.env.BASE_DOMAIN ?? "example.com"
      : "local";
    const prefix = prod ? "" : "www.";
    return `${prefix}${subdomain}.${baseDomain}`;
  }

  public static ValidateTenantHost(host: string): boolean {
    try {
      const filePath = this.HostsPath;

      if (!fs.existsSync(filePath)) {
        console.warn(`[WARN] Hosts file not found at: ${filePath}`);
        return false;
      }

      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split(/\r?\n/);

      const normalizedHost = host.trim().toLowerCase();

      return lines.some((line) => {
        const cleanLine = line.replace(/#.*/, "").trim().toLowerCase();
        if (!cleanLine) return false;
        const parts = cleanLine.split(/\s+/);
        const foundHost = parts[1];
        return foundHost === normalizedHost;
      });
    } catch (error) {
      console.error(`[ERROR] ValidateTenantHost failed: ${(error as Error).message}`);
      return false;
    }
  }
}

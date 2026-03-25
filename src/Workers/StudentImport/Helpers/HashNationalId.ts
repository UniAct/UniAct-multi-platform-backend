import { Worker as NodeWorker } from "worker_threads";
import path from "path";

/**
 * Hashes an array of national IDs using a worker thread.
 * @param nationalIds Array of national IDs to hash.
 * @param saltRounds Number of bcrypt salt rounds (default: 10).
 * @returns A Promise resolving to a Map of original ID -> hashed value.
 */
export function hashNationalIds(
  nationalIds: string[],
  saltRounds = 10
): Promise<Map<string, string>> {
  return new Promise((resolve, reject) => {
    const worker = new NodeWorker(
      path.resolve(__dirname, "HashWorker.ts"),
      { workerData: { nationalIds, saltRounds } }
    );

    worker.on("message", ({ hashes, error }: { hashes: string[]; error?: string }) => {
      if (error) return reject(new Error(error));

      const hashMap = new Map<string, string>();
      nationalIds.forEach((id, i) => hashMap.set(id, hashes[i]));
      resolve(hashMap);
    });

    worker.on("error", reject);
  });
}
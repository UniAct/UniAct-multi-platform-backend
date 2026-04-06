import bcrypt from "bcrypt";

/**
 * Hashes an array of national IDs.
 * @param nationalIds Array of national IDs to hash.
 * @param saltRounds Number of bcrypt salt rounds (default: 10).
 * @returns A Promise resolving to a Map of original ID -> hashed value.
 */
export function hashNationalIds(
  nationalIds: string[],
  saltRounds = 10
): Promise<Map<string, string>> {
  return Promise.all(nationalIds.map((id) => bcrypt.hash(id, saltRounds))).then((hashes) => {
    const hashMap = new Map<string, string>();
    nationalIds.forEach((id, index) => hashMap.set(id, hashes[index]));
    return hashMap;
  });
}
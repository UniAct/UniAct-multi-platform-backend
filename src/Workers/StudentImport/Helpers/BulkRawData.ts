import { ToCamelKey } from "./ToCamelKey";

/**
 * Builds a plain object from a row's cell values using the header map.
 * Keys are converted to camelCase; missing cells default to an empty string.
 */
export function BuildRawData(
  values: any[],
  headerMap: Map<string, number>
): Record<string, any> {
  const data: Record<string, any> = {};

  headerMap.forEach((columnIndex, header) => {
    data[ToCamelKey(header)] = values[columnIndex] ?? "";
  });

  return data;
}
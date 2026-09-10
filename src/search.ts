import { words } from "./data.js";

export function searchWords(query: string): string[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return [];
  }
  return words.filter((word) => word.startsWith(normalized));
}

const STORAGE_KEY = "_thesis_search_history";
const MAX_ENTRIES = 20;

export function getHistory(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addToHistory(query: string): void {
  const trimmed = query.trim();
  if (!trimmed) return;
  let history = getHistory().filter((q) => q !== trimmed);
  history.unshift(trimmed);
  if (history.length > MAX_ENTRIES) history = history.slice(0, MAX_ENTRIES);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}

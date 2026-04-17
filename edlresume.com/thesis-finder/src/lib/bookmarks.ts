import { OpenAlexWork, convertAbstractInvertedIndex } from "./openalex";

const STORAGE_KEY = "_thesis_bookmarks";

export function getBookmarks(): OpenAlexWork[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function addBookmark(work: OpenAlexWork): void {
  const all = getBookmarks();
  if (!all.find((w) => w.id === work.id)) {
    all.unshift(work);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
  }
}

export function removeBookmark(id: string): void {
  const all = getBookmarks().filter((w) => w.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

export function isBookmarked(id: string): boolean {
  return getBookmarks().some((w) => w.id === id);
}

export function exportToCSV(works: OpenAlexWork[]): void {
  const escape = (s: string) => `"${s.replace(/"/g, '""')}"`;
  const header = "Title,Authors,Year,DOI,Journal,Citations,Abstract";
  const rows = works.map((w) => {
    const authors = w.authorships.map((a) => a.author.display_name).join("; ");
    const journal = w.primary_location?.source?.display_name ?? "";
    const abstract = convertAbstractInvertedIndex(w.abstract_inverted_index);
    const doi = w.doi ?? "";
    return [
      escape(w.title ?? ""),
      escape(authors),
      w.publication_year ?? "",
      escape(doi),
      escape(journal),
      w.cited_by_count ?? 0,
      escape(abstract.slice(0, 500)),
    ].join(",");
  });

  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `thesis-bookmarks-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

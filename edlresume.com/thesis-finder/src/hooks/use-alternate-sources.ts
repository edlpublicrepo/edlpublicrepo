import { useQuery } from "@tanstack/react-query";

export interface AlternateSource {
  name: string;
  url: string;
  pdfUrl?: string;
  isFree: boolean;
  version?: string;
  type: "repository" | "preprint" | "publisher" | "archive" | "aggregator";
}

interface SemanticScholarPaper {
  openAccessPdf?: { url: string };
  url?: string;
  externalIds?: { DOI?: string; ArXiv?: string; PubMed?: string };
}

interface CoreSearchResult {
  results?: Array<{
    title: string;
    downloadUrl?: string;
    sourceFulltextUrls?: string[];
    links?: Array<{ type: string; url: string }>;
    dataProviders?: Array<{ name: string }>;
  }>;
}

export function useSemanticScholar(doi: string | undefined) {
  const cleanDoi = doi?.replace(/^https?:\/\/doi\.org\//, "");
  return useQuery({
    queryKey: ["semantic-scholar", cleanDoi],
    queryFn: async (): Promise<AlternateSource | null> => {
      const res = await fetch(
        `https://api.semanticscholar.org/graph/v1/paper/DOI:${cleanDoi}?fields=openAccessPdf,url,externalIds`,
      );
      if (!res.ok) return null;
      const data: SemanticScholarPaper = await res.json();
      if (!data.openAccessPdf?.url && !data.url) return null;
      return {
        name: "Semantic Scholar",
        url: data.url ?? `https://www.semanticscholar.org/`,
        pdfUrl: data.openAccessPdf?.url,
        isFree: !!data.openAccessPdf?.url,
        type: "aggregator",
      };
    },
    enabled: !!cleanDoi,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}

export function useCoreSearch(title: string | undefined) {
  return useQuery({
    queryKey: ["core", title],
    queryFn: async (): Promise<AlternateSource[]> => {
      const res = await fetch(
        `https://api.core.ac.uk/v3/search/works?q=${encodeURIComponent(title!)}&limit=5`,
        { headers: { Accept: "application/json" } },
      );
      if (!res.ok) return [];
      let data: CoreSearchResult;
      try {
        data = await res.json();
      } catch {
        return [];
      }
      if (!data.results || !Array.isArray(data.results)) return [];
      return data.results
        .filter((r) => {
          const url = r.downloadUrl || r.sourceFulltextUrls?.[0];
          return url && url.startsWith("http");
        })
        .slice(0, 3)
        .map((r) => ({
          name: r.dataProviders?.[0]?.name || "CORE Repository",
          url: r.downloadUrl ?? r.sourceFulltextUrls?.[0] ?? "",
          pdfUrl: r.downloadUrl || undefined,
          isFree: true,
          type: "repository" as const,
        }));
    },
    enabled: !!title && title.length > 10,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}

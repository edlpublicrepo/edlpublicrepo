import { useQuery } from "@tanstack/react-query";
import { OpenAlexWork, OpenAlexResponse, OpenAlexKeyword } from "@/lib/openalex";
import { getInstitutionFilter } from "@/lib/institutions";

function stripPrefix(id: string): string {
  return id.replace("https://openalex.org/", "");
}

export function useOpenAlexWork(id: string | undefined) {
  return useQuery({
    queryKey: ["openalex", "work", id],
    queryFn: async (): Promise<OpenAlexWork> => {
      const response = await fetch(`https://api.openalex.org/works/${stripPrefix(id!)}`);
      if (!response.ok) throw new Error("Failed to fetch work");
      return response.json();
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useCitedByWorks(work: OpenAlexWork | undefined, page = 1) {
  return useQuery({
    queryKey: ["openalex", "cited-by", work?.id, page],
    queryFn: async (): Promise<OpenAlexResponse> => {
      const url = new URL("https://api.openalex.org/works");
      url.searchParams.append("filter", `cites:${stripPrefix(work!.id)}`);
      url.searchParams.append("per_page", "10");
      url.searchParams.append("page", page.toString());
      url.searchParams.append("sort", "cited_by_count:desc");
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch cited-by works");
      return response.json();
    },
    enabled: !!work?.id,
    staleTime: 1000 * 60 * 10,
  });
}

export function useReferencedWorks(work: OpenAlexWork | undefined, page = 1) {
  const refIds = work?.referenced_works?.slice(0, 25) ?? [];
  return useQuery({
    queryKey: ["openalex", "references", work?.id, page],
    queryFn: async (): Promise<OpenAlexResponse> => {
      if (refIds.length === 0) {
        return { meta: { count: 0, db_response_time_ms: 0, page: 1, per_page: 25 }, results: [] };
      }
      const filter = refIds.map((r) => stripPrefix(r)).join("|");
      const url = new URL("https://api.openalex.org/works");
      url.searchParams.append("filter", `openalex:${filter}`);
      url.searchParams.append("per_page", "25");
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch referenced works");
      return response.json();
    },
    enabled: !!work && refIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

export function useRelatedWorks(work: OpenAlexWork | undefined) {
  const relatedIds = work?.related_works?.slice(0, 10) ?? [];
  return useQuery({
    queryKey: ["openalex", "related", work?.id],
    queryFn: async (): Promise<OpenAlexResponse> => {
      if (relatedIds.length === 0) {
        return { meta: { count: 0, db_response_time_ms: 0, page: 1, per_page: 10 }, results: [] };
      }
      const filter = relatedIds.map((r) => stripPrefix(r)).join("|");
      const url = new URL("https://api.openalex.org/works");
      url.searchParams.append("filter", `openalex:${filter}`);
      url.searchParams.append("per_page", "10");
      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch related works");
      return response.json();
    },
    enabled: !!work && relatedIds.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

export function useKeywordRelatedWorks(
  selectedKeywords: string[],
  christianOnly: boolean,
  excludeWorkId?: string,
) {
  const searchQuery = selectedKeywords.join(" ");

  return useQuery({
    queryKey: ["openalex", "keyword-related", searchQuery, christianOnly],
    queryFn: async (): Promise<OpenAlexResponse> => {
      const url = new URL("https://api.openalex.org/works");
      url.searchParams.append("search", searchQuery);
      url.searchParams.append("per_page", "15");
      url.searchParams.append("sort", "cited_by_count:desc");

      if (christianOnly) {
        url.searchParams.append("filter", `authorships.institutions.id:${getInstitutionFilter()}`);
      }

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error("Failed to fetch keyword-related works");
      const data: OpenAlexResponse = await response.json();
      if (excludeWorkId) {
        data.results = data.results.filter((w) => w.id !== excludeWorkId);
      }
      return data;
    },
    enabled: selectedKeywords.length > 0,
    staleTime: 1000 * 60 * 10,
  });
}

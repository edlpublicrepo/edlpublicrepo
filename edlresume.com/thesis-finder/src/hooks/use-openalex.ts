import { useQuery } from "@tanstack/react-query";
import { OpenAlexResponse, OpenAlexSource } from "@/lib/openalex";
import { getInstitutionFilter } from "@/lib/institutions";

export interface SearchParams {
  query: string;
  page?: number;
  yearFrom?: string;
  yearTo?: string;
  sortBy?: "relevance" | "cited_by_count";
  isOpenAccess?: boolean;
  documentType?: string;
  sourceId?: string;
  christianInstitutions?: boolean;
}

export function useOpenAlexSearch(params: SearchParams) {
  return useQuery({
    queryKey: ["openalex", "search", params],
    queryFn: async (): Promise<OpenAlexResponse> => {
      if (!params.query) {
        return {
          meta: { count: 0, db_response_time_ms: 0, page: 1, per_page: 25 },
          results: [],
        };
      }

      const url = new URL("https://api.openalex.org/works");
      url.searchParams.append("search", params.query);
      url.searchParams.append("per_page", "25");
      url.searchParams.append("page", (params.page || 1).toString());

      if (params.sortBy === "cited_by_count") {
        url.searchParams.append("sort", "cited_by_count:desc");
      }

      const filters: string[] = [];
      if (params.yearFrom) filters.push(`publication_year:>=${params.yearFrom}`);
      if (params.yearTo) filters.push(`publication_year:<=${params.yearTo}`);
      if (params.isOpenAccess) filters.push("open_access.is_oa:true");
      if (params.documentType) filters.push(`type:${params.documentType}`);
      if (params.sourceId) filters.push(`primary_location.source.id:${params.sourceId}`);
      if (params.christianInstitutions) filters.push(`authorships.institutions.id:${getInstitutionFilter()}`);

      if (filters.length > 0) {
        url.searchParams.append("filter", filters.join(","));
      }

      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error("Failed to fetch from OpenAlex API");
      }
      return response.json();
    },
    enabled: !!params.query,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSourceSearch(query: string) {
  return useQuery({
    queryKey: ["openalex", "sources", query],
    queryFn: async (): Promise<OpenAlexSource[]> => {
      const url = new URL("https://api.openalex.org/sources");
      url.searchParams.append("search", query);
      url.searchParams.append("per_page", "10");
      const response = await fetch(url.toString());
      if (!response.ok) return [];
      const data = await response.json();
      return data.results ?? [];
    },
    enabled: query.length >= 2,
    staleTime: 1000 * 60 * 10,
  });
}

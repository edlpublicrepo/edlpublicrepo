import { useQuery } from "@tanstack/react-query";
import { OpenAlexWork } from "@/lib/openalex";

interface CrossrefWork {
  title?: string[];
  author?: Array<{ given?: string; family?: string }>;
  "published-print"?: { "date-parts": number[][] };
  "published-online"?: { "date-parts": number[][] };
  "container-title"?: string[];
  DOI?: string;
  "is-referenced-by-count"?: number;
  type?: string;
  publisher?: string;
}

interface CrossrefResponse {
  message: {
    "total-results": number;
    items: CrossrefWork[];
  };
}

function crossrefToOpenAlex(item: CrossrefWork): OpenAlexWork {
  const dateParts =
    item["published-print"]?.["date-parts"]?.[0] ??
    item["published-online"]?.["date-parts"]?.[0] ??
    [];
  const year = dateParts[0] ?? 0;
  const doi = item.DOI ? `https://doi.org/${item.DOI}` : undefined;

  return {
    id: `crossref:${item.DOI ?? Math.random().toString(36).slice(2)}`,
    title: item.title?.[0] ?? "Untitled",
    publication_year: year,
    authorships: (item.author ?? []).map((a) => ({
      author: {
        id: "",
        display_name: `${a.given ?? ""} ${a.family ?? ""}`.trim() || "Unknown",
      },
    })),
    primary_location: {
      is_oa: false,
      source: item["container-title"]?.[0]
        ? { id: "", display_name: item["container-title"][0] }
        : undefined,
    },
    cited_by_count: item["is-referenced-by-count"] ?? 0,
    doi,
    type: item.type,
  };
}

export interface CrossrefSearchParams {
  query: string;
  page?: number;
  sortBy?: string;
}

export function useCrossrefSearch(params: CrossrefSearchParams, enabled: boolean) {
  return useQuery({
    queryKey: ["crossref", "search", params],
    queryFn: async (): Promise<{ count: number; results: OpenAlexWork[] }> => {
      if (!params.query) return { count: 0, results: [] };

      const url = new URL("https://api.crossref.org/works");
      url.searchParams.append("query", params.query);
      url.searchParams.append("rows", "20");
      const offset = ((params.page || 1) - 1) * 20;
      if (offset > 0) url.searchParams.append("offset", offset.toString());

      if (params.sortBy === "cited_by_count") {
        url.searchParams.append("sort", "is-referenced-by-count");
        url.searchParams.append("order", "desc");
      } else if (params.sortBy === "publication_year_desc" || params.sortBy === "publication_date_desc") {
        url.searchParams.append("sort", "published");
        url.searchParams.append("order", "desc");
      } else if (params.sortBy === "publication_year_asc") {
        url.searchParams.append("sort", "published");
        url.searchParams.append("order", "asc");
      }

      url.searchParams.append("mailto", "thesis-finder@edlresume.com");

      const response = await fetch(url.toString());
      if (!response.ok) return { count: 0, results: [] };
      const data: CrossrefResponse = await response.json();

      return {
        count: data.message["total-results"],
        results: data.message.items
          .filter((item) => item.title?.[0])
          .map(crossrefToOpenAlex),
      };
    },
    enabled: enabled && !!params.query,
    staleTime: 1000 * 60 * 5,
  });
}

export interface OpenAlexLocation {
  is_oa: boolean;
  landing_page_url?: string;
  pdf_url?: string;
  version?: "publishedVersion" | "acceptedVersion" | "submittedVersion" | string;
  source?: {
    id: string;
    display_name: string;
    type?: string;
  };
}

export interface OpenAlexKeyword {
  id: string;
  display_name: string;
  score: number;
}

export interface OpenAlexWork {
  id: string;
  title: string;
  publication_year: number;
  authorships: Array<{
    author: {
      id: string;
      display_name: string;
    };
    institutions?: Array<{
      id: string;
      display_name: string;
    }>;
  }>;
  primary_location?: OpenAlexLocation;
  locations?: OpenAlexLocation[];
  abstract_inverted_index?: Record<string, number[]>;
  cited_by_count: number;
  cited_by_api_url?: string;
  referenced_works?: string[];
  related_works?: string[];
  keywords?: OpenAlexKeyword[];
  doi?: string;
  type?: string;
  open_access?: {
    is_oa?: boolean;
    oa_url?: string;
  };
}

export interface OpenAlexResponse {
  meta: {
    count: number;
    db_response_time_ms: number;
    page: number;
    per_page: number;
  };
  results: OpenAlexWork[];
}

export interface OpenAlexSource {
  id: string;
  display_name: string;
  works_count: number;
}

export function convertAbstractInvertedIndex(
  invertedIndex?: Record<string, number[]>,
): string {
  if (!invertedIndex) return "";

  const wordEntries: { word: string; position: number }[] = [];

  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      wordEntries.push({ word, position: pos });
    }
  }

  wordEntries.sort((a, b) => a.position - b.position);

  return wordEntries.map((entry) => entry.word).join(" ");
}

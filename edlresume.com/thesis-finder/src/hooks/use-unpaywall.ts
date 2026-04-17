import { useQuery } from "@tanstack/react-query";

interface UnpaywallResult {
  best_oa_location?: {
    url_for_pdf?: string;
    url?: string;
  };
}

export function useUnpaywall(doi: string | undefined) {
  const cleanDoi = doi?.replace(/^https?:\/\/doi\.org\//, "");
  return useQuery({
    queryKey: ["unpaywall", cleanDoi],
    queryFn: async (): Promise<string | null> => {
      const response = await fetch(
        `https://api.unpaywall.org/v2/${cleanDoi}?email=thesis-finder@edlresume.com`,
      );
      if (!response.ok) return null;
      const data: UnpaywallResult = await response.json();
      return data.best_oa_location?.url_for_pdf ?? data.best_oa_location?.url ?? null;
    },
    enabled: !!cleanDoi,
    staleTime: 1000 * 60 * 30,
    retry: false,
  });
}

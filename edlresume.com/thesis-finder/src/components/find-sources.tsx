import { OpenAlexWork, OpenAlexLocation } from "@/lib/openalex";
import { useSemanticScholar } from "@/hooks/use-alternate-sources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileDown, Lock, Unlock, Globe, BookOpen, Archive, Search } from "lucide-react";

function versionLabel(version?: string): string {
  switch (version) {
    case "publishedVersion": return "Published";
    case "acceptedVersion": return "Author Accepted";
    case "submittedVersion": return "Preprint";
    default: return version ?? "Unknown";
  }
}

function sourceTypeIcon(type: string) {
  switch (type) {
    case "repository": return <Archive className="w-4 h-4" />;
    case "preprint": return <BookOpen className="w-4 h-4" />;
    case "aggregator": return <Search className="w-4 h-4" />;
    default: return <Globe className="w-4 h-4" />;
  }
}

function locationToType(loc: OpenAlexLocation): string {
  const srcType = loc.source?.type?.toLowerCase() ?? "";
  if (srcType.includes("repository")) return "repository";
  if (srcType.includes("journal")) return "publisher";
  return "archive";
}

interface SourceRowProps {
  name: string;
  url: string;
  pdfUrl?: string;
  isFree: boolean;
  version?: string;
  type: string;
}

function SourceRow({ name, url, pdfUrl, isFree, version, type }: SourceRowProps) {
  return (
    <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex-shrink-0 text-muted-foreground">{sourceTypeIcon(type)}</div>
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{name}</div>
          <div className="flex items-center gap-2 mt-0.5">
            {version && (
              <span className="text-xs text-muted-foreground">{versionLabel(version)}</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {isFree ? (
          <Badge variant="outline" className="border-green-600/30 text-green-700 text-xs gap-1">
            <Unlock className="w-3 h-3" /> Free
          </Badge>
        ) : (
          <Badge variant="outline" className="border-orange-500/30 text-orange-600 text-xs gap-1">
            <Lock className="w-3 h-3" /> Paid
          </Badge>
        )}
        {pdfUrl && (
          <Button variant="outline" size="sm" className="h-7 text-xs gap-1" asChild>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
              <FileDown className="w-3 h-3" /> PDF
            </a>
          </Button>
        )}
        <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="w-3 h-3" /> Open
          </a>
        </Button>
      </div>
    </div>
  );
}

export function FindSources({ work }: { work: OpenAlexWork }) {
  const { data: semanticScholar } = useSemanticScholar(work.doi);

  const openAlexSources: SourceRowProps[] = (work.locations ?? [])
    .filter((loc) => loc.landing_page_url || loc.pdf_url)
    .map((loc) => {
      const url = loc.landing_page_url ?? loc.pdf_url ?? "";
      let name = loc.source?.display_name ?? "";
      if (!name) {
        try {
          name = new URL(url).hostname.replace(/^www\./, "");
        } catch {
          name = "Unknown Source";
        }
      }
      return {
        name,
        url,
        pdfUrl: loc.pdf_url,
        isFree: loc.is_oa,
        version: loc.version,
        type: locationToType(loc),
      };
    });

  if (semanticScholar) {
    const isDuplicate = openAlexSources.some(
      (s) => s.url === semanticScholar.url || s.pdfUrl === semanticScholar.pdfUrl,
    );
    if (!isDuplicate) {
      openAlexSources.push(semanticScholar);
    }
  }

  const allSources = openAlexSources.filter(
    (s) => s.name && s.url && s.url.startsWith("http"),
  );
  const freeSources = allSources.filter((s) => s.isFree);
  const paidSources = allSources.filter((s) => !s.isFree);

  if (allSources.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-serif flex items-center gap-2">
          <Globe className="w-5 h-5" />
          Available Sources
          {freeSources.length > 0 && (
            <Badge variant="outline" className="border-green-600/30 text-green-700 text-xs ml-2">
              {freeSources.length} free {freeSources.length === 1 ? "copy" : "copies"} found
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {freeSources.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-green-700 uppercase tracking-wider">Free Access</p>
            {freeSources.map((s, i) => (
              <SourceRow key={`free-${i}`} {...s} />
            ))}
          </div>
        )}
        {paidSources.length > 0 && (
          <div className="space-y-2 mt-4">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Publisher / Paid</p>
            {paidSources.map((s, i) => (
              <SourceRow key={`paid-${i}`} {...s} />
            ))}
          </div>
        )}
        {freeSources.length === 0 && (
          <p className="text-xs text-muted-foreground italic mt-2">
            No free copies found. Check your institution's library access, or look for the author's personal website.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

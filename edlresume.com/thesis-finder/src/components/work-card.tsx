import { OpenAlexWork, convertAbstractInvertedIndex } from "@/lib/openalex";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Quote, ExternalLink } from "lucide-react";
import { CiteButton } from "@/components/cite-button";
import { BookmarkButton } from "@/components/bookmark-button";
import { PdfButton } from "@/components/pdf-button";
import { Link } from "wouter";

function stripPrefix(id: string): string {
  return id.replace("https://openalex.org/", "");
}

export function WorkCard({ work, compact }: { work: OpenAlexWork; compact?: boolean }) {
  const abstract = convertAbstractInvertedIndex(work.abstract_inverted_index);
  const authors = work.authorships.map((a) => a.author.display_name).join(", ");
  const source = work.primary_location?.source?.display_name;
  const externalLink = work.doi || work.open_access?.oa_url || `https://openalex.org/${work.id}`;

  return (
    <Card className="mb-4 transition-all duration-200 hover:shadow-md border-border/60">
      <CardHeader className={compact ? "pb-2" : "pb-3"}>
        <div className="flex justify-between items-start gap-4">
          <CardTitle className={`${compact ? "text-base" : "text-xl"} font-serif leading-tight`}>
            <Link
              href={`/paper/${stripPrefix(work.id)}`}
              className="hover:text-primary hover:underline underline-offset-4 decoration-primary/30"
            >
              {work.title || "Untitled Work"}
            </Link>
          </CardTitle>
          <div className="flex items-center gap-1 flex-shrink-0">
            <BookmarkButton work={work} />
            <Badge variant="secondary" className="flex items-center gap-1 font-mono">
              <Quote className="w-3 h-3" />
              {work.cited_by_count}
            </Badge>
          </div>
        </div>
        <CardDescription className="text-sm space-y-1">
          <div className="text-foreground/80 font-medium">{authors || "Unknown authors"}</div>
          <div className="flex items-center gap-2 text-muted-foreground text-xs font-medium">
            <span>{work.publication_year}</span>
            {source && (
              <>
                <span>·</span>
                <span className="truncate max-w-[300px]" title={source}>{source}</span>
              </>
            )}
            {work.type && (
              <>
                <span>·</span>
                <span className="capitalize">{work.type.replace(/-/g, " ")}</span>
              </>
            )}
          </div>
        </CardDescription>
      </CardHeader>
      {abstract && !compact && (
        <CardContent className="pb-3">
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">{abstract}</p>
        </CardContent>
      )}
      <CardFooter className="pt-1 flex items-center gap-2 flex-wrap">
        <Button variant="link" size="sm" className="px-0 h-auto text-primary" asChild>
          <a href={externalLink} target="_blank" rel="noopener noreferrer">
            View Paper <ExternalLink className="w-3 h-3 ml-1" />
          </a>
        </Button>
        <CiteButton work={work} />
        <PdfButton doi={work.doi} />
      </CardFooter>
    </Card>
  );
}

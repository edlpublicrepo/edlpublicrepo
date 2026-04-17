import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useOpenAlexWork, useCitedByWorks, useReferencedWorks, useRelatedWorks, useKeywordRelatedWorks } from "@/hooks/use-openalex-work";
import { useUnpaywall } from "@/hooks/use-unpaywall";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { convertAbstractInvertedIndex } from "@/lib/openalex";
import { toBibtex, toAPA, toMLA, toChicago } from "@/lib/citations";
import { WorkCard } from "@/components/work-card";
import { FindSources } from "@/components/find-sources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  BookMarked,
  Bookmark,
  Quote,
  ExternalLink,
  FileDown,
  Copy,
  Check,
  Church,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PaperDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: work, isLoading, isError } = useOpenAlexWork(id);
  const { data: citedBy } = useCitedByWorks(work);
  const { data: references } = useReferencedWorks(work);
  const { data: related } = useRelatedWorks(work);
  const { data: pdfUrl } = useUnpaywall(work?.doi);
  const { addBookmark, removeBookmark, isBookmarked, bookmarks } = useBookmarks();
  const { toast } = useToast();
  const [copiedFormat, setCopiedFormat] = useState<string | null>(null);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [kwChristianOnly, setKwChristianOnly] = useState(false);

  const allKeywords = work?.keywords ?? [];

  useEffect(() => {
    if (allKeywords.length > 0 && selectedKeywords.length === 0) {
      setSelectedKeywords(
        allKeywords.filter((k) => k.score > 0.4).slice(0, 4).map((k) => k.display_name),
      );
    }
  }, [allKeywords]);

  const { data: keywordRelated } = useKeywordRelatedWorks(selectedKeywords, kwChristianOnly, work?.id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header bookmarkCount={bookmarks.length} />
        <main className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <Skeleton className="h-32 w-full" />
        </main>
      </div>
    );
  }

  if (isError || !work) {
    return (
      <div className="min-h-screen bg-background">
        <Header bookmarkCount={bookmarks.length} />
        <main className="container mx-auto px-4 py-16 max-w-4xl text-center">
          <h2 className="text-2xl font-serif font-bold">Paper not found</h2>
          <p className="text-muted-foreground mt-2">Could not load this paper from OpenAlex.</p>
          <Link href="/">
            <Button variant="outline" className="mt-4"><ArrowLeft className="w-4 h-4 mr-2" /> Back to search</Button>
          </Link>
        </main>
      </div>
    );
  }

  const abstract = convertAbstractInvertedIndex(work.abstract_inverted_index);
  const source = work.primary_location?.source;
  const externalLink = work.doi || work.open_access?.oa_url || `https://openalex.org/${work.id}`;
  const keywordResults = keywordRelated?.results ?? [];
  const saved = isBookmarked(work.id);

  const citationFormats = [
    { label: "BibTeX", fn: toBibtex },
    { label: "APA", fn: toAPA },
    { label: "MLA", fn: toMLA },
    { label: "Chicago", fn: toChicago },
  ];

  const handleCopy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedFormat(label);
    toast({ title: `${label} citation copied` });
    setTimeout(() => setCopiedFormat(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header bookmarkCount={bookmarks.length} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to search
          </Button>
        </Link>

        <div className="space-y-6">
          {/* Title + metadata */}
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground leading-tight">{work.title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-1 text-foreground/80 font-medium">
              {work.authorships.map((a, i) => {
                const authorId = a.author.id.replace("https://openalex.org/", "");
                const institutions = (a.institutions ?? []).map((inst) => inst.display_name).join(", ");
                return (
                  <span key={a.author.id}>
                    <a
                      href={`https://openalex.org/authors/${authorId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary hover:underline underline-offset-2 decoration-primary/30"
                      title={institutions ? `${a.author.display_name} — ${institutions}` : a.author.display_name}
                    >
                      {a.author.display_name}
                    </a>
                    {institutions && (
                      <span className="text-xs text-muted-foreground ml-0.5">
                        ({(a.institutions ?? []).map((inst, j) => {
                          const instId = inst.id.replace("https://openalex.org/", "");
                          return (
                            <span key={inst.id}>
                              {j > 0 && ", "}
                              <a
                                href={`https://openalex.org/institutions/${instId}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-primary hover:underline underline-offset-2"
                              >
                                {inst.display_name}
                              </a>
                            </span>
                          );
                        })})
                      </span>
                    )}
                    {i < work.authorships.length - 1 && <span>,&nbsp;</span>}
                  </span>
                );
              })}
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{work.publication_year}</span>
              {source && (
                <>
                  <span>·</span>
                  <a
                    href={`https://openalex.org/sources/${source.id?.replace("https://openalex.org/", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary hover:underline underline-offset-2 decoration-primary/30"
                  >
                    {source.display_name}
                  </a>
                </>
              )}
              {work.type && <><span>·</span><span className="capitalize">{work.type.replace(/-/g, " ")}</span></>}
              <Badge variant="secondary" className="flex items-center gap-1 font-mono">
                <Quote className="w-3 h-3" />{work.cited_by_count} citations
              </Badge>
              {work.open_access?.is_oa && (
                <Badge variant="outline" className="border-green-600/30 text-green-700">Open Access</Badge>
              )}
            </div>
            {work.keywords && work.keywords.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {work.keywords.filter((k) => k.score > 0.3).map((k) => (
                  <Badge key={k.id} variant="outline" className="text-xs font-normal">
                    {k.display_name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm" asChild>
              <a href={externalLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" /> View on Publisher
              </a>
            </Button>
            {pdfUrl && (
              <Button variant="outline" size="sm" className="border-green-600/30 text-green-700 hover:bg-green-50" asChild>
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <FileDown className="w-4 h-4 mr-2" /> Free PDF
                </a>
              </Button>
            )}
            <Button
              variant={saved ? "default" : "outline"}
              size="sm"
              onClick={() => {
                if (saved) {
                  removeBookmark(work.id);
                  toast({ title: "Removed from collection" });
                } else {
                  addBookmark(work);
                  toast({ title: "Saved to collection" });
                }
              }}
            >
              <Bookmark className={`w-4 h-4 mr-2 ${saved ? "fill-current" : ""}`} />
              {saved ? "Saved" : "Save"}
            </Button>
          </div>

          {/* Available sources */}
          <FindSources work={work} />

          {/* Abstract */}
          {abstract && (
            <Card>
              <CardHeader><CardTitle className="text-lg font-serif">Abstract</CardTitle></CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-foreground/80">{abstract}</p>
              </CardContent>
            </Card>
          )}

          {/* Citation export */}
          <Card>
            <CardHeader><CardTitle className="text-lg font-serif">Cite this paper</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {citationFormats.map(({ label, fn }) => (
                <div key={label} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-muted-foreground mb-1">{label}</div>
                    <pre className="text-xs text-foreground/80 whitespace-pre-wrap font-mono break-all">{fn(work)}</pre>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 flex-shrink-0"
                    onClick={() => handleCopy(label, fn(work))}
                  >
                    {copiedFormat === label ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Related papers tabs */}
          <Tabs defaultValue="references" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="references">
                References {references?.meta.count ? `(${references.meta.count})` : ""}
              </TabsTrigger>
              <TabsTrigger value="cited-by">
                Cited By {citedBy?.meta.count ? `(${citedBy.meta.count})` : ""}
              </TabsTrigger>
              <TabsTrigger value="related">
                Related {related?.results.length ? `(${related.results.length})` : ""}
              </TabsTrigger>
              <TabsTrigger value="by-keywords">
                By Keywords {keywordResults.length ? `(${keywordResults.length})` : ""}
              </TabsTrigger>
            </TabsList>
            <TabsContent value="references" className="mt-4">
              {references?.results.length ? (
                references.results.map((w) => <WorkCard key={w.id} work={w} compact />)
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No references available.</p>
              )}
            </TabsContent>
            <TabsContent value="cited-by" className="mt-4">
              {citedBy?.results.length ? (
                citedBy.results.map((w) => <WorkCard key={w.id} work={w} compact />)
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No citing papers found.</p>
              )}
            </TabsContent>
            <TabsContent value="related" className="mt-4">
              {related?.results.length ? (
                related.results.map((w) => <WorkCard key={w.id} work={w} compact />)
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">No related papers available.</p>
              )}
            </TabsContent>
            <TabsContent value="by-keywords" className="mt-4 space-y-4">
              {allKeywords.length > 0 && (
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Click keywords to toggle</span>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={kwChristianOnly}
                        onCheckedChange={setKwChristianOnly}
                      />
                      <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                        <Church className="w-3.5 h-3.5" /> Christian Institutions
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {allKeywords.map((k) => {
                      const isSelected = selectedKeywords.includes(k.display_name);
                      return (
                        <button
                          key={k.id}
                          onClick={() => {
                            setSelectedKeywords((prev) =>
                              isSelected
                                ? prev.filter((s) => s !== k.display_name)
                                : [...prev, k.display_name],
                            );
                          }}
                          className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                            isSelected
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background text-muted-foreground border-border hover:border-primary/50 hover:text-foreground"
                          }`}
                        >
                          {k.display_name}
                        </button>
                      );
                    })}
                  </div>
                  {selectedKeywords.length === 0 && (
                    <p className="text-xs text-muted-foreground italic">Select at least one keyword to search.</p>
                  )}
                </div>
              )}
              {keywordResults.length ? (
                keywordResults.map((w) => <WorkCard key={w.id} work={w} compact />)
              ) : selectedKeywords.length > 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No papers found for these keywords{kwChristianOnly ? " from Christian institutions" : ""}.</p>
              ) : (
                <p className="text-sm text-muted-foreground py-8 text-center">Select keywords above to find related papers.</p>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function Header({ bookmarkCount }: { bookmarkCount: number }) {
  return (
    <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
          <BookMarked className="w-6 h-6" />
          <span className="font-serif font-bold text-xl tracking-tight">ScholarSearch</span>
          <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">v{__APP_VERSION__}</span>
        </Link>
        <Link href="/bookmarks" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
          <Bookmark className="w-4 h-4" />
          <span className="hidden sm:inline">Collection</span>
          {bookmarkCount > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">{bookmarkCount}</Badge>
          )}
        </Link>
      </div>
    </header>
  );
}

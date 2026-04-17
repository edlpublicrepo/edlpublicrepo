import React, { useState, useMemo } from "react";
import { useOpenAlexSearch, useSourceSearch, SearchParams } from "@/hooks/use-openalex";
import { OpenAlexSource, OpenAlexWork } from "@/lib/openalex";
import { getHistory, addToHistory, clearHistory } from "@/lib/search-history";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { WorkCard } from "@/components/work-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Pagination, PaginationContent, PaginationItem, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { BookOpen, Search, BookMarked, AlertCircle, Frown, Bookmark, History, X, Church, User, Building2, BookText } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Link } from "wouter";

const DOCUMENT_TYPES = [
  { value: "", label: "All Types" },
  { value: "journal-article", label: "Journal Article" },
  { value: "book-chapter", label: "Book Chapter" },
  { value: "dissertation", label: "Dissertation" },
  { value: "preprint", label: "Preprint" },
  { value: "book", label: "Book" },
  { value: "dataset", label: "Dataset" },
];

const SORT_OPTIONS = [
  { value: "relevance", label: "Relevance" },
  { value: "cited_by_count", label: "Most Cited" },
  { value: "publication_year_desc", label: "Newest First" },
  { value: "publication_year_asc", label: "Oldest First" },
  { value: "publication_date_desc", label: "Recently Published" },
];

interface Facet {
  id: string;
  name: string;
  count: number;
}

function extractFacets(results: OpenAlexWork[]) {
  const authorMap = new Map<string, { name: string; count: number }>();
  const sourceMap = new Map<string, { name: string; count: number }>();
  const institutionMap = new Map<string, { name: string; count: number }>();

  for (const w of results) {
    for (const a of w.authorships) {
      if (a.author.id && a.author.display_name) {
        const existing = authorMap.get(a.author.id);
        authorMap.set(a.author.id, {
          name: a.author.display_name,
          count: (existing?.count ?? 0) + 1,
        });
      }
      for (const inst of a.institutions ?? []) {
        if (inst.id && inst.display_name) {
          const existing = institutionMap.get(inst.id);
          institutionMap.set(inst.id, {
            name: inst.display_name,
            count: (existing?.count ?? 0) + 1,
          });
        }
      }
    }
    const src = w.primary_location?.source;
    if (src?.id && src?.display_name) {
      const existing = sourceMap.get(src.id);
      sourceMap.set(src.id, {
        name: src.display_name,
        count: (existing?.count ?? 0) + 1,
      });
    }
  }

  const toSorted = (map: Map<string, { name: string; count: number }>): Facet[] =>
    Array.from(map.entries())
      .map(([id, { name, count }]) => ({ id, name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

  return {
    authors: toSorted(authorMap),
    sources: toSorted(sourceMap),
    institutions: toSorted(institutionMap),
  };
}

export default function Home() {
  const [searchInput, setSearchInput] = useState("");
  const [sourceQuery, setSourceQuery] = useState("");
  const [selectedSource, setSelectedSource] = useState<OpenAlexSource | null>(null);
  const [showSourceDropdown, setShowSourceDropdown] = useState(false);
  const [history, setHistory] = useState<string[]>(getHistory());
  const [params, setParams] = useState<SearchParams>({
    query: "",
    page: 1,
    sortBy: "relevance",
    yearFrom: "",
    yearTo: "",
    isOpenAccess: false,
    documentType: "",
    sourceId: "",
    authorId: "",
    institutionId: "",
    christianInstitutions: false,
  });

  const { data, isLoading, error, isError } = useOpenAlexSearch(params);
  const { data: sources } = useSourceSearch(sourceQuery);
  const { bookmarks } = useBookmarks();

  const facets = useMemo(
    () => (data?.results ? extractFacets(data.results) : null),
    [data?.results],
  );

  const activeFilters: { label: string; clear: () => void }[] = [];
  if (params.authorId && facets) {
    const author = facets.authors.find((a) => a.id === params.authorId);
    activeFilters.push({
      label: `Author: ${author?.name ?? "Selected"}`,
      clear: () => setParams((p) => ({ ...p, authorId: "", page: 1 })),
    });
  }
  if (params.institutionId && facets) {
    const inst = facets.institutions.find((i) => i.id === params.institutionId);
    activeFilters.push({
      label: `Institution: ${inst?.name ?? "Selected"}`,
      clear: () => setParams((p) => ({ ...p, institutionId: "", page: 1 })),
    });
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      addToHistory(searchInput.trim());
      setHistory(getHistory());
      setParams((p) => ({ ...p, query: searchInput.trim(), page: 1, authorId: "", institutionId: "" }));
    }
  };

  const handleQuickSearch = (query: string) => {
    setSearchInput(query);
    addToHistory(query);
    setHistory(getHistory());
    setParams((p) => ({ ...p, query, page: 1, authorId: "", institutionId: "" }));
  };

  const handleClearHistory = () => {
    clearHistory();
    setHistory([]);
  };

  const handlePageChange = (newPage: number) => {
    setParams((p) => ({ ...p, page: newPage }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (val: string) => {
    setParams((p) => ({ ...p, sortBy: val as SearchParams["sortBy"], page: 1 }));
  };

  const totalPages = data ? Math.ceil(data.meta.count / data.meta.per_page) : 0;
  const currentPage = params.page || 1;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <BookMarked className="w-6 h-6" />
            <span className="font-serif font-bold text-xl tracking-tight">ScholarSearch</span>
          </Link>
          <Link href="/bookmarks" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Collection</span>
            {bookmarks.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">{bookmarks.length}</Badge>
            )}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <div className="text-center space-y-4 py-8">
            <h1 className="text-4xl font-serif font-bold text-foreground">Find the papers that matter.</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Search millions of academic papers, cite them instantly, and build your research collection.
            </p>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardContent className="p-6">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Enter keywords, topics, or authors..."
                    className="pl-10 h-12 text-base bg-background/50"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
                <Button type="submit" className="h-12 px-8 text-base font-medium">
                  Search
                </Button>
              </form>

              {/* Filters row */}
              <div className="mt-4 flex flex-wrap items-center gap-4 border-t border-border/40 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Sort by</span>
                  <Select value={params.sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-[180px] h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SORT_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Year</span>
                  <Input
                    placeholder="From"
                    className="w-[80px] h-9"
                    value={params.yearFrom || ""}
                    onChange={(e) => setParams((p) => ({ ...p, yearFrom: e.target.value, page: 1 }))}
                  />
                  <span className="text-muted-foreground">-</span>
                  <Input
                    placeholder="To"
                    className="w-[80px] h-9"
                    value={params.yearTo || ""}
                    onChange={(e) => setParams((p) => ({ ...p, yearTo: e.target.value, page: 1 }))}
                  />
                </div>
              </div>

              {/* Advanced filters row */}
              <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-border/40 pt-3">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={params.christianInstitutions}
                    onCheckedChange={(checked) => setParams((p) => ({ ...p, christianInstitutions: checked, page: 1 }))}
                  />
                  <span className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    <Church className="w-3.5 h-3.5" /> Christian Institutions
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={params.isOpenAccess}
                    onCheckedChange={(checked) => setParams((p) => ({ ...p, isOpenAccess: checked, page: 1 }))}
                  />
                  <span className="text-sm font-medium text-muted-foreground">Open Access Only</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground">Type</span>
                  <Select
                    value={params.documentType || ""}
                    onValueChange={(val) => setParams((p) => ({ ...p, documentType: val === "all" ? "" : val, page: 1 }))}
                  >
                    <SelectTrigger className="w-[170px] h-9"><SelectValue placeholder="All Types" /></SelectTrigger>
                    <SelectContent>
                      {DOCUMENT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value || "all"}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 relative">
                  <span className="text-sm font-medium text-muted-foreground">Journal</span>
                  <div className="relative">
                    <Input
                      placeholder="Search journals..."
                      className="w-[200px] h-9"
                      value={selectedSource ? selectedSource.display_name : sourceQuery}
                      onChange={(e) => {
                        setSourceQuery(e.target.value);
                        setSelectedSource(null);
                        setShowSourceDropdown(true);
                        if (!e.target.value) setParams((p) => ({ ...p, sourceId: "", page: 1 }));
                      }}
                      onFocus={() => setShowSourceDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSourceDropdown(false), 200)}
                    />
                    {showSourceDropdown && sources && sources.length > 0 && !selectedSource && (
                      <div className="absolute top-full left-0 mt-1 w-[300px] bg-popover border border-border rounded-md shadow-md z-20 max-h-48 overflow-auto">
                        {sources.map((s) => (
                          <button
                            key={s.id}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setSelectedSource(s);
                              setSourceQuery(s.display_name);
                              setShowSourceDropdown(false);
                              setParams((p) => ({ ...p, sourceId: s.id, page: 1 }));
                            }}
                          >
                            <div className="font-medium truncate">{s.display_name}</div>
                            <div className="text-xs text-muted-foreground">{s.works_count.toLocaleString()} works</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {selectedSource && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => {
                        setSelectedSource(null);
                        setSourceQuery("");
                        setParams((p) => ({ ...p, sourceId: "", page: 1 }));
                      }}
                    >
                      <X className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active facet filters */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filtered by:</span>
              {activeFilters.map((f) => (
                <Badge key={f.label} variant="secondary" className="gap-1 pr-1">
                  {f.label}
                  <button onClick={f.clear} className="ml-1 hover:text-destructive"><X className="w-3 h-3" /></button>
                </Badge>
              ))}
              <button
                onClick={() => setParams((p) => ({ ...p, authorId: "", institutionId: "", page: 1 }))}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Search history chips */}
          {!params.query && !isLoading && history.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <History className="w-4 h-4 text-muted-foreground" />
              {history.slice(0, 8).map((q) => (
                <button
                  key={q}
                  onClick={() => handleQuickSearch(q)}
                  className="px-3 py-1 text-sm bg-secondary text-secondary-foreground rounded-full hover:bg-accent transition-colors"
                >
                  {q}
                </button>
              ))}
              <button
                onClick={handleClearHistory}
                className="px-2 py-1 text-xs text-muted-foreground hover:text-destructive transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          {/* Results */}
          <div className="space-y-6">
            {!params.query && !isLoading && (
              <div className="py-16 text-center space-y-4">
                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <BookOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-serif font-semibold text-foreground">Ready to start your literature review?</h3>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Enter your thesis topic above. Use specific keywords to narrow down results.
                  Sort by "Most Cited" to find foundational papers in your field.
                </p>
              </div>
            )}

            {isLoading && (
              <div className="space-y-4 py-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  Searching academic database...
                </div>
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="mb-4">
                    <CardContent className="p-6 space-y-3">
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {isError && (
              <Alert variant="destructive" className="mt-8">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error instanceof Error ? error.message : "Failed to fetch results. Please try again later."}
                </AlertDescription>
              </Alert>
            )}

            {data && data.results.length === 0 && !isLoading && params.query && (
              <div className="py-16 text-center space-y-4 bg-card rounded-xl border border-border/40">
                <Frown className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-serif font-semibold text-foreground">No papers found</h3>
                <p className="text-muted-foreground">Try adjusting your keywords or clearing the filters.</p>
              </div>
            )}

            {data && data.results.length > 0 && !isLoading && (
              <>
                <div className="flex items-center justify-between text-sm text-muted-foreground pb-2 border-b border-border/40">
                  <span>Found {data.meta.count.toLocaleString()} results</span>
                  <span>Page {data.meta.page} of {Math.min(totalPages, 400)}</span>
                </div>

                {/* Faceted filters */}
                {facets && !params.authorId && !params.institutionId && (
                  <div className="p-4 bg-muted/30 rounded-lg border border-border/40 space-y-3">
                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Filter results by</span>
                    {facets.authors.length > 1 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <User className="w-3 h-3" /> Authors
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {facets.authors.map((a) => (
                            <button
                              key={a.id}
                              onClick={() => setParams((p) => ({ ...p, authorId: a.id, page: 1 }))}
                              className="px-2 py-0.5 text-xs rounded-full bg-background border border-border hover:border-primary/50 hover:text-primary transition-colors"
                            >
                              {a.name} <span className="text-muted-foreground">({a.count})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {facets.institutions.length > 1 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <Building2 className="w-3 h-3" /> Institutions
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {facets.institutions.map((i) => (
                            <button
                              key={i.id}
                              onClick={() => setParams((p) => ({ ...p, institutionId: i.id, page: 1 }))}
                              className="px-2 py-0.5 text-xs rounded-full bg-background border border-border hover:border-primary/50 hover:text-primary transition-colors"
                            >
                              {i.name} <span className="text-muted-foreground">({i.count})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    {facets.sources.length > 1 && (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                          <BookText className="w-3 h-3" /> Sources
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {facets.sources.map((s) => (
                            <button
                              key={s.id}
                              onClick={() => {
                                setSelectedSource({ id: s.id, display_name: s.name, works_count: 0 });
                                setSourceQuery(s.name);
                                setParams((p) => ({ ...p, sourceId: s.id, page: 1 }));
                              }}
                              className="px-2 py-0.5 text-xs rounded-full bg-background border border-border hover:border-primary/50 hover:text-primary transition-colors"
                            >
                              {s.name} <span className="text-muted-foreground">({s.count})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-4 pt-4">
                  {data.results.map((work) => (
                    <WorkCard key={work.id} work={work} />
                  ))}
                </div>

                <div className="pt-8 pb-12 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                      <PaginationItem>
                        <span className="px-4 py-2 text-sm font-medium">Page {currentPage}</span>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          className={data.results.length < 25 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

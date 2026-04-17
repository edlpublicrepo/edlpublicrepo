import { Link } from "wouter";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { WorkCard } from "@/components/work-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookMarked, Bookmark, Download, ArrowLeft, FolderOpen } from "lucide-react";

export default function Bookmarks() {
  const { bookmarks, exportBookmarks } = useBookmarks();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
            <BookMarked className="w-6 h-6" />
            <span className="font-serif font-bold text-xl tracking-tight">ScholarSearch</span>
            <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">v{__APP_VERSION__}</span>
          </Link>
          <Link href="/bookmarks" className="flex items-center gap-2 text-sm text-primary font-medium">
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">Collection</span>
            {bookmarks.length > 0 && (
              <Badge variant="secondary" className="h-5 px-1.5 text-xs">{bookmarks.length}</Badge>
            )}
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-6 text-muted-foreground hover:text-primary">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to search
          </Button>
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">Your Collection</h1>
            <p className="text-muted-foreground mt-1">
              {bookmarks.length} {bookmarks.length === 1 ? "paper" : "papers"} saved
            </p>
          </div>
          {bookmarks.length > 0 && (
            <Button variant="outline" onClick={exportBookmarks}>
              <Download className="w-4 h-4 mr-2" />
              Export CSV
            </Button>
          )}
        </div>

        {bookmarks.length === 0 ? (
          <div className="py-16 text-center space-y-4">
            <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FolderOpen className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-serif font-semibold text-foreground">No papers saved yet</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Search for papers and click the bookmark icon to save them to your collection.
            </p>
            <Link href="/">
              <Button className="mt-4">Start searching</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookmarks.map((work) => (
              <WorkCard key={work.id} work={work} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

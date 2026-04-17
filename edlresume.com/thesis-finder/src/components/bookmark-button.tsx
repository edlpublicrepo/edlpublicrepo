import { Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBookmarks } from "@/hooks/use-bookmarks";
import { OpenAlexWork } from "@/lib/openalex";
import { useToast } from "@/hooks/use-toast";

export function BookmarkButton({ work }: { work: OpenAlexWork }) {
  const { addBookmark, removeBookmark, isBookmarked } = useBookmarks();
  const { toast } = useToast();
  const saved = isBookmarked(work.id);

  const toggle = () => {
    if (saved) {
      removeBookmark(work.id);
      toast({ title: "Removed from collection" });
    } else {
      addBookmark(work);
      toast({ title: "Saved to collection" });
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      className={`h-8 w-8 ${saved ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
      onClick={toggle}
      title={saved ? "Remove from collection" : "Save to collection"}
    >
      <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
    </Button>
  );
}

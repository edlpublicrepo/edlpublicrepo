import { Copy, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { OpenAlexWork } from "@/lib/openalex";
import { toBibtex, toAPA, toMLA, toChicago } from "@/lib/citations";

const formats = [
  { label: "BibTeX", fn: toBibtex },
  { label: "APA", fn: toAPA },
  { label: "MLA", fn: toMLA },
  { label: "Chicago", fn: toChicago },
] as const;

export function CiteButton({ work }: { work: OpenAlexWork }) {
  const { toast } = useToast();

  const handleCopy = async (label: string, text: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: `${label} citation copied`, description: "Pasted to your clipboard." });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-auto px-2 py-1 text-muted-foreground hover:text-primary">
          <FileText className="w-3.5 h-3.5 mr-1" />
          Cite
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {formats.map(({ label, fn }) => (
          <DropdownMenuItem key={label} onClick={() => handleCopy(label, fn(work))}>
            <Copy className="w-3.5 h-3.5 mr-2" />
            Copy {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

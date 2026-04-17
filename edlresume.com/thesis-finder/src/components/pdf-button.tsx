import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUnpaywall } from "@/hooks/use-unpaywall";

export function PdfButton({ doi }: { doi: string | undefined }) {
  const { data: pdfUrl, isLoading } = useUnpaywall(doi);

  if (!doi || isLoading || !pdfUrl) return null;

  return (
    <Button variant="outline" size="sm" className="h-auto px-2 py-1 text-xs gap-1 border-green-600/30 text-green-700 hover:bg-green-50" asChild>
      <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
        <FileDown className="w-3.5 h-3.5" />
        Free PDF
      </a>
    </Button>
  );
}

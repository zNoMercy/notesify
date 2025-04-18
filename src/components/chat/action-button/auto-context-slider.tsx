import { useViewingPagesAtom } from "@/atoms/contexts";
import { pdfAtomFamily } from "@/atoms/pdf";
import { activePdfIdAtom, currentPageAtomFamily } from "@/atoms/pdf-viewer";
import { TooltipSimple } from "@/components/tooltip/tooltip-simple";
import { Switch } from "@/components/ui/switch";
import { useAtom, useAtomValue } from "jotai";
import { CircleHelp } from "lucide-react";

export const AutoContextSlider = () => {
  const pdfId = useAtomValue(activePdfIdAtom);
  const [useViewingPages, setUseViewingPages] = useAtom(useViewingPagesAtom);
  const pdf = useAtomValue(pdfAtomFamily(pdfId || ""));
  const currentPage = useAtomValue(currentPageAtomFamily(pdfId));
  if (!currentPage || !pdf) {
    return null;
  }

  const pages = Array.from(
    new Set([
      Math.max(1, currentPage - 1),
      currentPage,
      Math.min(pdf.pageCount, currentPage + 1),
    ])
  ).sort((a, b) => a - b);
  return (
    <div className="flex items-center justify-between w-full px-2 py-1.5 gap-6">
      <div className="flex items-center gap-1">
        Viewing pages
        <TooltipSimple
          tooltip={`The nearby pages you are viewing (pages ${pages.join(
            ", "
          )}) are automatically provided as context to the AI`}
        >
          <CircleHelp className="w-4 h-4 text-muted-foreground" />
        </TooltipSimple>
      </div>

      <Switch checked={useViewingPages} onCheckedChange={setUseViewingPages} />
    </div>
  );
};

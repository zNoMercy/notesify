import { getPdfMetadataAtom, jumpToPageAtom } from "@/actions/pdf-viewer";
import { Badge } from "@/components/badge";
import { useAction } from "@/hooks/use-action";
import { parsePageNumbers } from "@/lib/pdf/parsing";
import { cn } from "@/lib/utils";
import { ToolInvocation } from "ai";
import { Check } from "lucide-react";
import { useEffect, useState } from "react";

export const SearchTextTool = ({
  tool,
  className,
}: {
  tool: ToolInvocation;
  className?: string;
}) => {
  const [jumpToPage] = useAction(jumpToPageAtom);
  const [getPdfMetadata] = useAction(getPdfMetadataAtom);

  const [toolResultString, setToolResultString] = useState("");
  const [pdfName, setPdfName] = useState<string | undefined>("");
  const [foundPages, setFoundPages] = useState<number[]>([]);
  const { pdfId, texts } = tool.args || {};
  const running = tool.state !== "result";

  useEffect(() => {
    if (!Array.isArray(texts)) return;

    if (running) {
      setToolResultString(texts.join(", "));
    } else {
      const pageNumbers = parsePageNumbers(tool.result);
      setToolResultString(texts.join(", "));
      setFoundPages(pageNumbers);
      (async () => {
        const metadata = await getPdfMetadata(pdfId);
        const pdfName = metadata?.name;
        setPdfName(pdfName);
      })();
    }
  }, [running]);

  return (
    <>
      <div
        className={cn(
          "flex items-center gap-2 border border-neutral-300 rounded-md px-2 py-1 mt-1",
          className
        )}
      >
        {running ? (
          // @ts-ignore
          <l-ring-2
            size="16"
            stroke="2"
            stroke-length="0.25"
            bg-opacity="0.1"
            speed="0.8"
            color="black"
          />
        ) : (
          <Check color="green" className="w-4 h-4" />
        )}
        {running ? "Searching " : "Searched "}
        <Badge variant="blue" className="cursor-pointer truncate">
          {toolResultString}
        </Badge>
        {!running &&
          (pdfName ? (
            <>
              in
              <Badge
                variant="blue"
                onClick={() => {
                  jumpToPage(pdfId, foundPages?.[0] || 1);
                }}
              >
                {pdfName}
              </Badge>
            </>
          ) : (
            " (Cannot find the PDF)"
          ))}
      </div>
      {foundPages?.length > 0 && (
        <div className="flex items-center gap-2 border border-neutral-300 rounded-md px-2 py-1 mt-2">
          <Check color="green" className="w-4 h-4" />
          Found
          {foundPages?.map((page) => (
            <Badge
              key={page}
              variant="blue"
              className="cursor-pointer"
              onClick={() => jumpToPage(pdfId, page)}
            >
              Page {page}
            </Badge>
          ))}
        </div>
      )}
    </>
  );
};

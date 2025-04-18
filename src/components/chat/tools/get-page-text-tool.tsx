import { ToolInvocation } from "ai";
import { Badge } from "@/components/badge";
import { Check } from "lucide-react";
import { getPdfMetadataAtom, jumpToPageAtom } from "@/actions/pdf-viewer";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";

export const GetPageTextTool = ({
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
  const { pdfId, startPage, endPage } = tool.args || {};
  const running = tool.state !== "result";

  useEffect(() => {
    if (running) {
      setToolResultString("Pages");
    } else {
      const pageString =
        startPage === endPage
          ? `Page ${startPage}`
          : `Pages ${startPage}-${endPage}`;
      setToolResultString(pageString);
      (async () => {
        const metadata = await getPdfMetadata(pdfId);
        const pdfName = metadata?.name;
        setPdfName(pdfName);
        setToolResultString(pageString);
      })();
    }
  }, [running]);

  return (
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
      {running ? "Reading " : "Read "}
      <Badge
        variant="blue"
        className="cursor-pointer truncate"
        onClick={() => {
          jumpToPage(pdfId, startPage);
        }}
      >
        {toolResultString}
      </Badge>
      {!running &&
        (pdfName ? (
          <>
            of
            <Badge
              variant="blue"
              onClick={() => {
                jumpToPage(pdfId, startPage);
              }}
            >
              {pdfName}
            </Badge>
          </>
        ) : (
          " (Cannot find the PDF)"
        ))}
    </div>
  );
};

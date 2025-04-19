import { ToolInvocation } from "ai";
import { Badge } from "@/components/badge";
import { Check } from "lucide-react";
import { getPdfMetadataAtom } from "@/actions/pdf-viewer";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import { SearchPagesParameters } from "@/lib/llm-tools";

export const SearchPagesTool = ({
  tool,
  className,
}: {
  tool: ToolInvocation;
  className?: string;
}) => {
  const [getPdfMetadata] = useAction(getPdfMetadataAtom);

  const [toolResultString, setToolResultString] = useState("");
  const [pdfName, setPdfName] = useState<string | undefined>("");
  const { pdfId } = (tool.args as SearchPagesParameters) || {};
  const running = tool.state !== "result";

  useEffect(() => {
    if (running) {
      setToolResultString("Pages");
    } else {
      const { pages } = tool.result as {
        pages: number[];
      };
      const pageString = Array.isArray(pages)
        ? `Pages ${pages?.join(", ")}`
        : "no pages";
      setToolResultString(pageString);
      (async () => {
        const metadata = await getPdfMetadata(pdfId);
        const pdfName = metadata?.name;
        setPdfName(pdfName);
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
      {running ? "Searching " : "Found "}
      <Badge variant="blue" className="cursor-pointer truncate">
        {toolResultString}
      </Badge>
      {!running &&
        (pdfName ? (
          <>
            of
            <Badge variant="blue">{pdfName}</Badge>
          </>
        ) : (
          " (Cannot find the PDF)"
        ))}
    </div>
  );
};

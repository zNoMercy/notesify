import { Badge } from "@/components/badge";
import { PageBadges } from "@/components/chat/tools/page-badges";
import { Check, CircleAlert } from "lucide-react";
import { getPdfMetadataAtom, jumpToPageAtom } from "@/actions/pdf-viewer";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAction } from "@/hooks/use-action";
import { ToolInvocation } from "ai";

export const PageTool = ({
  tool,
  className,
  pages,
  actionText,
}: {
  tool: ToolInvocation;
  className?: string;
  pages: number[];
  actionText: {
    loading: string;
    completed: string;
    failed: string;
  };
}) => {
  const [getPdfMetadata] = useAction(getPdfMetadataAtom);
  const [jumpToPage] = useAction(jumpToPageAtom);

  const [pdfName, setPdfName] = useState<string | undefined>("");
  const { pdfId } = tool.args || {};
  const running = tool.state !== "result";

  useEffect(() => {
    (async () => {
      if (!pdfId || running) return;
      const metadata = await getPdfMetadata(pdfId);
      const pdfName = metadata?.name;
      setPdfName(pdfName);
    })();
  }, [pdfId, running]);

  const renderContent = () => {
    if (running) {
      return (
        <>
          {/* @ts-ignore */}
          <l-ring-2
            size="16"
            stroke="2"
            stroke-length="0.25"
            bg-opacity="0.1"
            speed="0.8"
            color="black"
          />
          {actionText.loading}
        </>
      );
    }

    if (!pdfName) {
      return (
        <>
          <CircleAlert color="orange" className="w-4 h-4" />
          <p>Can't find the PDF</p>
        </>
      );
    }

    if (pages.length === 0) {
      return (
        <>
          <CircleAlert color="orange" className="w-4 h-4" />
          <p>{actionText.failed}</p>
        </>
      );
    }

    return (
      <>
        <Check color="green" className="w-4 h-4" />
        {actionText.completed}
        <PageBadges
          pages={pages}
          variant="blue"
          className="cursor-pointer truncate"
          onClick={(startPage) => jumpToPage(pdfId, startPage)}
        />
        of
        <Badge variant="blue">{pdfName}</Badge>
      </>
    );
  };

  return (
    <div
      className={cn(
        "flex items-center gap-2 border border-neutral-300 rounded-md px-2 py-1 mt-1",
        className
      )}
    >
      {renderContent()}
    </div>
  );
};

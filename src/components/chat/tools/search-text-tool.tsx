import { ToolInvocation } from "ai";
import { PageTool } from "./page-tool";
import { parsePageNumbers } from "@/lib/pdf/parsing";
import { useEffect, useState } from "react";
import { Badge } from "@/components/badge";

export const SearchTextTool = ({
  tool,
  className,
}: {
  tool: ToolInvocation;
  className?: string;
}) => {
  const [searchTerms, setSearchTerms] = useState("");
  const [foundPages, setFoundPages] = useState<number[]>([]);
  const { texts } = tool.args || {};

  useEffect(() => {
    if (!Array.isArray(texts)) return;

    setSearchTerms(texts.join(", "));

    if (tool.state === "result") {
      const result = (tool as any).result;
      const pageNumbers = parsePageNumbers(result);
      setFoundPages(pageNumbers);
    }
  }, [texts, tool.state]);

  return (
    <>
      <div className="flex items-center gap-2 border border-neutral-300 rounded-md px-2 py-1 mt-1">
        <Badge variant="blue" className="cursor-pointer truncate">
          {searchTerms}
        </Badge>
      </div>
      <PageTool
        tool={tool}
        className={className}
        actionText={{
          loading: "Searching",
          completed: "Found",
          failed: "No matches found",
        }}
        pages={foundPages}
      />
    </>
  );
};

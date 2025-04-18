import { ToolInvocation } from "ai";
import { Badge } from "@/components/badge";
import { cn } from "@/lib/utils";
import { InlineMath } from "react-katex";
import { parse } from "mathjs";
import { useEffect, useState } from "react";
import "@/styles/katex.css";

export const CalculateTool = ({
  tool,
  className,
}: {
  tool: ToolInvocation;
  className?: string;
}) => {
  const { expression } = tool.args || {};
  const [tex, setTex] = useState<string>("");
  const hasResult = tool.state === "result";

  useEffect(() => {
    try {
      const left = parse(expression).toTex();
      if (hasResult) {
        const right = parse(`${tool.result}`).toTex();
        setTex(`${left} = ${right}`);
      } else {
        setTex(left);
      }
    } catch (e) {
      console.error(e);
      setTex("");
    }
  }, [expression, hasResult]);

  return (
    <div className={cn("flex flex-col gap-2 my-2", className)}>
      <div className="flex items-center gap-2">
        <Badge className="bg-neutral-50">
          <span className="font-mono">
            <InlineMath>{tex}</InlineMath>
          </span>
        </Badge>
      </div>
    </div>
  );
};

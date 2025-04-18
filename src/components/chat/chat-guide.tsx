import { SquareMousePointer, Stars } from "lucide-react";

export const ChatGuide = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-2 grow">
      <p>Start a conversation</p>
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        Select text and click
        <div className="text-blue-500 inline-flex items-center gap-1 border rounded-md py-1 px-2 select-none">
          <Stars className="h-4 w-4" /> Ask AI
        </div>
      </div>
      <p className="flex items-center gap-1 text-sm text-muted-foreground">
        Or screenshot the page with <SquareMousePointer className="h-4 w-4" />
        below
      </p>
    </div>
  );
};

import { useAtomValue, useSetAtom } from "jotai";
import { ChevronLeft } from "lucide-react";

import {
  activeChatIdAtom,
  chatAtomFamilyLoadable,
  threadFinderOpenAtom,
} from "@/atoms/chats";
import { TooltipButton } from "@/components/tooltip/tooltip-button";

export const ThreadHeader = () => {
  const activeChatId = useAtomValue(activeChatIdAtom);
  const activeChat = useAtomValue(chatAtomFamilyLoadable(activeChatId));
  const setThreadFinderOpen = useSetAtom(threadFinderOpenAtom);

  if (activeChat.state !== "hasData") return null;
  return (
    <div
      className="flex items-center gap-2 mb-2 w-fit max-w-full"
      onClick={() => setThreadFinderOpen(false)}
    >
      <TooltipButton tooltip="Back">
        <ChevronLeft className="h-4 w-4" />
      </TooltipButton>
      <span className="font-medium hover:underline cursor-pointer truncate">
        {activeChat?.data.title}
      </span>
    </div>
  );
};

import { formatDistanceToNowStrict } from "date-fns";
import { useSetAtom } from "jotai";

import { Button } from "@/components/ui/button";

import { GroupedChats } from "./types";
import { threadFinderOpenAtom } from "@/atoms/chat/chats";

interface ThreadListProps {
  groupedChats: GroupedChats;
  sortedDates: string[];
  formatDateHeader: (date: string) => string;
  activeChatId: string;
  setActiveChatId: (id: string) => void;
}

export const ThreadList = ({
  groupedChats,
  sortedDates,
  formatDateHeader,
  activeChatId,
  setActiveChatId,
}: ThreadListProps) => {
  const setThreadFinderOpen = useSetAtom(threadFinderOpenAtom);

  return (
    <div className="space-y-4">
      {sortedDates.map((dateStr) => (
        <div key={dateStr} className="space-y-1">
          <div className="text-sm font-medium text-muted-foreground px-2">
            {formatDateHeader(dateStr)}
          </div>
          {groupedChats[dateStr].map((chat) => {
            const isActive = chat.id === activeChatId;

            return (
              <Button
                key={chat.id}
                variant={isActive ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => {
                  setActiveChatId(chat.id);
                  setThreadFinderOpen(false);
                }}
              >
                <div className="flex flex-row justify-between items-center w-full">
                  <span className="truncate">{chat.title || "New Chat"}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNowStrict(chat.updatedAt, {
                      addSuffix: true,
                    })}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

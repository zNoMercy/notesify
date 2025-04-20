import { useAtom } from "jotai";
import { useState } from "react";

import { activeChatIdAtom } from "@/atoms/chats";
import { useGroupedChats } from "@/hooks/chat/use-grouped-chats";

import { ThreadHeader } from "./thread-header";
import { ThreadList } from "./thread-list";
import { ThreadSearch } from "./thread-search";

export const ThreadFinder = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeChatId, setActiveChatId] = useAtom(activeChatIdAtom);

  const { groupedChats, sortedDates, formatDateHeader } =
    useGroupedChats(searchTerm);

  return (
    <div className="h-dvh p-2 space-y-2 overflow-y-auto">
      <ThreadHeader />
      <ThreadSearch searchTerm={searchTerm} onSearch={setSearchTerm} />
      <ThreadList
        groupedChats={groupedChats}
        sortedDates={sortedDates}
        formatDateHeader={formatDateHeader}
        activeChatId={activeChatId}
        setActiveChatId={setActiveChatId}
      />
    </div>
  );
};

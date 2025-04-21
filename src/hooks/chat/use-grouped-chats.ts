import { format, isToday, isYesterday } from "date-fns";
import { useAtomValue } from "jotai";
import { useMemo } from "react";

import { chatsAtomLoadable } from "@/atoms/chat/chats";
import { GroupedChats } from "@/components/pdf/chat/threads/types";

export const useGroupedChats = (searchTerm: string = "") => {
  const chatsLoadable = useAtomValue(chatsAtomLoadable);
  const chats = chatsLoadable.state === "hasData" ? chatsLoadable.data : [];

  const groupedChats = useMemo(() => {
    const filtered = searchTerm
      ? chats.filter(
          (chat) =>
            chat.title?.toLowerCase().includes(searchTerm.toLowerCase()) ??
            false
        )
      : chats;

    const sortedChats = filtered.sort((a, b) => b.updatedAt - a.updatedAt);
    return sortedChats.reduce((groups, chat) => {
      const date = new Date(chat.updatedAt);
      const dateStr = format(date, "yyyy-MM-dd");

      if (!groups[dateStr]) {
        groups[dateStr] = [];
      }
      groups[dateStr].push(chat);
      return groups;
    }, {} as GroupedChats);
  }, [chats, searchTerm]);

  const sortedDates = Object.keys(groupedChats).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "MMMM d, yyyy");
  };

  return {
    groupedChats,
    sortedDates,
    formatDateHeader,
  };
};

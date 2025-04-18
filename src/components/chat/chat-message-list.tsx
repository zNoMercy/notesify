import { cn } from "@/lib/utils";
import { useEffect, useRef, useState } from "react";

import { ChatMessage } from "./chat-message";
import { ImageContextsPreview } from "./contexts/image-context-preview";
import { TextContextsPreview } from "./contexts/text-content-preview";
import { useChat } from "@/hooks/use-chat";
import { ChatGuide } from "./chat-guide";
import { useChatHelpers } from "@/hooks/pdf/use-chat-helpers";
import { useAtomValue } from "jotai";
import { activeChatIdAtom } from "@/atoms/chats";
import { activePdfIdAtom } from "@/atoms/pdf-viewer";

interface ChatMessageListProps {
  className?: string;
}

export const ChatMessageList = ({ className }: ChatMessageListProps) => {
  const pdfId = useAtomValue(activePdfIdAtom);
  const chatId = useAtomValue(activeChatIdAtom);

  const { messages, status } = useChat({ chatId, pdfId });
  const isLoading = status === "submitted" || status === "streaming";

  useChatHelpers({ chatId, isLoading, messages });

  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "instant" });
  };

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      10;
    setShouldAutoScroll(isAtBottom);
  };

  useEffect(() => {
    if (shouldAutoScroll) {
      scrollToBottom();
    }
  }, [messages, shouldAutoScroll]);

  if (messages?.length === 0) {
    return <ChatGuide />;
  }

  return (
    <div
      ref={containerRef}
      onScroll={handleScroll}
      className={cn("overflow-y-auto flex flex-col p-2", className)}
    >
      {messages.map((message, i) => {
        const contexts = JSON.parse(message.data ?? ("{}" as any))?.contexts;
        const showHeader =
          message.role === "assistant" && messages[i - 1]?.role === "user";
        return message.role === "user" ? (
          <div key={message.id} className="flex flex-col gap-1">
            <TextContextsPreview contexts={contexts} />
            <ImageContextsPreview contexts={contexts} />
            <ChatMessage message={message} />
          </div>
        ) : (
          <ChatMessage
            key={message.id}
            message={message}
            showHeader={showHeader}
          />
        );
      })}

      {isLoading && (
        <ChatMessage
          message={{
            id: "loading",
            role: "assistant",
            content: "",
          }}
          isLoading
        />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};

import { useEffect } from "react";
import { createNewChatAtom, updateChatTitleAtom } from "@/actions/chat/chats";
import { chatAtomFamilyLoadable } from "@/atoms/chat/chats";
import { useLoadable } from "../state/use-loadable";
import { Message } from "ai";
import { useAction } from "../state/use-action";

export const useChatHelpers = ({
  chatId,
  isLoading,
  messages,
}: {
  chatId: string;
  isLoading: boolean;
  messages?: Message[];
}) => {
  const chat = useLoadable(chatAtomFamilyLoadable(chatId));
  const [createNewChat] = useAction(createNewChatAtom);
  const [updateChatTitle] = useAction(updateChatTitleAtom);

  // Create a new chat if the chatId is TMP
  useEffect(() => {
    if (chatId === "TMP") {
      console.log("Creating new chat");
      createNewChat();
    }
  }, [chatId]);

  // Update chat title
  useEffect(() => {
    const hasMessages = messages && messages.length >= 2;
    if (!isLoading && chat && !chat.title && hasMessages) {
      console.log("Updating chat title");
      updateChatTitle(chatId, messages);
    }
  }, [isLoading, chat, chatId, messages]);
};

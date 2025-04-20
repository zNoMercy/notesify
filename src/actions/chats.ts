import { atom } from "jotai";

import { activeChatIdAtom, chatAtomFamily, chatsAtom } from "@/atoms/chats";
import { Message } from "ai";
import { generateId } from "@/lib/id";
import { generateTextAtom } from "./ai";
import { ActionError } from "@/hooks/state/use-action";

export const updateChatTitleAtom = atom(
  null,
  async (get, set, chatId: string, messages: Message[]) => {
    const chatAtom = chatAtomFamily(chatId);

    let text = "";
    for (const message of messages) {
      if (message.role === "user") {
        text += `User: ${message.content}\n`;
      } else if (message.role === "assistant" && message.content) {
        text += `AI: ${message.content}\n`;
      }
    }
    text = text.slice(0, 1000);

    const prompt = `Create a short title, starting with a meaningful emoji, for the following text. Do not use Markdown.\n${text}`;
    const res = await set(generateTextAtom, { prompt });
    if (!res?.text) {
      throw new ActionError("Failed to generate title");
    }
    const title = res.text;
    const chat = await get(chatAtom);
    set(chatAtom, { ...chat, title, updatedAt: new Date() });

    set(chatsAtom, async (currentChats) => {
      return (await currentChats).map((chat) =>
        chat.id === chatId ? { ...chat, title, updatedAt: new Date() } : chat
      );
    });
  }
);

export const createNewChatAtom = atom(null, (get, set) => {
  const newId = generateId();
  const chatAtom = chatAtomFamily(newId);
  const newChat = {
    id: newId,
    title: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  console.log("Created new chat", newId);
  set(chatsAtom, async (currentChats) => {
    return [...(await currentChats), newChat];
  });
  set(chatAtom, newChat);
  set(activeChatIdAtom, newId);
  return newId;
});

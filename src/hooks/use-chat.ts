import {
  getOpenedPdfsMetadataAtom,
  getPageTextAtom,
  searchTextsAtom,
} from "@/actions/pdf-viewer";
import { withThinkingAtom } from "@/atoms/chats";
import { activeContextsAtom } from "@/atoms/contexts";
import { messagesAtomFamilyLoadable } from "@/atoms/messages";
import { currentPageAtomFamily } from "@/atoms/pdf-viewer";
import { buildMessages, buildSystemMessage } from "@/lib/pdf/chat";
import { Message } from "ai";
import { useChat as useBaseChat } from "@ai-sdk/react";
import { useAtomValue, useSetAtom } from "jotai";
import { evaluate } from "mathjs";
import { createChatStreamAtom } from "@/actions/ai";
import { useLoadable } from "./use-loadable";
import { saveMessageAtom } from "@/actions/messages";
import { MessageDB } from "@/db/schema";
import { getSelectedModelAtom } from "@/actions/providers";
import { useAction } from "./use-action";
import { toast } from "sonner";

export const useChat = ({
  chatId,
  pdfId,
}: {
  chatId: string;
  pdfId?: string;
}) => {
  const [getModel] = useAction(getSelectedModelAtom);
  const viewingPage = useAtomValue(currentPageAtomFamily(pdfId));
  const initialMessages = useLoadable(messagesAtomFamilyLoadable(chatId));
  const withThinking = useAtomValue(withThinkingAtom);
  const setActiveContexts = useSetAtom(activeContextsAtom);
  const [getPageText] = useAction(getPageTextAtom);
  const [searchTexts] = useAction(searchTextsAtom);
  const [getOpenedPdfsMetadata] = useAction(getOpenedPdfsMetadataAtom);
  const [createChatStream] = useAction(createChatStreamAtom);
  const [saveMessage] = useAction(saveMessageAtom);

  return useBaseChat({
    id: chatId,
    // api: import.meta.env.VITE_CHAT_ENDPOINT,
    maxSteps: 10,
    initialMessages: initialMessages as Message[],
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === "calculate") {
        const { expression } = toolCall.args as { expression: string };
        console.log("Executing calculate tool", expression);
        const res = evaluate(expression);
        console.log("calculate result", res);
        return res;
      } else if (toolCall.toolName === "getPDFPageText") {
        const { pdfId, startPage, endPage } = toolCall.args as {
          pdfId: string;
          startPage: number;
          endPage: number;
        };
        console.log("Executing getPDFPageText tool", startPage, endPage);
        const result = await getPageText({
          pdfId,
          startPage,
          endPage,
        });
        if (!result) return;
        const { text } = result;
        console.log("getPDFPageText result", text);
        return text;
      } else if (toolCall.toolName === "searchText") {
        const { pdfId, texts } = toolCall.args as {
          pdfId: string;
          texts: string[];
        };

        console.log("Executing searchText tool", texts);
        const pageText = await searchTexts(pdfId, texts);
        console.log("searchText result", pageText);
        return pageText;
      }
    },
    fetch: async (input, init) => {
      const openedPdfs = await getOpenedPdfsMetadata();
      if (!openedPdfs || openedPdfs.length === 0) {
        toast.error("No opened PDFs");
        return new Response("No opened PDFs");
      }

      if (!pdfId) {
        return new Response("No PDF selected");
      }
      if (typeof viewingPage !== "number") {
        return new Response("No viewing page");
      }

      const model = await getModel("Chat");
      if (!model) {
        return new Response("Please provide API key and select a model");
      }

      const body = JSON.parse(init?.body?.toString() ?? "{}");
      const { messages } = body;
      const lastMessage = messages[messages.length - 1];
      const data = JSON.parse(lastMessage.data ?? "{}");

      if (lastMessage.role === "user") {
        const { id, createdAt, ...otherData } = data;
        const date = new Date(createdAt);
        const userMessage = {
          id,
          chatId,
          createdAt: date,
          role: "user",
          content: lastMessage.content,
          data: JSON.stringify(otherData),
          annotations: null,
        } as MessageDB;
        console.log("Saving user message", userMessage);
        await saveMessage(userMessage);
      }

      const system = buildSystemMessage(
        openedPdfs,
        pdfId,
        viewingPage,
        withThinking
      );
      const messagesWithContext = buildMessages(messages, data?.contexts);
      setActiveContexts([]);

      const res = await createChatStream({
        input,
        init,
        system,
        messages: messagesWithContext as any,
        useCustomModel: true,
      });
      if (!res) {
        return new Response("Something went wrong, please try again");
      }
      return res;
    },
    onFinish: async (message) => {
      const aiMessage = {
        ...message,
        chatId,
        createdAt: message.createdAt ?? new Date(),
        data: null,
        annotations: message.annotations ?? null,
        parts: message.parts,
      };
      console.log("Saving AI message", aiMessage);
      await saveMessage(aiMessage);
    },
  });
};

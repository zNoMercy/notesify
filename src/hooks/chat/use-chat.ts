import { getOpenedPdfsMetadataAtom } from "@/actions/pdf/pdf-viewer";
import { withThinkingAtom } from "@/atoms/chat/chats";
import { activeContextsAtom } from "@/atoms/chat/contexts";
import { messagesAtomFamilyLoadable } from "@/atoms/chat/messages";
import { currentPageAtomFamily } from "@/atoms/pdf/pdf-viewer";
import { buildMessages, buildSystemMessage } from "@/lib/chat/chat";
import { Message } from "ai";
import { useChat as useBaseChat } from "@ai-sdk/react";
import { useAtomValue, useSetAtom } from "jotai";
import { evaluate } from "mathjs";
import { createChatStreamAtom } from "@/actions/chat/ai";
import { useLoadable } from "../state/use-loadable";
import { saveMessageAtom } from "@/actions/chat/messages";
import { getSelectedModelAtom } from "@/actions/setting/providers";
import { useAction } from "../state/use-action";
import { toast } from "sonner";
import { getPdftextAtom } from "@/actions/pdf/pdf-parsing";
import { searchPagesAtom } from "@/actions/pdf/pdf-indexing";
import {
  CalculateParameters,
  GetPDFPageTextParameters,
  SearchPagesParameters,
} from "@/lib/chat/tools";

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
  const [getOpenedPdfsMetadata] = useAction(getOpenedPdfsMetadataAtom);
  const [createChatStream] = useAction(createChatStreamAtom);
  const [saveMessage] = useAction(saveMessageAtom);

  // For tool calls
  const [getPageText] = useAction(getPdftextAtom);
  const [searchPages] = useAction(searchPagesAtom);
  // const [searchTexts] = useAction(searchTextsAtom);

  return useBaseChat({
    id: chatId,
    // api: import.meta.env.VITE_CHAT_ENDPOINT,
    maxSteps: 10,
    sendExtraMessageFields: true,
    initialMessages: initialMessages as Message[],
    onToolCall: async ({ toolCall }) => {
      console.log("Executing tool", toolCall.toolName, toolCall.args);

      if (toolCall.toolName === "calculate") {
        const { expression } = toolCall.args as CalculateParameters;
        return evaluate(expression);
      }

      if (toolCall.toolName === "getPDFPageText") {
        const { pdfId, startPage, endPage } =
          toolCall.args as GetPDFPageTextParameters;

        const text = await getPageText({
          pdfId,
          startPage,
          endPage,
        });
        console.log("Get page text result", text);
        return text || "No text found";
      }

      if (toolCall.toolName === "searchPages") {
        const { pdfId, query } = toolCall.args as SearchPagesParameters;
        const result = await searchPages(pdfId, query);
        return result;
      }

      // if (toolCall.toolName === "searchText") {
      //   const { pdfId, texts } = toolCall.args as SearchTextParameters;
      //   const pageText = await searchTexts(pdfId, texts);
      //   return pageText || "No text found";
      // }
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
        const userMessage = {
          ...lastMessage,
          chatId,
          createdAt: new Date(lastMessage.createdAt),
          role: "user",
          annotations: null,
        };
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

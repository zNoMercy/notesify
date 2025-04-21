import { CoreUserMessage, Message } from "ai";

import { Context } from "@/atoms/chat/contexts";
import { PDFMetadata } from "@/actions/pdf/pdf-viewer";
import { thinkingPrompt } from "../prompts/thinking";

const buildTextContent = (content: string, contexts?: Context[]) => {
  const textContext = contexts
    ?.filter((c) => c.type === "text")
    .map((c) => c.content)
    .join("\n\n");
  return {
    type: "text",
    text: textContext
      ? `${content}\n<user_selected_text>:\n${textContext}\n</user_selected_text>`
      : content,
  };
};

const buildImageContent = (contexts?: Context[]) => {
  return (
    contexts
      ?.filter((c) => c.type === "page" || c.type === "area")
      .map((c) => ({
        type: "image",
        image: c.content,
      })) || []
  );
};

export const buildSystemMessage = (
  openedPdfs: PDFMetadata[],
  viewingPdfId: string,
  viewingPage: number,
  withThinking: boolean = false
) => {
  const openedPdfsContext = openedPdfs
    .map(
      (pdf) =>
        `{ name: "${pdf.name}", id: "${pdf.id}", totalPages: ${pdf.pageCount} }`
    )
    .join(", ");
  const viewingPdfName = openedPdfs.find(
    (pdf) => pdf.id === viewingPdfId
  )?.name;

  let systemMessage = `You are a helpful PDF assistant. The user has opened ${openedPdfs.length} PDFs: ${openedPdfsContext}, and is currently viewing page ${viewingPage} of "${viewingPdfName}". Reply in Markdown format.`;
  if (withThinking) {
    systemMessage += `\nFollow the thinking protocol to answer the user's question:
${thinkingPrompt}`;
  }
  // console.log("System message", systemMessage);
  return systemMessage;
};

export const buildMessages = (messages: Message[], contexts?: Context[]) => {
  const currentMessage = messages[messages.length - 1];
  if (currentMessage.role !== "user") {
    return messages;
  }
  const initialMessages = messages.slice(0, -1);

  const textContent = buildTextContent(currentMessage.content, contexts);
  const imageContent = buildImageContent(contexts);
  return [
    ...initialMessages,
    {
      role: "user",
      content: [textContent, ...imageContent].filter(Boolean),
    } as CoreUserMessage,
  ];
};

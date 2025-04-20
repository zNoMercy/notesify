import { atom } from "jotai";
import {
  createDataStreamResponse,
  generateText,
  Message,
  streamText,
} from "ai";
import { tools } from "@/lib/chat/tools";
import { getSelectedModelAtom } from "./providers";

export const streamTextAtom = atom(
  null,
  async (get, set, params: Partial<Parameters<typeof streamText>[0]>) => {
    const model = set(getSelectedModelAtom, "Chat");
    const res = await streamText({
      model,
      ...params,
    });
    return res;
  }
);

export const generateTextAtom = atom(
  null,
  async (get, set, params: Partial<Parameters<typeof generateText>[0]>) => {
    const model = set(getSelectedModelAtom, "Chat");
    const res = await generateText({
      model,
      ...params,
    });
    return res;
  }
);

export const createChatStreamAtom = atom(
  null,
  async (
    get,
    set,
    {
      init,
      input,
      useCustomModel,
      system,
      messages,
    }: {
      init?: RequestInit;
      input: URL | RequestInfo;
      useCustomModel?: boolean;
      system?: string;
      messages?: Message[];
    }
  ) => {
    if (useCustomModel) {
      const customModel = set(getSelectedModelAtom, "Chat");

      return createDataStreamResponse({
        execute: (dataStream) => {
          dataStream.writeMessageAnnotation({
            modelId: customModel.modelId,
          });
          const res = streamText({
            model: customModel,
            system,
            messages,
            tools,
            toolCallStreaming: true,
            abortSignal: init?.signal || undefined,
            // onFinish: (message) => {
            //   console.log("Chat finished", message);
            // },
          });
          res.mergeIntoDataStream(dataStream);
        },
      });
    }

    // const body = JSON.parse(init?.body?.toString() ?? "{}");
    // body["system"] = system;
    // const newInit = {
    //   ...init,
    //   headers: {
    //     ...init?.headers,
    //     Authorization: `Bearer ${session?.access_token}`,
    //   },
    //   body: JSON.stringify(body),
    // };
    // return fetch(input, newInit);
  }
);

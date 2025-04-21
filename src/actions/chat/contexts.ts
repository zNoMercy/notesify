import { atom } from "jotai";

import {
  activeBoundingContextAtom,
  activeContextsAtom,
  Context,
} from "@/atoms/chat/contexts";
import { getPageAtom } from "../pdf/pdf-viewer";

export const addContextAtom = atom(null, (get, set, context: Context) => {
  set(activeContextsAtom, (currentContexts) => [...currentContexts, context]);
});

export const removeContextAtom = atom(null, (get, set, id: string) => {
  set(activeContextsAtom, (currentContexts) =>
    currentContexts.filter((context) => context.id !== id)
  );
});

export const jumpToContextAtom = atom(
  null,
  async (get, set, context: Context) => {
    set(activeBoundingContextAtom, context);
    const pdfId = context.pdfId;
    const page = await set(getPageAtom, pdfId, context.page);
    page?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }
);

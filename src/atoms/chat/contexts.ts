import { atom } from "jotai";

import { Rect } from "@/lib/types";
import { atomWithStorage } from "jotai/utils";

export type Context = {
  id: string;
  type: "text" | "area" | "page" | "viewing-page";
  content?: string;
  rects: Rect[];
  page: number;
  pdfId: string;
};

export const activeContextsAtom = atom<Context[]>([]);
export const activePreviewContextAtom = atom<Context>();
export const activeBoundingContextAtom = atom<Context>();

export const useViewingPagesAtom = atomWithStorage<boolean>(
  "use-viewing-pages",
  true
);

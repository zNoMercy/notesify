import { atom } from "jotai";

import {
  activeBoundingContextAtom,
  activeContextsAtom,
  Context,
} from "@/atoms/contexts";
import { getPageAtom } from "./pdf-viewer";

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

// export const getViewingPageTextsAtom = atom(
//   null,
//   async (get, set, pdfId: string) => {
//     const useViewingPages = get(useViewingPagesAtom);
//     const currentPage = get(currentPageAtomFamily(pdfId));
//     const pdfDocument = get(documentAtomFamily(pdfId));

//     if (!useViewingPages || !currentPage || !pdfDocument) {
//       return [];
//     }

//     const pageCount = pdfDocument.numPages;
//     const pagesToGet = Array.from(
//       new Set([
//         Math.max(1, currentPage - 1),
//         currentPage,
//         Math.min(pageCount, currentPage + 1),
//       ])
//     ).sort((a, b) => a - b);

//     const pageTexts = await Promise.all(
//       pagesToGet.map(async (pageNum) => {
//         const page = await pdfDocument.getPage(pageNum);
//         const textContent = await page.getTextContent();
//         const text = textContent.items.map((item: any) => item.str).join(" ");
//         console.log("text", pageNum, text);

//         return {
//           id: nanoid(),
//           type: "viewing-page",
//           page: pageNum,
//           content: text,
//           rects: [],
//         } as Context;
//       })
//     );

//     return pageTexts;
//   }
// );

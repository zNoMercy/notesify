import { fileAtomFamily } from "@/atoms/file-system";
import { pdfAtomFamily } from "@/atoms/pdf";
import {
  documentAtomFamily,
  openedPdfIdsAtom,
  viewerAtomFamily,
} from "@/atoms/pdf-viewer";
import { ScrollPosition } from "@/db/schema";
import { ActionError } from "@/hooks/state/use-action";
import { atom } from "jotai";

export type PDFMetadata = {
  id: string;
  name: string;
  pageCount: number;
};

export const getPageAtom = atom(
  null,
  async (get, set, pdfId: string, pageNumber: number) => {
    const viewer = get(viewerAtomFamily(pdfId));
    if (!viewer) return;

    const page = await viewer.getPageView(pageNumber - 1)?.div;
    return page;
  }
);

export const jumpToPageAtom = atom(
  null,
  async (get, set, pdfId: string, pageNumber: number) => {
    const page = await set(getPageAtom, pdfId, pageNumber);
    if (!page) {
      throw new ActionError("Failed to jump to page");
    }
    page.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "center",
    });
  }
);

export const updatePdfAtom = atom(
  null,
  async (
    get,
    set,
    {
      pdfId,
      pageCount,
      scroll,
      zoom,
    }: {
      pdfId: string;
      pageCount?: number;
      scroll?: ScrollPosition;
      zoom?: number;
    }
  ) => {
    const pdf = await get(pdfAtomFamily(pdfId));
    if (!pdf) {
      throw new ActionError("Failed to update PDF");
    }
    set(pdfAtomFamily(pdfId), {
      ...pdf,
      pageCount: pageCount ?? pdf.pageCount,
      scroll: scroll ?? pdf.scroll,
      zoom: zoom ?? pdf.zoom,
    });
  }
);

export const searchTextsAtom = atom(
  null,
  async (get, set, pdfId: string, texts: string[], pageLimit: number = 5) => {
    const pdfDocument = get(documentAtomFamily(pdfId));
    if (!pdfDocument) {
      return "No PDF document found";
    }
    const pageTexts: string[] = [];
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      pageTexts.push(textContent.items.map((item: any) => item.str).join(" "));
    }

    const targetPages: number[] = [];
    for (const pageText of pageTexts) {
      for (const text of texts) {
        if (pageText.toLowerCase().includes(text.toLowerCase())) {
          targetPages.push(pageTexts.indexOf(pageText));
          break;
        }
      }
      if (targetPages.length >= pageLimit) {
        break;
      }
    }

    const results =
      targetPages.length > 0
        ? targetPages
            .map(
              (page) => `<page_${page + 1}>
${pageTexts[page]}
</page_${page + 1}>`
            )
            .join("\n")
        : "No matching text found";
    return results;
  }
);

export const getPdfMetadataAtom = atom(
  null,
  async (get, set, pdfId: string) => {
    const pdf = await get(fileAtomFamily(pdfId));
    const pdfMeta = await get(pdfAtomFamily(pdfId));
    if (!pdf || !pdfMeta) {
      throw new ActionError("Failed to get PDF metadata");
    }
    return {
      id: pdf.id,
      name: pdf.name,
      pageCount: pdfMeta.pageCount,
    };
  }
);

export const getOpenedPdfsMetadataAtom = atom(null, async (get, set) => {
  const pdfIds = get(openedPdfIdsAtom);
  const metadata = await Promise.all(
    pdfIds.map(async (pdfId) => {
      const pdf = await get(fileAtomFamily(pdfId));
      const pdfMeta = await get(pdfAtomFamily(pdfId));
      if (!pdf || !pdfMeta) return null;
      return {
        id: pdf.id,
        name: pdf.name,
        pageCount: pdfMeta.pageCount,
      };
    })
  );
  return metadata.filter(Boolean);
});

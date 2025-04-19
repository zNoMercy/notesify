import { atom } from "jotai";
import { parsePdfAtom } from "./pdf-parsing";
import { indexPages } from "@/lib/pdf/indexing";
import { getSelectedModelAtom } from "./providers";
import { pdfIndexingAtomFamily } from "@/atoms/pdf-indexing";
import { PDFIndexingLevel } from "@/db/schema";

export const indexPdfAtom = atom(null, async (get, set, pdfId: string) => {
  const indexedPdf = await get(pdfIndexingAtomFamily(pdfId));
  if (indexedPdf && indexedPdf.length > 0) {
    console.log("Cached indexed PDF", indexedPdf);
    return indexedPdf;
  }

  const model = set(getSelectedModelAtom, "Indexing");
  const parsedPdf = await set(parsePdfAtom, { pdfId });

  const result = await indexPages({ model, parsedPdf });
  const formattedResult = result.map((r) => ({
    id: `${pdfId}-${r.page}`,
    pdfId,
    model: model.modelId,
    summary: r.summary,
    level: "page" as PDFIndexingLevel,
    startPage: r.page,
    endPage: null,
  }));
  set(pdfIndexingAtomFamily(pdfId), formattedResult);
  return formattedResult;
});

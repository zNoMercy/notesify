import { atom } from "jotai";
import { getPdftextAtom, parsePdfAtom } from "./pdf-parsing";
import { indexPages } from "@/lib/pdf/indexing";
import { getSelectedModelAtom } from "../setting/providers";
import { pdfIndexingAtomFamily } from "@/atoms/pdf/pdf-indexing";
import { PDFIndexingLevel } from "@/db/schema";
import { generateObject } from "ai";
import { z } from "zod";
import { ActionError } from "@/hooks/state/use-action";

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

export const searchPagesAtom = atom(
  null,
  async (
    get,
    set,
    pdfId: string,
    query: string
  ): Promise<{ pages: number[]; pageTexts: string }> => {
    const indexedPdf = await set(indexPdfAtom, pdfId);

    const model = set(getSelectedModelAtom, "Indexing");
    const pageSummaries = indexedPdf
      .map((p) => `PAGE ${p.startPage}:\n${p.summary}`)
      .join("\n\n");
    // console.log("Page summaries", pageSummaries);

    try {
      const res = await generateObject({
        model,
        output: "array",
        schema: z.number().describe("Page number"),
        prompt: `Find at most 10 relevant pages for the following query. Return only page numbers.
  
  Query:
  ${query}
  
  Page summaries:
  ${pageSummaries}`,
        maxTokens: 64,
      });
      const pages = res.object;
      const pageTexts = await set(getPdftextAtom, {
        pdfId,
        pages,
      });
      // console.log("Search pages result", pages);
      return { pages, pageTexts };
    } catch (error) {
      console.error(error);
      throw new ActionError(
        "Failed to search pages. Try to use another Indexing model."
      );
    }
  }
);

import { pdfDataAtomFamily } from "@/atoms/pdf";
import { pdfParsingAtomFamily } from "@/atoms/pdf-parsing";
import { documentAtomFamily } from "@/atoms/pdf-viewer";
import {
  configuredProvidersAtom,
  openSettingsDialogAtom,
} from "@/atoms/providers";
import { ActionError } from "@/hooks/use-action";
import { ParsedPDF, parsePdf, parsePdfWithOcr } from "@/lib/pdf/parsing";
import { atom } from "jotai";

export const parsePdfAtom = atom(
  null,
  async (
    get,
    set,
    {
      pdfId,
      method,
    }: {
      pdfId: string;
      method?: "ocr" | "pdfjs";
    }
  ): Promise<ParsedPDF> => {
    const parsedPdf = await get(pdfParsingAtomFamily(pdfId));
    if (parsedPdf && parsedPdf.length > 0) {
      console.log("Cached parsed PDF", parsedPdf);
      return parsedPdf;
    }

    const apiKey = get(configuredProvidersAtom).find(
      (p) => p.type === "mistral"
    )?.settings.apiKey;
    // Default to ocr if no method is specified and API key is available
    method = method || (apiKey ? "ocr" : "pdfjs");
    console.log("Parsing PDF: ", method);

    if (method === "pdfjs") {
      const pdfDocument = get(documentAtomFamily(pdfId));
      if (!pdfDocument) {
        throw new ActionError("Failed to get PDF");
      }

      const result = await parsePdf({ pdfId, pdfDocument });
      set(pdfParsingAtomFamily(pdfId), result);
      return result;
    } else {
      const pdf = await get(pdfDataAtomFamily(pdfId));
      if (!pdf) {
        throw new ActionError("PDF not found");
      }

      if (!apiKey) {
        set(openSettingsDialogAtom, true);
        throw new ActionError("Please configure the Mistral provider");
      }

      const result = await parsePdfWithOcr({
        apiKey,
        pdfId,
        pdfData: pdf.data,
      });
      set(pdfParsingAtomFamily(pdfId), result);
      return result;
    }
  }
);

export const getPdftextAtom = atom(
  null,
  async (
    get,
    set,
    {
      pdfId,
      startPage,
      endPage,
    }: { pdfId: string; startPage?: number; endPage?: number }
  ): Promise<string> => {
    const parsedPdf = await set(parsePdfAtom, { pdfId });
    return parsedPdf
      .filter(
        (p) =>
          p.page >= (startPage ?? 1) && p.page <= (endPage ?? parsedPdf.length)
      )
      .map((p) => `<page_${p.page}>\n${p.text}\n</page_${p.page}>`)
      .join("\n\n");
  }
);

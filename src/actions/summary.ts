import { atom } from "jotai";
import { streamTextAtom } from "./ai";
import { formatMessages, replaceImageReferences } from "@/lib/note/summary";
import { generatingNotesAtom } from "@/atoms/notes";
import { parsePdfAtom } from "./pdf-parsing";
import {
  LengthType,
  QualityType,
} from "@/components/plate-ui/custom/generate-notes-dialog";

export const generateSummaryAtom = atom(
  null,
  async (
    get,
    set,
    {
      notesId,
      pdfId,
      length,
      quality,
      onUpdate,
    }: {
      notesId: string;
      pdfId: string;
      length: LengthType;
      quality: QualityType;
      onUpdate?: (summaryPart: string) => void;
    }
  ) => {
    const parsedPdf = await set(parsePdfAtom, {
      pdfId,
      method: quality === "Standard" ? "pdfjs" : "ocr",
    });

    const text = parsedPdf.map((p) => p.text).join("\n");
    const images = parsedPdf
      .map((p) => p.images)
      .flat()
      .filter((img) => img !== null);
    const messages = formatMessages(text, length, images);

    const abortSignal = new AbortController();
    set(generatingNotesAtom(notesId), abortSignal);
    const res = await set(streamTextAtom, {
      messages,
      abortSignal: abortSignal.signal,
      maxTokens: 8192,
    });

    let summaryPart = "";
    let lastUpdateTime = Date.now();
    const updateInterval = 3000;

    for await (const chunk of res.textStream) {
      if (!chunk) continue;
      summaryPart += chunk;
      // console.log(chunk);

      // Check if we have a new section starting (a line beginning with "## ")
      if (
        summaryPart.match(/\n## [^\n]+/) &&
        Date.now() - lastUpdateTime > updateInterval
      ) {
        const lastSectionPos = summaryPart.lastIndexOf("\n## ");
        const completedSection = summaryPart.substring(0, lastSectionPos);
        summaryPart = summaryPart.substring(lastSectionPos);

        onUpdate?.(
          images
            ? replaceImageReferences(completedSection, images)
            : completedSection
        );
        lastUpdateTime = Date.now();
      }
    }

    onUpdate?.(summaryPart);

    set(generatingNotesAtom(notesId), undefined);
  }
);

export const stopGeneratingNotesAtom = atom(
  null,
  (get, set, notesId?: string) => {
    const abortSignal = get(generatingNotesAtom(notesId));
    if (abortSignal) {
      abortSignal.abort();
      set(generatingNotesAtom(notesId), undefined);
    }
  }
);

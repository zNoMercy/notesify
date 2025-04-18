import { atom } from "jotai";
import { getPageTextAtom } from "./pdf-viewer";
import { toast } from "sonner";
import { streamTextAtom } from "./ai";
import { formatMessages, replaceImageReferences } from "@/lib/prompts/summary";
import { generatingNotesAtom } from "@/atoms/notes";
import { parsePdfAtom } from "./pdf-parsing";
import {
  LengthType,
  QualityType,
} from "@/components/plate-ui/custom/generate-notes-dialog";
import { ActionError } from "@/hooks/use-action";

export const getSummaryInputMessagesAtom = atom(
  null,
  async (get, set, pdfId: string, quality: QualityType, length: LengthType) => {
    if (quality === "Standard") {
      const { text, lastPage, docPage } = await set(getPageTextAtom, {
        pdfId,
        maxChars: 128000,
      });
      if (lastPage !== docPage) {
        toast.info(
          `The document is too long. Only pages up to page ${lastPage} are included in the summary.`
        );
      }
      return { text, images: null, messages: formatMessages(text, length) };
    } else {
      const result = await set(parsePdfAtom, pdfId);
      if (!result) return;

      const text = result.map((r) => r.text).join("\n");
      const images = result.map((r) => r.images).flat();
      return {
        text,
        images,
        messages: formatMessages(text, length, images),
      };
    }
  }
);

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
    const input = await set(
      getSummaryInputMessagesAtom,
      pdfId,
      quality,
      length
    );
    if (!input) {
      throw new ActionError("Failed to generate summary: No input");
    }

    const { images, messages } = input;

    const abortSignal = new AbortController();
    set(generatingNotesAtom(notesId), abortSignal);
    const res = await set(streamTextAtom, {
      messages,
      abortSignal: abortSignal.signal,
      maxTokens: 8192,
    });
    if (!res?.textStream) {
      throw new ActionError("Failed to generate summary: No text stream");
    }

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

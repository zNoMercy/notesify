import { atom } from "jotai";
import { getPageTextAtom } from "./pdf-viewer";
import { pageCountAtomFamily } from "@/atoms/pdf-viewer";
import { mindmapAtomFamily } from "@/atoms/mindmaps";
import { removeMarkdownTag } from "@/lib/mindmap";
import { toast } from "sonner";
import { streamTextAtom } from "./ai";

export const generateMindmapAtom = atom(
  null,
  async (
    get,
    set,
    {
      pdfId,
      force,
      abortSignal,
    }: { pdfId: string; force?: boolean; abortSignal?: AbortSignal }
  ) => {
    const mindmap = await get(mindmapAtomFamily(pdfId));
    if (!force && mindmap) {
      return;
    }

    const pageCount = await get(pageCountAtomFamily(pdfId));
    if (!pageCount) {
      return;
    }
    const { text, lastPage } = await set(getPageTextAtom, {
      pdfId,
      startPage: 1,
      endPage: pageCount,
      maxChars: 128000,
    });
    if (lastPage !== pageCount) {
      toast.info(
        `The document is too long. Only pages up to page ${lastPage} are included in the mindmap.`
      );
    }
    const prompt = `Follow the instructions to create a mindmap that organizes the key sections, subsections, and main points from the text below.

<text>
${text}
</text>

<instructions>
- Write in Markdown, and use only headings (#, ##, ###), list items (-), emphasis (*), and KaTex ($ ... $)
- Write concise and clear points
- Maintain a clear hierarchical structure
- DO NOT include any text other than the mindmap
</instructions>

<example>
# Title
## Main Section 1
### Subsection 1
- **Point 1**: ...
- **Point 2**: ...
</example>`;

    set(mindmapAtomFamily(pdfId), "# Generating mindmap...");
    console.log("Generating mindmap");

    const res = await set(streamTextAtom, { prompt, abortSignal });
    if (!res?.textStream) {
      return;
    }

    let mindmapMarkdown = "";
    let lastUpdate = Date.now();
    for await (const chunk of res.textStream) {
      mindmapMarkdown = removeMarkdownTag(mindmapMarkdown) + chunk;
      // Update mindmap every 2000ms
      if (mindmapMarkdown.length >= 5 && Date.now() - lastUpdate > 2000) {
        set(mindmapAtomFamily(pdfId), mindmapMarkdown);
        lastUpdate = Date.now();
      }
    }
    set(mindmapAtomFamily(pdfId), mindmapMarkdown);
  }
);

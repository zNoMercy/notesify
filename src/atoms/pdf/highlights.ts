import { atom } from "jotai";
import { atomFamily, atomWithDefault, loadable } from "jotai/utils";
import { atomWithStorage } from "jotai/utils";

import { getDB } from "@/db/sqlite";
import { Highlight, highlightsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export const activeHighlightAtom = atom<Highlight>();

export const highlightAtomFamily = atomFamily((id: string) =>
  atomWithStorage<Highlight | null>(
    `highlight-${id}`,
    null,
    {
      async getItem(key, initialValue) {
        const db = await getDB();
        const highlight = await db.query.highlightsTable.findFirst({
          where: eq(highlightsTable.id, id),
        });
        return highlight ?? initialValue;
      },
      async setItem(key, value) {
        if (!value) return;
        const db = await getDB();
        await db.insert(highlightsTable).values(value).onConflictDoUpdate({
          target: highlightsTable.id,
          set: value,
        });
      },
      async removeItem(key) {
        const db = await getDB();
        await db.delete(highlightsTable).where(eq(highlightsTable.id, id));
      },
    },
    {
      getOnInit: true,
    }
  )
);

export const highlightsAtomFamily = atomFamily((pdfId?: string) =>
  atomWithDefault(async (get) => {
    if (!pdfId) {
      return [];
    }
    const db = await getDB();
    const highlights = await db.query.highlightsTable.findMany({
      where: eq(highlightsTable.pdfId, pdfId),
    });
    return highlights;
  })
);

// Derived atom for highlights grouped by page number
export const highlightsByPageAtomFamily = atomFamily((pdfId?: string) =>
  atom(async (get) => {
    const highlights = await get(highlightsAtomFamily(pdfId));
    const highlightsByPage: Record<number, Highlight[]> = {};

    highlights.forEach((highlight) => {
      // Group rects by page number
      const pages = new Set(highlight.rects.map((rect) => rect.page));

      pages.forEach((page) => {
        const pageRects = highlight.rects.filter((rect) => rect.page === page);
        const pageHighlight = { ...highlight, rects: pageRects };

        if (!highlightsByPage[page]) {
          highlightsByPage[page] = [];
        }
        highlightsByPage[page].push(pageHighlight);
      });
    });

    return highlightsByPage;
  })
);

export const highlightsByPageAtomFamilyLoadable = (pdfId?: string) =>
  loadable(highlightsByPageAtomFamily(pdfId));

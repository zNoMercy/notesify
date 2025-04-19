import { getDB } from "@/db/sqlite";
import { eq } from "drizzle-orm";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { PDFIndexing, pdfIndexingTable } from "@/db/schema";

export const pdfIndexingAtomFamily = atomFamily((pdfId: string) =>
  atomWithStorage<PDFIndexing[] | null>(
    `pdf-indexing-${pdfId}`,
    null,
    {
      async getItem(key, initialValue) {
        const db = await getDB();
        const value = await db.query.pdfIndexingTable.findMany({
          where: eq(pdfIndexingTable.pdfId, pdfId),
          orderBy: (pdfIndexing, { asc }) => [asc(pdfIndexing.startPage)],
        });
        return value ?? initialValue;
      },
      async setItem(key, values) {
        if (!values) return;
        await this.removeItem(key);
        const db = await getDB();
        await db.insert(pdfIndexingTable).values(values);
      },
      async removeItem(key) {
        const db = await getDB();
        await db
          .delete(pdfIndexingTable)
          .where(eq(pdfIndexingTable.pdfId, pdfId));
      },
    },
    {
      getOnInit: true,
    }
  )
);

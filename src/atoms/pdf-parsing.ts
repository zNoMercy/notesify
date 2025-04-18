import { getDB } from "@/db/sqlite";
import { eq } from "drizzle-orm";
import { atomFamily, atomWithStorage } from "jotai/utils";
import { PDFParsing, pdfParsingTable } from "@/db/schema";

export const pdfParsingAtomFamily = atomFamily((pdfId: string) =>
  atomWithStorage<PDFParsing[] | null>(
    `pdf-parsing-${pdfId}`,
    null,
    {
      async getItem(key, initialValue) {
        const db = await getDB();
        const value = await db.query.pdfParsingTable.findMany({
          where: eq(pdfParsingTable.pdfId, pdfId),
          orderBy: (pdfParsing, { asc }) => [asc(pdfParsing.page)],
        });
        return value ?? initialValue;
      },
      async setItem(key, values) {
        if (!values) return;
        await this.removeItem(key);
        const db = await getDB();
        await db.insert(pdfParsingTable).values(values);
      },
      async removeItem(key) {
        const db = await getDB();
        await db
          .delete(pdfParsingTable)
          .where(eq(pdfParsingTable.pdfId, pdfId));
      },
    },
    {
      getOnInit: true,
    }
  )
);

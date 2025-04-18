import { atomFamily } from "jotai/utils";
import { atomWithStorage } from "jotai/utils";
import {
  readFile,
  writeFile,
  remove,
  exists,
  mkdir,
} from "@tauri-apps/plugin-fs";
import * as path from "@tauri-apps/api/path";
import { wrapNativeStorage } from "@/lib/tauri";
import { toast } from "sonner";
import { getDB } from "@/db/sqlite";
import { eq } from "drizzle-orm";
import { Pdf, pdfsTable } from "@/db/schema";

export type PDF = {
  id: string;
  data: Blob;
};

export const createOrGetPDFDir = async () => {
  const dir = await path.join(await path.appDataDir(), "pdfs");
  if (!(await exists(dir))) {
    await mkdir(dir);
  }
  return dir;
};

const getPDFPath = async (id: string) => {
  return await path.join(await createOrGetPDFDir(), `${id}.pdf`);
};

export const pdfDataAtomFamily = atomFamily((id: string) =>
  atomWithStorage<PDF | null>(
    `pdf-data-${id}`,
    null,
    wrapNativeStorage({
      async getItem(key, initialValue) {
        try {
          const data = await readFile(await getPDFPath(id));
          const blob = new Blob([data]);
          return { id, data: blob };
        } catch (error) {
          return initialValue;
        }
      },
      async setItem(key, value) {
        if (!value) return;
        const data = new Uint8Array(await value.data.arrayBuffer());
        try {
          await writeFile(await getPDFPath(id), data);
        } catch (error) {
          toast.error("Failed to save PDF: " + error);
        }
      },
      async removeItem(key) {
        await remove(await getPDFPath(id));
      },
    }),
    { getOnInit: true }
  )
);

export const pdfAtomFamily = atomFamily((id: string) =>
  atomWithStorage<Pdf | null>(
    `pdf-${id}`,
    null,
    {
      async getItem(key, initialValue) {
        const db = await getDB();
        const value = await db.query.pdfsTable.findFirst({
          where: eq(pdfsTable.id, id),
        });
        return value ?? initialValue;
      },
      async setItem(key, value) {
        if (!value) return;
        const db = await getDB();
        await db.insert(pdfsTable).values(value).onConflictDoUpdate({
          target: pdfsTable.id,
          set: value,
        });
      },
      async removeItem(key) {
        const db = await getDB();
        await db.delete(pdfsTable).where(eq(pdfsTable.id, id));
      },
    },
    { getOnInit: true }
  )
);

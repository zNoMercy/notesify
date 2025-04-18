import { atomFamily } from "jotai/utils";
import { atomWithStorage } from "jotai/utils";
import { openDB } from "idb";

const dbPromise = openDB("mindmaps-db", 1, {
  upgrade(db) {
    const store = db.createObjectStore("mindmaps");
    store.createIndex("pdfId", "pdfId");
  },
});

export const mindmapAtomFamily = atomFamily((pdfId: string) =>
  atomWithStorage<string | null>(
    `mindmap-${pdfId}`,
    null,
    {
      async getItem(key, initialValue) {
        const db = await dbPromise;
        const value = await db.get("mindmaps", pdfId);
        return value ?? initialValue;
      },
      async setItem(key, value) {
        const db = await dbPromise;
        await db.put("mindmaps", value, pdfId);
      },
      async removeItem(key) {
        const db = await dbPromise;
        await db.delete("mindmaps", pdfId);
      },
    },
    {
      getOnInit: true,
    }
  )
);

import { atomFamily, loadable } from "jotai/utils";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai";
import { notesTable, Notes } from "@/db/schema";
import { getDB } from "@/db/sqlite";
import { eq } from "drizzle-orm";

export const notesAtomFamily = atomFamily((id: string) =>
  atomWithStorage<Notes | null>(
    `notes-${id}`,
    null,
    {
      async getItem(key, initialValue) {
        const db = await getDB();
        const value = await db.query.notesTable.findFirst({
          where: eq(notesTable.id, id),
        });
        return value ?? initialValue;
      },
      async setItem(key, value) {
        if (!value) return;
        const db = await getDB();
        await db.insert(notesTable).values(value).onConflictDoUpdate({
          target: notesTable.id,
          set: value,
        });
      },
      async removeItem(key) {
        const db = await getDB();
        await db.delete(notesTable).where(eq(notesTable.id, id));
      },
    },
    { getOnInit: true }
  )
);
export const notesAtomFamilyLoadable = (id: string) =>
  loadable(notesAtomFamily(id));

export const notesOpenAtom = atom<boolean>(false);

export const generatingNotesAtom = atomFamily((notesId?: string) =>
  atom<AbortController>()
);

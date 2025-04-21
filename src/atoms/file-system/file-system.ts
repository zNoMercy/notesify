import {
  atomFamily,
  atomWithDefault,
  atomWithStorage,
  loadable,
} from "jotai/utils";
import { getDB } from "@/db/sqlite";
import { FileNode, filesTable } from "@/db/schema/files/files";
import { eq, isNull } from "drizzle-orm";
import { atom } from "jotai";

export const fileSystemOpenAtom = atom<boolean>(false);
export const draggingItemIdAtom = atom<string | number>();

export const fileAtomFamily = atomFamily((id: string) =>
  atomWithStorage<FileNode | null>(
    `file-${id}`,
    null,
    {
      async getItem(key, initialValue) {
        const db = await getDB();
        const value = await db.query.filesTable.findFirst({
          where: eq(filesTable.id, id),
        });
        return value ?? initialValue;
      },
      async setItem(key, value) {
        if (!value) return;
        const db = await getDB();
        await db.insert(filesTable).values(value).onConflictDoUpdate({
          target: filesTable.id,
          set: value,
        });
      },
      async removeItem(key) {
        const db = await getDB();
        await db.delete(filesTable).where(eq(filesTable.id, id));
      },
    },
    {
      getOnInit: true,
    }
  )
);

export const rootFilesAtom = atomWithDefault(async (get) => {
  const db = await getDB();
  const result = await db.query.filesTable.findMany({
    where: isNull(filesTable.parentId),
    orderBy: (files, { desc }) => [desc(files.updatedAt)],
  });
  return result;
});

export const rootFilesAtomLoadable = loadable(rootFilesAtom);

import {
  atomFamily,
  atomWithDefault,
  atomWithStorage,
  loadable,
} from "jotai/utils";
import { getDB } from "@/db/sqlite";
import { Chat, chatsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { atom } from "jotai";

export const chatAtomFamily = atomFamily((id: string) =>
  atomWithStorage(
    `chat-${id}`,
    {
      id,
      title: "",
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Chat,
    {
      async getItem(key, initialValue) {
        console.log("Getting chat", id);
        const db = await getDB();
        const value = await db.query.chatsTable.findFirst({
          where: eq(chatsTable.id, id),
        });
        return value ?? initialValue;
      },
      async setItem(key, value) {
        if (!value) return;
        const db = await getDB();
        await db.insert(chatsTable).values(value).onConflictDoUpdate({
          target: chatsTable.id,
          set: value,
        });
      },
      async removeItem(key) {
        const db = await getDB();
        await db.delete(chatsTable).where(eq(chatsTable.id, id));
      },
    },
    {
      getOnInit: true,
    }
  )
);

export const chatAtomFamilyLoadable = (id: string) =>
  loadable(chatAtomFamily(id));

export const chatsOpenAtom = atom<boolean>(false);
export const threadFinderOpenAtom = atom<boolean>(false);
export const activeChatIdAtom = atom<string>("TMP");

export const chatsAtom = atomWithDefault(async (get) => {
  const db = await getDB();
  const allChats = await db.query.chatsTable.findMany();
  return allChats;
});

export const chatsAtomLoadable = loadable(chatsAtom);

export const withThinkingAtom = atomWithStorage<boolean>(
  "with-thinking",
  false
);

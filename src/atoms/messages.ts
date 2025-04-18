import { atomFamily, atomWithDefault, loadable } from "jotai/utils";
import { atomWithStorage } from "jotai/utils";
import { getDB } from "@/db/sqlite";
import { MessageDB, messagesTable } from "@/db/schema";
import { asc, eq } from "drizzle-orm";

export const messageAtomFamily = atomFamily((id: string) =>
  atomWithStorage<MessageDB | null>(
    `message-${id}`,
    null,
    {
      async getItem(key, initialValue) {
        const db = await getDB();
        const value = await db.query.messagesTable.findFirst({
          where: eq(messagesTable.id, id),
        });
        return value ?? initialValue;
      },
      async setItem(key, value) {
        if (!value) return;
        const db = await getDB();
        await db.insert(messagesTable).values(value).onConflictDoUpdate({
          target: messagesTable.id,
          set: value,
        });
      },
      async removeItem(key) {
        const db = await getDB();
        await db.delete(messagesTable).where(eq(messagesTable.id, id));
      },
    },
    {
      getOnInit: true,
    }
  )
);

export const messagesAtomFamily = atomFamily((chatId: string) =>
  atomWithDefault(async (get) => {
    if (!chatId) {
      return [];
    }
    const db = await getDB();
    const messages = await db.query.messagesTable.findMany({
      where: eq(messagesTable.chatId, chatId),
      orderBy: [asc(messagesTable.createdAt)],
    });
    // console.log("All Messages", messages);
    return messages;
  })
);

export const messagesAtomFamilyLoadable = (chatId: string) =>
  loadable(messagesAtomFamily(chatId));

import { messageAtomFamily } from "@/atoms/chat/messages";
import { MessageDB } from "@/db/schema";
import { atom } from "jotai";

export const saveMessageAtom = atom(null, (get, set, message: MessageDB) => {
  const messageAtom = messageAtomFamily(message.id);
  set(messageAtom, message);
});

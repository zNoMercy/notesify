import { notesAtomFamily } from "@/atoms/notes/notes";
import { Notes, notesTable } from "@/db/schema";
import { getDB } from "@/db/sqlite";
import { generateId } from "ai";
import { eq } from "drizzle-orm";
import { atom } from "jotai";
import { addFileAtom } from "@/actions/file-system/file-system";
import { ActionError } from "@/hooks/state/use-action";

export const getNotesForPdfAtom = atom(
  null,
  async (get, set, pdfId: string) => {
    const db = await getDB();
    const notes = await db.query.notesTable.findFirst({
      where: eq(notesTable.pdfId, pdfId),
    });
    return notes?.id;
  }
);

export const getOrCreateNotesAtom = atom(
  null,
  async (get, set, pdfId?: string) => {
    if (pdfId) {
      const notesId = await set(getNotesForPdfAtom, pdfId);
      if (notesId) return notesId;
    }

    const notesId = generateId();

    set(addFileAtom, {
      name: "Notes",
      parentId: null,
      notesId,
    });

    const notesAtom = notesAtomFamily(notesId);
    const newNotes = {
      id: notesId,
      pdfId,
      title: "",
      content: JSON.stringify([
        {
          children: [{ text: "" }],
          type: "h1",
        },
        {
          children: [{ text: "" }],
          type: "p",
        },
      ]),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Notes;
    console.log("Created new notes", notesId);
    set(notesAtom, newNotes);
    return notesId;
  }
);

export const updateNotesAtom = atom(
  null,
  async (get, set, { id, content }: { id: string; content: any }) => {
    const notesAtom = notesAtomFamily(id);
    const notes = await get(notesAtom);
    if (!notes) {
      throw new ActionError("Failed to save notes");
    }

    const timestamp = new Date();
    const updatedNotes = {
      ...notes,
      content,
      updatedAt: timestamp,
    };
    set(notesAtom, updatedNotes);
  }
);

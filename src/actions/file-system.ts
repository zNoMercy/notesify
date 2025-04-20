import { atom } from "jotai";
import { fileAtomFamily, rootFilesAtom } from "../atoms/file-system";
import { pdfAtomFamily, pdfDataAtomFamily } from "@/atoms/pdf";
import { RESET } from "jotai/utils";
import { generateId } from "@/lib/id";
import { FileNode } from "@/db/schema/files";
import { toast } from "sonner";
import { ActionError } from "@/hooks/state/use-action";

export const addFolderAtom = atom(
  null,
  async (
    get,
    set,
    { name, parentId }: { name: string; parentId: string | null }
  ) => {
    const timestamp = new Date();
    const newFolder: FileNode = {
      id: generateId(),
      name,
      type: "folder",
      parentId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const fileAtom = fileAtomFamily(newFolder.id);
    set(fileAtom, newFolder);
    return newFolder;
  }
);

export const addFileAtom = atom(
  null,
  async (
    get,
    set,
    {
      name,
      parentId,
      notesId,
      pdfId,
    }: {
      name: string;
      parentId: string | null;
      notesId?: string;
      pdfId?: string;
    }
  ) => {
    if (!pdfId && !notesId) {
      toast.error("No PDF or Notes provided");
      return;
    }

    if (pdfId && notesId) {
      toast.error("Cannot add both PDF and Notes");
      return;
    }

    const timestamp = new Date();
    const newFile: FileNode = {
      id: (pdfId || notesId)!,
      name,
      type: pdfId ? "pdf" : "notes",
      parentId,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    const fileAtom = fileAtomFamily(newFile.id);
    set(fileAtom, newFile);
    set(rootFilesAtom, async (currentFiles) => [
      newFile,
      ...(await currentFiles),
    ]);
    return newFile;
  }
);

export const removeNodeAtom = atom(
  null,
  async (get, set, { id, pdfId }: { id: string; pdfId?: string }) => {
    if (!pdfId) {
      throw new ActionError("Failed to remove PDF");
    }

    set(fileAtomFamily(id), RESET);
    set(pdfDataAtomFamily(pdfId), RESET);
    set(pdfAtomFamily(pdfId), RESET);
    set(rootFilesAtom, async (currentFiles) =>
      (await currentFiles).filter((file) => file.id !== id)
    );
  }
);

export const renameNodeAtom = atom(
  null,
  async (
    get,
    set,
    { nodeId, newName }: { nodeId: string; newName: string }
  ) => {
    const fileAtom = fileAtomFamily(nodeId);
    const node = await get(fileAtom);
    if (!node) {
      throw new ActionError("Failed to rename PDF");
    }

    const timestamp = new Date();
    const updatedNode = {
      ...node,
      name: newName,
      updatedAt: timestamp,
    };
    set(fileAtom, updatedNode);
    set(rootFilesAtom, async (currentFiles) =>
      (await currentFiles).map((file) =>
        file.id === nodeId ? updatedNode : file
      )
    );
    return updatedNode;
  }
);

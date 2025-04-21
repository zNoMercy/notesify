import { useAtom } from "jotai";
import { useNavigate } from "@tanstack/react-router";
import { notesOpenAtom } from "@/atoms/notes/notes";
import { getOrCreateNotesAtom } from "@/actions/notes/notes";
import { useAction } from "../state/use-action";

export const useNavigatePdf = () => {
  const navigate = useNavigate();
  const [notesOpen, setNotesOpen] = useAtom(notesOpenAtom);
  const [getOrCreateNotes] = useAction(getOrCreateNotesAtom);

  const navigatePdf = async ({
    pdfId,
    openNotes,
  }: {
    pdfId: string;
    openNotes?: boolean;
  }) => {
    const open = notesOpen || !!openNotes;
    const notesId = open ? await getOrCreateNotes(pdfId) : undefined;
    setNotesOpen(open);

    navigate({
      to: "/viewer",
      search: (prev) => ({
        ...prev,
        nid: notesId,
        sid: pdfId,
      }),
    });
  };

  return { navigatePdf };
};

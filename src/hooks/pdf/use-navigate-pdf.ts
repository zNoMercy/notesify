import { useAtom } from "jotai";
import { useNavigate } from "@tanstack/react-router";
import { notesOpenAtom } from "@/atoms/notes";
import { getOrCreateNotesAtom } from "@/actions/notes";
import { useAction } from "../use-action";

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

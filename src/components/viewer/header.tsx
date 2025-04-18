import { FileText, PanelLeft, Sparkles, SquarePen } from "lucide-react";

import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { Card } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import { useAtom, useSetAtom } from "jotai";
import { pdfViewerOpenAtom } from "@/atoms/pdf-viewer";
import { Separator } from "../ui/separator";
import { notesOpenAtom } from "@/atoms/notes";
import { chatsOpenAtom } from "@/atoms/chats";
import { useNavigatePdf } from "@/hooks/pdf/use-navigate-pdf";
import { openSettingsDialogAtom } from "@/atoms/providers";
import { fileSystemOpenAtom } from "@/atoms/file-system";

export const Header = ({ pdfId }: { pdfId: string }) => {
  const [fileSystemOpen, setFileSystemOpen] = useAtom(fileSystemOpenAtom);
  const [chatsOpen, setChatsOpen] = useAtom(chatsOpenAtom);
  const [pdfOpen, setPdfOpen] = useAtom(pdfViewerOpenAtom);
  const [notesOpen, setNotesOpen] = useAtom(notesOpenAtom);
  const setOpenSettings = useSetAtom(openSettingsDialogAtom);
  const { navigatePdf } = useNavigatePdf();

  // Toggle a panel while ensuring at least one remains open
  const togglePanel = (
    panel: "notes" | "pdf" | "chats",
    currentlyOpen: boolean
  ) => {
    if (currentlyOpen) {
      const atLeastOneOtherOpen =
        (panel !== "notes" && notesOpen) ||
        (panel !== "pdf" && pdfOpen) ||
        (panel !== "chats" && chatsOpen);

      if (!atLeastOneOtherOpen) {
        return true;
      }
    }
    return !currentlyOpen;
  };

  return (
    <Card
      className={cn(
        "sticky flex flex-row w-full px-0.5 border-2 border-transparent border-b-neutral-50 justify-between z-30 rounded-none"
      )}
    >
      <div className="flex flex-row items-center gap-0.5">
        <TooltipButton
          tooltip="Toggle Library"
          active={fileSystemOpen}
          onClick={() => {
            setFileSystemOpen((open) => !open);
          }}
        >
          <PanelLeft />
        </TooltipButton>

        <Separator orientation="vertical" className="mx-0.5 h-6" />

        <TooltipButton
          tooltip="Toggle Notes"
          active={notesOpen}
          onClick={async () => {
            const shouldOpen = togglePanel("notes", notesOpen);
            setNotesOpen(shouldOpen);
            if (shouldOpen) {
              navigatePdf({ pdfId, openNotes: true });
            }
          }}
        >
          <SquarePen />
        </TooltipButton>
        <TooltipButton
          tooltip="Toggle Sources"
          active={pdfOpen}
          onClick={() => {
            setPdfOpen((open) => togglePanel("pdf", open));
          }}
        >
          <FileText />
        </TooltipButton>
        <TooltipButton
          id="ask-ai-button"
          tooltip="Toggle AI Assistant"
          active={chatsOpen}
          onClick={() => {
            setChatsOpen((open) => togglePanel("chats", open));
          }}
        >
          <Sparkles />
        </TooltipButton>
      </div>

      <div className="flex flex-row items-center gap-0.5">
        <TooltipButton
          tooltip="Manage AI Models"
          onClick={() => setOpenSettings(true)}
        >
          <Sparkles />
          Manage AI Models
        </TooltipButton>
      </div>
    </Card>
  );
};

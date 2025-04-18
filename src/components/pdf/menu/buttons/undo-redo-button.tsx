import { redoAtom, undoAtom } from "@/actions/history";
import { canRedoAtom, canUndoAtom } from "@/atoms/history";
import { TooltipButton } from "@/components/tooltip/tooltip-button";
import { useAtomValue, useSetAtom } from "jotai";
import { Redo2, Undo2 } from "lucide-react";

export const UndoRedoButton = ({ pdfId }: { pdfId: string }) => {
  const canUndo = useAtomValue(canUndoAtom(pdfId));
  const canRedo = useAtomValue(canRedoAtom(pdfId));
  const undo = useSetAtom(undoAtom);
  const redo = useSetAtom(redoAtom);

  return (
    <>
      <TooltipButton
        tooltip="Undo"
        disabled={!canUndo}
        onClick={() => {
          if (!pdfId) return;
          undo(pdfId);
        }}
      >
        <Undo2 />
      </TooltipButton>
      <TooltipButton
        tooltip="Redo"
        disabled={!canRedo}
        onClick={() => {
          if (!pdfId) return;
          redo(pdfId);
        }}
      >
        <Redo2 />
      </TooltipButton>
    </>
  );
};

import { redoAtom, undoAtom } from "@/actions/history";
import { activePdfIdAtom } from "@/atoms/pdf-viewer";
import { useAtomValue, useSetAtom } from "jotai";
import { useHotkeys } from "react-hotkeys-hook";

export const useHistoryShortcuts = () => {
  const activePdfId = useAtomValue(activePdfIdAtom);
  const undo = useSetAtom(undoAtom);
  const redo = useSetAtom(redoAtom);

  // Undo
  useHotkeys(
    "mod+z",
    () => {
      if (!activePdfId) return;
      undo(activePdfId);
    },
    { preventDefault: true },
    [activePdfId]
  );

  // Redo
  useHotkeys(
    "mod+shift+z",
    () => {
      if (!activePdfId) return;
      redo(activePdfId);
    },
    { preventDefault: true },
    [activePdfId]
  );
};

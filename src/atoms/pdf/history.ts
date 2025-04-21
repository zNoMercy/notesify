import { atomFamily } from "jotai/utils";
import { atom } from "jotai";

export interface HistoryRecord {
  action: "create" | "update" | "delete";
  type: "annotation" | "highlight";
  pdfId: string;
  data: any;
  oldData?: any;
}

export interface HistoryState {
  past: HistoryRecord[];
  future: HistoryRecord[];
}

export const historyAtomFamily = atomFamily((pdfId: string) =>
  atom<HistoryState>({
    past: [],
    future: [],
  })
);

// Derived atoms
export const canUndoAtom = atomFamily((pdfId: string) =>
  atom((get) => {
    const history = get(historyAtomFamily(pdfId));
    return history.past.length > 0;
  })
);

export const canRedoAtom = atomFamily((pdfId: string) =>
  atom((get) => {
    const history = get(historyAtomFamily(pdfId));
    return history.future.length > 0;
  })
);

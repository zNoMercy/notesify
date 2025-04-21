import {
  annotationAtomFamily,
  annotationsAtomFamily,
} from "@/atoms/pdf/annotations";
import {
  highlightAtomFamily,
  highlightsAtomFamily,
} from "@/atoms/pdf/highlights";
import { historyAtomFamily, HistoryRecord } from "@/atoms/pdf/history";
import { Annotation } from "@/db/schema";
import { atom } from "jotai";
import { RESET } from "jotai/utils";

const MAX_HISTORY_SIZE = 50; // Maximum number of actions to keep in history

export const pushActionAtom = atom(null, (get, set, record: HistoryRecord) => {
  const history = get(historyAtomFamily(record.pdfId));

  set(historyAtomFamily(record.pdfId), {
    past: [...history.past, record].slice(-MAX_HISTORY_SIZE),
    future: [], // Clear future when new action is pushed
  });
  set(handleActionAtom, record);
});

export const undoAtom = atom(null, (get, set, pdfId: string) => {
  const history = get(historyAtomFamily(pdfId));
  if (history.past.length === 0) return;

  const lastAction = history.past[history.past.length - 1];
  const newPast = history.past.slice(0, -1);

  // Create reverse action
  const reverseAction: HistoryRecord = {
    ...lastAction,
    action:
      lastAction.action === "create"
        ? "delete"
        : lastAction.action === "delete"
        ? "create"
        : "update",
    data: lastAction.action === "update" ? lastAction.oldData : lastAction.data,
    oldData: lastAction.action === "update" ? lastAction.data : undefined,
  };

  set(historyAtomFamily(pdfId), {
    past: newPast,
    future: [lastAction, ...history.future],
  });
  set(handleActionAtom, reverseAction);
});

export const redoAtom = atom(null, (get, set, pdfId: string) => {
  const history = get(historyAtomFamily(pdfId));
  if (history.future.length === 0) return;

  const nextAction = history.future[0];
  const newFuture = history.future.slice(1);

  set(historyAtomFamily(pdfId), {
    past: [...history.past, nextAction],
    future: newFuture,
  });
  set(handleActionAtom, nextAction);
});

const handleActionAtom = atom(null, async (get, set, record: HistoryRecord) => {
  const { action, type, data, pdfId } = record;
  if (type === "annotation") {
    if (action === "create") {
      for (const annotation of data as Annotation[]) {
        console.log("Creating annotation", annotation);
        set(annotationAtomFamily(annotation.id), annotation);
      }
      set(annotationsAtomFamily(pdfId), async (annotations) => [
        ...(await annotations),
        ...data,
      ]);
    } else if (action === "delete") {
      const ids = data.map((a: Annotation) => a.id);
      for (const id of ids) {
        set(annotationAtomFamily(id), RESET);
      }
      set(annotationsAtomFamily(pdfId), async (annotations) =>
        (await annotations).filter((a) => !ids.includes(a.id))
      );
    }
  } else if (type === "highlight") {
    if (action === "create") {
      set(highlightAtomFamily(data.id), data);
      set(highlightsAtomFamily(pdfId), async (highlights) => [
        ...(await highlights),
        data,
      ]);
    } else if (action === "delete") {
      set(highlightAtomFamily(data.id), RESET);
      set(highlightsAtomFamily(pdfId), async (highlights) =>
        (await highlights).filter((h) => h.id !== data.id)
      );
    } else if (action === "update") {
      const oldAtom = highlightAtomFamily(data.id);
      const oldData = await get(oldAtom);
      set(oldAtom, { ...oldData, ...data });
      set(highlightsAtomFamily(pdfId), async (highlights) =>
        (await highlights).map((h) =>
          h.id === data.id ? { ...h, ...data } : h
        )
      );
    }
  }
});

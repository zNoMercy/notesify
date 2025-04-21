import { useAtomValue } from "jotai";

import { highlightsByPageAtomFamilyLoadable } from "@/atoms/pdf/highlights";

import { Highlight } from "./components/highlight";

export const HighlightLayer = ({
  pdfId,
  pageNumber,
  disabled,
}: {
  pdfId: string;
  pageNumber: number;
  disabled?: boolean;
}) => {
  const highlightsByPageLoadable = useAtomValue(
    highlightsByPageAtomFamilyLoadable(pdfId)
  );
  if (highlightsByPageLoadable.state !== "hasData") return null;

  const highlightsByPage = highlightsByPageLoadable.data;
  const highlights = highlightsByPage?.[pageNumber] || [];
  return highlights.map((highlight: any) => (
    <Highlight key={highlight.id} highlight={highlight} disabled={disabled} />
  ));
};

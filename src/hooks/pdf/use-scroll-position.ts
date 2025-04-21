import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { updatePdfAtom } from "@/actions/pdf/pdf-viewer";

export const useScrollPosition = (
  pdfId: string,
  containerRef: React.RefObject<HTMLDivElement | null>
) => {
  const setScrollPositions = useSetAtom(updatePdfAtom);

  // Save scroll position when scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      setScrollPositions({
        pdfId,
        scroll: {
          x: containerRef.current.scrollLeft,
          y: containerRef.current.scrollTop,
        },
      });
    };

    containerRef.current?.addEventListener("scroll", handleScroll);
    return () =>
      containerRef.current?.removeEventListener("scroll", handleScroll);
  }, [pdfId, containerRef, setScrollPositions]);
};

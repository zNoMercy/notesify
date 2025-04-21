import { atom } from "jotai";
import { AnnotationMode, getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import {
  createOrGetPDFDir,
  PDF,
  pdfAtomFamily,
  pdfDataAtomFamily,
} from "../../atoms/pdf/pdf";
import {
  EventBus,
  PDFLinkService,
  PDFViewer,
} from "pdfjs-dist/web/pdf_viewer.mjs";
import { addFileAtom } from "@/actions/file-system/file-system";
import {
  activePdfIdAtom,
  currentPageAtomFamily,
  documentAtomFamily,
  viewerAtomFamily,
  renderedPagesAtomFamily,
  openedPdfIdsAtom,
} from "@/atoms/pdf/pdf-viewer";
import { save } from "@tauri-apps/plugin-dialog";
import { isTauri } from "@/lib/tauri";
import { writeFile } from "@tauri-apps/plugin-fs";
import { toast } from "sonner";
import { ActionError } from "@/hooks/state/use-action";
import { updatePdfAtom } from "../pdf/pdf-viewer";

GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export const savePdfAtom = atom(
  null,
  async (get, set, name: string, pdf: PDF) => {
    if (isTauri) {
      await createOrGetPDFDir();
    }

    // Save PDF to storage
    const pdfAtom = pdfDataAtomFamily(pdf.id);
    set(pdfAtom, pdf);

    // Add file to file system
    set(addFileAtom, {
      name,
      parentId: null,
      pdfId: pdf.id,
    });

    set(pdfAtomFamily(pdf.id), {
      id: pdf.id,
      pageCount: -1,
      scroll: null,
      zoom: null,
    });
    return true;
  }
);

export const loadPdfAtom = atom(
  null,
  async (
    get,
    set,
    {
      pdfId,
      container,
    }: {
      pdfId: string;
      container: HTMLDivElement;
    }
  ) => {
    // Unload previous PDF
    // set(unloadPdfAtom);

    // Get PDF data
    console.log("Loading PDF", pdfId);
    const pdfAtom = pdfDataAtomFamily(pdfId);
    const pdf = await get(pdfAtom);
    const pdfMeta = await get(pdfAtomFamily(pdfId));
    if (!pdf) return false;

    // Load PDF document
    const pdfData = await pdf.data.arrayBuffer();
    const loadingTask = getDocument(pdfData);
    const pdfDocument = await loadingTask.promise;

    const eventBus = new EventBus();
    const linkService = new PDFLinkService({ eventBus });
    const pdfViewer = new PDFViewer({
      container,
      eventBus,
      linkService,
      annotationMode: AnnotationMode.DISABLE,
      textLayerMode: 1,
      removePageBorders: true,
    });

    linkService.setDocument(pdfDocument);
    linkService.setViewer(pdfViewer);
    pdfViewer.setDocument(pdfDocument);

    set(activePdfIdAtom, pdf.id);
    set(openedPdfIdsAtom, (currentIds) => [...currentIds, pdf.id]);
    set(updatePdfAtom, { pdfId, pageCount: pdfDocument.numPages });
    set(documentAtomFamily(pdf.id), pdfDocument);
    set(viewerAtomFamily(pdf.id), pdfViewer);

    eventBus.on("pagesloaded", () => {
      set(currentPageAtomFamily(pdf.id), 1);

      const zoomScale = pdfMeta?.zoom ?? 1;
      const scrollPositions = pdfMeta?.scroll;
      pdfViewer.currentScale = zoomScale;
      container.scrollTo(scrollPositions?.x ?? 0, scrollPositions?.y ?? 0);
    });

    eventBus.on("pagerendered", (e: any) => {
      // TODO: a better event for this?
      const renderedPages = (pdfViewer._pages
        ?.filter((p) => p.canvas)
        .map((p) => p.id) || []) as number[];
      set(renderedPagesAtomFamily(pdf.id), renderedPages);
    });

    eventBus.on("pagechanging", (evt: any) => {
      set(currentPageAtomFamily(pdf.id), evt.pageNumber);
    });
    // If PDF viewer is initialized twice, it may:
    // 1. show no pages after opening the PDF
    // 2. show error "offsetParent is not set" when zooming
    console.log("PDF viewer initialized");
    return true;
  }
);

export const unloadPdfAtom = atom(null, async (get, set, pdfId?: string) => {
  const activePdfId = pdfId; // get(activePdfIdAtom);
  if (activePdfId) {
    console.log("Unloading PDF", activePdfId);
    set(activePdfIdAtom, undefined);
    set(openedPdfIdsAtom, (currentIds) =>
      currentIds.filter((id) => id !== activePdfId)
    );
    const documentAtom = documentAtomFamily(activePdfId);
    await get(documentAtom)?.destroy();
    set(documentAtom, undefined);
    set(viewerAtomFamily(activePdfId), undefined);
    set(currentPageAtomFamily(activePdfId), undefined);
    set(renderedPagesAtomFamily(activePdfId), []);
  }
});

export const downloadPdfAtom = atom(
  null,
  async (get, set, pdfId: string, filename: string) => {
    const pdfAtom = pdfDataAtomFamily(pdfId);
    const pdf = await get(pdfAtom);
    if (!pdf) {
      throw new ActionError("Failed to download PDF");
    }

    filename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;
    if (isTauri) {
      const filePath = await save({ defaultPath: filename });
      if (!filePath) return;
      const data = new Uint8Array(await pdf.data.arrayBuffer());
      await writeFile(filePath, data);
    } else {
      const url = URL.createObjectURL(pdf.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
    toast.success("Downloaded successfully");
  }
);

export const convertToPdfAtom = atom(
  null,
  async (get, set, file: Blob, filename: string) => {
    const formData = new FormData();
    formData.append("files", file, filename);

    // Send the file to Gotenberg for conversion
    const response = await fetch(
      // TODO: use env variable / let user configure
      "http://localhost:8123/forms/libreoffice/convert",
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new ActionError("Failed to convert to PDF");
    }

    const pdfBlob = await response.blob();
    return pdfBlob;
  }
);

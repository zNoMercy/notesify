import { pdfDataAtomFamily } from "@/atoms/pdf";
import { pdfParsingAtomFamily } from "@/atoms/pdf-parsing";
import { configuredProvidersAtom } from "@/atoms/providers";
import { Mistral } from "@mistralai/mistralai";
import { atom } from "jotai";
import { toast } from "sonner";

export const parsePdfAtom = atom(null, async (get, set, pdfId: string) => {
  const parsedPdf = await get(pdfParsingAtomFamily(pdfId));
  if (parsedPdf && parsedPdf.length > 0) {
    console.log("Cached parsed PDF", parsedPdf);
    return parsedPdf;
  }

  const apiKey = get(configuredProvidersAtom).find((p) => p.type === "mistral")
    ?.settings.apiKey;
  if (!apiKey) {
    toast.error("Please configure the Mistral provider");
    return;
  }

  const client = new Mistral({ apiKey });

  const pdf = await get(pdfDataAtomFamily(pdfId));
  if (!pdf) {
    toast.error("PDF not found");
    return;
  }

  const uploadedPdf = await client.files.upload({
    file: {
      fileName: `${pdfId}.pdf`,
      content: pdf.data,
    },
    purpose: "ocr",
  });
  console.log("uploadedPdf", uploadedPdf);
  const signedUrl = await client.files.getSignedUrl({
    fileId: uploadedPdf.id,
  });
  console.log("signedUrl", signedUrl);
  const ocrResponse = await client.ocr.process({
    model: "mistral-ocr-latest",
    document: {
      type: "document_url",
      documentUrl: signedUrl.url,
    },
    includeImageBase64: true,
  });

  const result = ocrResponse.pages.map((page) => ({
    id: `${pdfId}-${page.index}`,
    pdfId,
    model: "mistral-ocr-latest",
    text: page.markdown,
    images: page.images
      .map((image) => image.imageBase64)
      .filter((image) => image !== null && image !== undefined),
    page: page.index,
  }));

  set(pdfParsingAtomFamily(pdfId), result);
  return result;
});

import { generateObject, LanguageModelV1 } from "ai";
import { ParsedPDF } from "./parsing";
import { z } from "zod";

export type IndexedPDF = {
  page: number;
  summary: string;
}[];

export const indexPages = async ({
  model,
  parsedPdf,
  pagesPerBatch = 5,
  maxConcurrentBatches = 3,
}: {
  model: LanguageModelV1;
  parsedPdf: ParsedPDF;
  pagesPerBatch?: number;
  maxConcurrentBatches?: number;
}): Promise<IndexedPDF> => {
  const pageCount = parsedPdf.length;
  const batchCount = Math.ceil(pageCount / pagesPerBatch);

  // Process batches
  const results = [];
  for (let i = 0; i < batchCount; i += maxConcurrentBatches) {
    const batchPromises = [];

    // Create batch promises for concurrent execution
    for (let j = 0; j < maxConcurrentBatches && i + j < batchCount; j++) {
      const batchIndex = i + j;
      const startPage = batchIndex * pagesPerBatch;
      const endPage = Math.min(startPage + pagesPerBatch, pageCount);
      const pages = parsedPdf.filter(
        (p) => p.page >= startPage && p.page < endPage
      );

      batchPromises.push(_indexPages(model, pages));
    }

    // Wait for this set of concurrent batches to complete
    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults.flat());
  }
  console.log("All indexed pages", results.flat());
  return results.flat();
};

const _indexPages = async (model: LanguageModelV1, pages: ParsedPDF) => {
  const prompt = `Generate a concise summary for each of the following ${
    pages.length
  } PDF pages.
Focus on key information, main topics, and important details.

${pages.map((page) => `PAGE ${page.page}:\n${page.text}\n`).join("\n\n")}`;

  // TODO: add images
  const res = await generateObject({
    model,
    output: "array",
    schema: z.array(
      z.object({
        page: z.number(),
        summary: z.string(),
      })
    ),
    prompt,
    maxTokens: 1024,
  });
  console.log("Indexed pages", res.object);
  return res.object;
};

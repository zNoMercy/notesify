import { tool } from "ai";
import { z } from "zod";

export const tools = {
  calculate: tool({
    description: "Calculate a Math expression, using evaluate by MathJS",
    parameters: z.object({
      expression: z.string().describe("The expression to calculate"),
    }),
  }),
  getPDFPageText: tool({
    description: "Get the text of PDF pages",
    parameters: z.object({
      pdfId: z.string().describe("The PDF ID"),
      startPage: z.number().describe("The start page number"),
      endPage: z.number().describe("The end page number"),
    }),
  }),
  // searchText: tool({
  //   description: "Search keywords in a PDF and return corresponding page texts",
  //   parameters: z.object({
  //     pdfId: z.string().describe("The PDF ID"),
  //     texts: z
  //       .string()
  //       .array()
  //       .describe(
  //         "A list of keywords to search. Do not use complete sentences."
  //       ),
  //   }),
  // }),
};

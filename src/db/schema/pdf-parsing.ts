import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { pdfsTable } from "./pdfs";

export const pdfParsingTable = sqliteTable("pdf_parsing", {
  id: text("id").primaryKey(),
  pdfId: text("pdf_id")
    .notNull()
    .references(() => pdfsTable.id, { onDelete: "cascade" }),
  model: text("model").notNull(),
  text: text("text").notNull(),
  images: text("images", { mode: "json" }).$type<string[]>(),
  page: integer("page").notNull(),
});

export type PDFParsing = typeof pdfParsingTable.$inferSelect;

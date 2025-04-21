import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { filesTable } from "@/db/schema/files/files";

export type ScrollPosition = {
  x: number;
  y: number;
};

export const pdfsTable = sqliteTable("pdfs", {
  id: text("id")
    .primaryKey()
    .references(() => filesTable.id, { onDelete: "cascade" }),
  pageCount: integer("page_count").notNull(),
  scroll: text("scroll", { mode: "json" }).$type<ScrollPosition>().default({
    x: 0,
    y: 0,
  }),
  zoom: integer("zoom").default(1),
});

export type Pdf = typeof pdfsTable.$inferSelect;

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema",
  dialect: "sqlite",
  dbCredentials: {
    url: ":memory:",
  },
  verbose: true,
  strict: true,
  out: "./src/db/migrations",
});

import {  defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".dev.vars" });

if (!process.env.DB_URL)
  throw new Error("DATABASE_URL not found in environment");

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DB_URL,
  },
})

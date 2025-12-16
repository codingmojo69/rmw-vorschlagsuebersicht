// prisma.config.ts
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Für Migrationen (CLI) nutzen wir die Session-Mode Connection (Port 5432)
    url: env("DIRECT_URL"),
  },
});
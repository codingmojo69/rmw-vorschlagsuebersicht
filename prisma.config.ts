// prisma.config.ts
import { defineConfig } from '@prisma/config';

export default defineConfig({
  // Wir verbinden uns explizit mit der Datasource "db", die wir im Schema definiert haben
  datasources: {
    db: {
      // Nutze DIRECT_URL für Migrationen, Fallback auf DATABASE_URL
      url: process.env.DIRECT_URL || process.env.DATABASE_URL,
    },
  },
});
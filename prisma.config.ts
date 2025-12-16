import { defineConfig } from '@prisma/config';

export default defineConfig({
  // Der Compiler verlangt hier "datasource" (Einzahl)
  datasource: {
    // Hier übergeben wir die URL für die Datenbank-Verbindung
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
});
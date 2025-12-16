import { defineConfig } from '@prisma/config';

export default defineConfig({
  // In Prisma 7 heißt das Feld 'datasource' (Einzahl) und ersetzt die URL im Schema
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // In Prisma 7 wird die URL hier definiert
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
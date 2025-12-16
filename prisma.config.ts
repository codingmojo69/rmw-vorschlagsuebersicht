import { defineConfig } from '@prisma/config';

export default defineConfig({
  datasource: {
    // Das '|| ""' am Ende garantiert TypeScript, dass es immer ein String ist.
    url: process.env.DIRECT_URL || process.env.DATABASE_URL || "",
  },
});
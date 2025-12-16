import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Funktion, um den Client zu erstellen (mit Adapter!)
const prismaClientSingleton = () => {
  // 1. Verbindungspool erstellen
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  
  // 2. Adapter erstellen
  const adapter = new PrismaPg(pool);
  
  // 3. Prisma mit dem Adapter initialisieren
  return new PrismaClient({
    adapter,
    // Optional: Logging im Dev-Modus
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
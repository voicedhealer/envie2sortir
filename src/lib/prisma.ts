import { PrismaClient } from "@prisma/client";
import { join } from "path";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Utiliser DATABASE_URL depuis l'environnement, avec fallback pour le développement local
const databaseUrl = process.env.DATABASE_URL || 'file:./prisma/dev.db';

export const prisma: PrismaClient = global.prismaGlobal ?? new PrismaClient({
  datasources: {
    db: {
      url: databaseUrl
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}



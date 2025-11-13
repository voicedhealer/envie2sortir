import { PrismaClient } from "@prisma/client";
import { join } from "path";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

// Configuration pour la branche demo : utilise la base de données locale SQLite
// Le chemin est relatif au fichier schema.prisma (prisma/dev.db)
const databaseUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";

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



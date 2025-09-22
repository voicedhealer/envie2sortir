import { PrismaClient } from "@prisma/client";
import { join } from "path";

declare global {
  var prismaGlobal: PrismaClient | undefined;
}

export const prisma: PrismaClient = global.prismaGlobal ?? new PrismaClient({
  datasources: {
    db: {
      url: 'file:/Users/vivien/envie2sortir/prisma/dev.db'
    }
  }
});

if (process.env.NODE_ENV !== "production") {
  global.prismaGlobal = prisma;
}



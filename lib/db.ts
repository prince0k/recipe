import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

globalForPrisma.prisma = prisma;

export const getInsensitiveMode = (): any => {
  const isPostgres = process.env.DATABASE_URL?.startsWith("postgresql") || process.env.DATABASE_URL?.startsWith("postgres");
  return isPostgres ? { mode: "insensitive" } : {};
};


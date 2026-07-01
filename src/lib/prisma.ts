import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL;
  if (!url) return undefined;
  const params = new URLSearchParams(url.includes("?") ? url.split("?")[1] : "");
  const base = url.split("?")[0];
  if (!params.has("sslmode")) params.set("sslmode", "require");
  if (!params.has("connection_limit")) params.set("connection_limit", "1");
  if (!params.has("pool_timeout")) params.set("pool_timeout", "20");
  return `${base}?${params.toString()}`;
}

const databaseUrl = resolveDatabaseUrl();

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    ...(databaseUrl
      ? { datasources: { db: { url: databaseUrl } } }
      : {}),
  });

globalForPrisma.prisma = prisma;

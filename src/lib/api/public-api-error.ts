/** Strip internal Prisma / stack details from API responses. */
export function publicApiError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;
  const message = error.message.trim();
  if (!message) return fallback;
  if (message.includes("Invalid `prisma") || message.includes("PrismaClient")) return fallback;
  if (message.includes("does not exist in the current database")) return fallback;
  if (message.includes("Can't reach database server")) return fallback;
  if (message.startsWith("Product not found")) return message;
  if (message.startsWith("No products detected")) return message;
  if (message.length > 200) return fallback;
  return message;
}

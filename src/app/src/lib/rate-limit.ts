import { prisma } from "@/lib/prisma";

function isMissingRateLimitTable(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const code = (error as { code?: string }).code;
  return code === "P2021" || code === "P2022";
}

export async function enforceRateLimit(key: string, limit: number, windowSeconds: number) {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

  try {
    const record = await prisma.rateLimitWindow.findUnique({ where: { key } });

    if (!record || record.expiresAt < now) {
      await prisma.rateLimitWindow.upsert({
        where: { key },
        update: {
          count: 1,
          expiresAt
        },
        create: {
          key,
          count: 1,
          expiresAt
        }
      });
      return;
    }

    if (record.count >= limit) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }

    await prisma.rateLimitWindow.update({
      where: { key },
      data: { count: { increment: 1 } }
    });
  } catch (error) {
    if (isMissingRateLimitTable(error)) {
      return;
    }
    throw error;
  }
}

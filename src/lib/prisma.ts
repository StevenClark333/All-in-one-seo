import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClientWithQueryEvents;
};

export function getPrisma() {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }

  return globalForPrisma.prisma;
}

export function hasDatabaseUrl() {
  return Boolean(process.env.DATABASE_URL);
}

export function shouldLogSlowQuery(durationMs: number, thresholdMs: number) {
  return durationMs >= thresholdMs;
}

function createPrismaClient() {
  const prisma = new PrismaClient({
    log: [{ emit: "event", level: "query" }],
  });
  const thresholdMs = Number(process.env.SLOW_QUERY_THRESHOLD_MS ?? 500);

  prisma.$on("query", (event) => {
    if (!shouldLogSlowQuery(event.duration, thresholdMs)) {
      return;
    }

    logger.warn("Slow database query detected.", {
      durationMs: event.duration,
      query: event.query,
      target: event.target,
    });
  });

  return prisma;
}

type PrismaClientWithQueryEvents = ReturnType<typeof createPrismaClient>;

import { CrawlFrequency } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

export const crawlRateLimitMinutes = 15;
export const crawlDepthLimit = 1;

export function isDomainCrawlRateLimited({
  lastCrawledAt,
  now = new Date(),
}: {
  lastCrawledAt: Date | null;
  now?: Date;
}) {
  if (!lastCrawledAt) {
    return false;
  }

  return (
    now.getTime() - lastCrawledAt.getTime() < crawlRateLimitMinutes * 60_000
  );
}

export function isCrawlDue({
  crawlFrequency,
  lastCrawledAt,
  now = new Date(),
}: {
  crawlFrequency: CrawlFrequency;
  lastCrawledAt: Date | null;
  now?: Date;
}) {
  if (crawlFrequency === "MANUAL" || crawlFrequency === "CUSTOM") {
    return false;
  }

  if (!lastCrawledAt) {
    return true;
  }

  const elapsedMs = now.getTime() - lastCrawledAt.getTime();
  const dueMs =
    crawlFrequency === "DAILY" ? 24 * 60 * 60_000 : 7 * 24 * 60 * 60_000;

  return elapsedMs >= dueMs;
}

export function shouldPersistDiscoveredLinkDepth(depth: number) {
  return depth <= crawlDepthLimit;
}

export async function assertDomainCrawlRateLimit(domainId: string) {
  const domain = await getPrisma().domain.findUnique({
    where: { id: domainId },
    select: { lastCrawledAt: true },
  });

  if (
    domain &&
    isDomainCrawlRateLimited({ lastCrawledAt: domain.lastCrawledAt })
  ) {
    throw new Error("This domain was crawled recently. Try again later.");
  }
}

import { runHomepageCrawl } from "@/lib/crawler";
import { isCrawlDue, isDomainCrawlRateLimited } from "@/lib/crawler-policy";
import { getPrisma } from "@/lib/prisma";
import {
  claimNextWorkerJob,
  completeWorkerJob,
  enqueueWorkerJob,
  failWorkerJob,
} from "@/lib/worker-queue";

export async function enqueueCrawlRunJob({
  crawlRunId,
  workspaceId,
}: {
  crawlRunId: string;
  workspaceId: string;
}) {
  return enqueueWorkerJob({
    payloadJson: { crawlRunId },
    resourceId: crawlRunId,
    type: "CRAWL_RUN",
    workspaceId,
  });
}

export async function enqueueDueScheduledCrawls(now = new Date()) {
  const domains = await getPrisma().domain.findMany({
    where: {
      archivedAt: null,
      verificationStatus: "VERIFIED",
      crawlFrequency: { in: ["DAILY", "WEEKLY"] },
    },
    select: {
      crawlFrequency: true,
      id: true,
      lastCrawledAt: true,
      workspaceId: true,
    },
  });
  let enqueued = 0;

  for (const domain of domains) {
    if (
      !isCrawlDue({
        crawlFrequency: domain.crawlFrequency,
        lastCrawledAt: domain.lastCrawledAt,
        now,
      }) ||
      isDomainCrawlRateLimited({ lastCrawledAt: domain.lastCrawledAt, now })
    ) {
      continue;
    }

    const hasPendingRun = await getPrisma().crawlRun.findFirst({
      where: {
        domainId: domain.id,
        status: { in: ["QUEUED", "RUNNING"] },
      },
      select: { id: true },
    });

    if (hasPendingRun) {
      continue;
    }

    const crawlRun = await getPrisma().crawlRun.create({
      data: {
        domainId: domain.id,
        status: "QUEUED",
        trigger: "SCHEDULED",
      },
      select: { id: true },
    });

    await enqueueCrawlRunJob({
      crawlRunId: crawlRun.id,
      workspaceId: domain.workspaceId,
    });
    enqueued += 1;
  }

  return { enqueued };
}

export async function processNextCrawlRunJob(workerId: string) {
  const job = await claimNextWorkerJob({
    type: "CRAWL_RUN",
    workerId,
  });

  if (!job) {
    return { processed: false };
  }

  try {
    const crawlRunId = readCrawlRunId(job.payloadJson);
    await runHomepageCrawl(crawlRunId);
    await completeWorkerJob(job.id);
    return { jobId: job.id, processed: true };
  } catch (error) {
    await failWorkerJob({
      error: error instanceof Error ? error : "Unknown crawl worker error.",
      jobId: job.id,
    });
    throw error;
  }
}

function readCrawlRunId(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "crawlRunId" in value &&
    typeof value.crawlRunId === "string"
  ) {
    return value.crawlRunId;
  }

  throw new Error("Crawl run worker job payload is invalid.");
}

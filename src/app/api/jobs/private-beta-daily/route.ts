import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ApiProtectionError,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import { evaluateAlertRules } from "@/lib/alerts";
import {
  enqueueDueScheduledCrawls,
  processNextCrawlRunJob,
} from "@/lib/crawler-scheduling";
import { reportError } from "@/lib/error-reporting";
import { logger } from "@/lib/logger";
import { evaluateReportSchedules } from "@/lib/reporting";
import { cleanupExpiredHtmlSnapshots } from "@/lib/snapshot-storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireRequestRateLimit({
      limit: 10,
      prefix: "job-private-beta-daily",
      request,
    });
  } catch (error) {
    if (error instanceof ApiProtectionError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status },
      );
    }

    throw error;
  }

  const secret = process.env.CRON_SECRET;
  const providedSecret = request.headers
    .get("authorization")
    ?.replace("Bearer ", "");

  if (secret && providedSecret !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const [alerts, scheduledCrawls, scheduledReports, snapshotCleanup] =
      await Promise.all([
        evaluateAlertRules(),
        enqueueDueScheduledCrawls(),
        evaluateReportSchedules(),
        cleanupExpiredHtmlSnapshots(),
      ]);
    const crawlWorker = await processNextCrawlRunJob(
      `private-beta-${randomUUID()}`,
    );

    return NextResponse.json({
      alerts,
      crawlWorker,
      scheduledCrawls,
      scheduledReports,
      snapshotCleanup: {
        cutoff: snapshotCleanup.cutoff.toISOString(),
        deleted: snapshotCleanup.deleted,
      },
    });
  } catch (error) {
    logger.error("Private beta daily job failed.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    await reportError({
      context: { route: "/api/jobs/private-beta-daily" },
      error,
      source: "scheduled-job",
    });

    return NextResponse.json(
      { error: "Private beta daily job failed." },
      { status: 500 },
    );
  }
}

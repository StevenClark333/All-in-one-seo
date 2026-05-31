import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ApiProtectionError,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import { processNextCrawlRunJob } from "@/lib/crawler-scheduling";
import { reportError } from "@/lib/error-reporting";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireRequestRateLimit({
      limit: 60,
      prefix: "job-process-crawl-queue",
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
    const result = await processNextCrawlRunJob(`crawl-worker-${randomUUID()}`);
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Crawl queue worker failed.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    await reportError({
      context: { route: "/api/jobs/process-crawl-queue" },
      error,
      source: "scheduled-job",
    });

    return NextResponse.json(
      { error: "Crawl queue processing failed." },
      { status: 500 },
    );
  }
}

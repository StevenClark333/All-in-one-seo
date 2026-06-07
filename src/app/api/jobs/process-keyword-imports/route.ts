import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import {
  ApiProtectionError,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import { reportError } from "@/lib/error-reporting";
import { processNextKeywordImportJob } from "@/lib/keyword-provider-jobs";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireRequestRateLimit({
      limit: 60,
      prefix: "job-process-keyword-imports",
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
    const result = await processNextKeywordImportJob(
      `keyword-worker-${randomUUID()}`,
    );
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Keyword import worker failed.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    await reportError({
      context: { route: "/api/jobs/process-keyword-imports" },
      error,
      source: "scheduled-job",
    });

    return NextResponse.json(
      { error: "Keyword import processing failed." },
      { status: 500 },
    );
  }
}

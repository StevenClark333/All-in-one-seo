import { NextResponse } from "next/server";
import {
  ApiProtectionError,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import { reportError } from "@/lib/error-reporting";
import { logger } from "@/lib/logger";
import { cleanupExpiredHtmlSnapshots } from "@/lib/snapshot-storage";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireRequestRateLimit({
      limit: 30,
      prefix: "job-cleanup-snapshots",
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
    const result = await cleanupExpiredHtmlSnapshots();
    return NextResponse.json({
      cutoff: result.cutoff.toISOString(),
      deleted: result.deleted,
    });
  } catch (error) {
    logger.error("Snapshot cleanup job failed.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    await reportError({
      context: { route: "/api/jobs/cleanup-snapshots" },
      error,
      source: "scheduled-job",
    });

    return NextResponse.json(
      { error: "Snapshot cleanup failed." },
      { status: 500 },
    );
  }
}

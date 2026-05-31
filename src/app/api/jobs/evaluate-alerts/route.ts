import { NextResponse } from "next/server";
import {
  ApiProtectionError,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import { evaluateAlertRules } from "@/lib/alerts";
import { reportError } from "@/lib/error-reporting";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    requireRequestRateLimit({
      limit: 30,
      prefix: "job-evaluate-alerts",
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
    const result = await evaluateAlertRules();
    return NextResponse.json(result);
  } catch (error) {
    logger.error("Alert evaluation job failed.", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    await reportError({
      context: { route: "/api/jobs/evaluate-alerts" },
      error,
      source: "scheduled-job",
    });

    return NextResponse.json(
      { error: "Alert evaluation failed." },
      { status: 500 },
    );
  }
}

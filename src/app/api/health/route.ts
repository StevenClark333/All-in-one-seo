import { NextResponse } from "next/server";
import { getCachePolicy } from "@/lib/cache-policy";
import { reportError } from "@/lib/error-reporting";
import { getPrisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();

  try {
    await getPrisma().$queryRaw`SELECT 1`;

    return NextResponse.json(
      {
        database: "ok",
        latencyMs: Date.now() - startedAt,
        ok: true,
        timestamp: new Date().toISOString(),
      },
      {
        headers: { "Cache-Control": getCachePolicy("noStore") },
      },
    );
  } catch (error) {
    await reportError({
      context: { route: "/api/health" },
      error,
      source: "healthcheck",
    });

    return NextResponse.json(
      {
        database: "error",
        ok: false,
        timestamp: new Date().toISOString(),
      },
      {
        headers: { "Cache-Control": getCachePolicy("noStore") },
        status: 503,
      },
    );
  }
}

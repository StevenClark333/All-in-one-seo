import {
  ApiProtectionError,
  readLimitedText,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import { getCachePolicy } from "@/lib/cache-policy";
import {
  ingestScriptEvent,
  ScriptIngestionError,
} from "@/lib/script-ingestion";

export const dynamic = "force-dynamic";

const maxPayloadBytes = 16_384;

export async function OPTIONS(request: Request) {
  return new Response(null, {
    status: 204,
    headers: buildCorsHeaders(request),
  });
}

export async function POST(request: Request) {
  const headers = buildCorsHeaders(request);
  let text: string;

  try {
    requireRequestRateLimit({
      limit: 300,
      prefix: "script-ingest",
      request,
    });
    text = await readLimitedText(
      request,
      maxPayloadBytes,
      "Script event payload is too large.",
    );
  } catch (error) {
    if (error instanceof ApiProtectionError) {
      return Response.json(
        { error: error.message },
        { status: error.status, headers },
      );
    }

    throw error;
  }

  let body: unknown;

  try {
    body = JSON.parse(text);
  } catch {
    return Response.json(
      { error: "Script event payload must be JSON." },
      { status: 400, headers },
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return Response.json(
      { error: "Script event payload must be an object." },
      { status: 400, headers },
    );
  }

  const payload = body as Record<string, unknown>;

  try {
    await ingestScriptEvent({
      eventType: typeof payload.eventType === "string" ? payload.eventType : "",
      origin: request.headers.get("origin"),
      pageUrl: typeof payload.pageUrl === "string" ? payload.pageUrl : null,
      payload:
        payload.payload &&
        typeof payload.payload === "object" &&
        !Array.isArray(payload.payload)
          ? (payload.payload as Record<string, unknown>)
          : {},
      referer: request.headers.get("referer"),
      siteId: typeof payload.siteId === "string" ? payload.siteId : "",
    });

    return Response.json({ ok: true }, { headers });
  } catch (error) {
    if (error instanceof ScriptIngestionError) {
      return Response.json(
        { error: error.message },
        { status: error.status, headers },
      );
    }

    throw error;
  }
}

function buildCorsHeaders(request: Request) {
  const origin = request.headers.get("origin") ?? "*";

  return {
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Origin": origin,
    "Cache-Control": getCachePolicy("noStore"),
    Vary: "Origin",
  };
}

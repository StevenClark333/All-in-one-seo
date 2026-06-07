import { NextResponse } from "next/server";
import {
  ApiProtectionError,
  apiProtectionResponse,
  readLimitedText,
  requireRequestRateLimit,
} from "@/lib/api-protection";
import {
  ingestKeywordProviderImport,
  type KeywordProviderImportPayload,
} from "@/lib/keyword-provider-jobs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    requireRequestRateLimit({
      limit: 120,
      prefix: "keyword-provider-import",
      request,
    });
    requireProviderSecret(request);

    const body = await readLimitedText(request, 256_000);
    const payload = parseProviderPayload(body);
    const result = await ingestKeywordProviderImport(payload);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiProtectionError) {
      return apiProtectionResponse(error);
    }

    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Keyword provider import failed.",
      },
      { status: 400 },
    );
  }
}

function requireProviderSecret(request: Request) {
  const secret =
    process.env.KEYWORD_PROVIDER_WEBHOOK_SECRET ?? process.env.CRON_SECRET;

  if (!secret) {
    throw new ApiProtectionError(
      "KEYWORD_PROVIDER_WEBHOOK_SECRET or CRON_SECRET is required.",
      500,
    );
  }

  const provided =
    request.headers.get("x-keyword-provider-secret") ??
    request.headers.get("authorization")?.replace("Bearer ", "");

  if (provided !== secret) {
    throw new ApiProtectionError("Unauthorized.", 401);
  }
}

function parseProviderPayload(body: string): KeywordProviderImportPayload {
  const parsed: unknown = JSON.parse(body);

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Keyword provider payload must be a JSON object.");
  }

  const payload = parsed as KeywordProviderImportPayload;

  if (!payload.keyword || typeof payload.keyword !== "string") {
    throw new Error("Keyword provider payload must include keyword.");
  }

  return {
    ...payload,
    keyword: payload.keyword.toLowerCase().trim(),
  };
}

import { Prisma } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";

const allowedEventTypes = new Set(["page_view", "route_change", "web_vital"]);
const rateLimitWindowMs = 60_000;
const rateLimitMaxEvents = 60;
const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

type ScriptPayload = Record<string, unknown>;

export type ScriptIngestionInput = {
  eventType: string;
  origin?: string | null;
  pageUrl?: string | null;
  payload: ScriptPayload;
  referer?: string | null;
  siteId: string;
};

export async function ingestScriptEvent(input: ScriptIngestionInput) {
  if (!allowedEventTypes.has(input.eventType)) {
    throw new ScriptIngestionError("Unsupported script event type.", 400);
  }

  const domain = await getPrisma().domain.findUnique({
    where: { id: input.siteId },
  });

  if (!domain) {
    throw new ScriptIngestionError("Invalid site ID.", 404);
  }

  const pageUrl = normalizeObservedPageUrl(input.pageUrl);
  const sourceUrl = input.origin ?? input.referer ?? pageUrl;

  if (!sourceUrl || !isAllowedScriptOrigin(sourceUrl, domain.domain)) {
    throw new ScriptIngestionError("Script origin is not allowed.", 403);
  }

  if (!consumeScriptIngestionRateLimit(input.siteId)) {
    throw new ScriptIngestionError(
      "Script ingestion rate limit exceeded.",
      429,
    );
  }

  const payload = sanitizeScriptPayload(input.payload);

  const event = await getPrisma().scriptEvent.create({
    data: {
      domainId: domain.id,
      pageUrl,
      eventType: input.eventType,
      payloadJson: payload as Prisma.InputJsonObject,
    },
  });

  if (domain.scriptStatus !== "DETECTED") {
    await getPrisma().domain.update({
      where: { id: domain.id },
      data: { scriptStatus: "DETECTED" },
    });
  }

  return event;
}

export function sanitizeScriptPayload(payload: ScriptPayload) {
  const headings = payload.headings;
  const webVitals = payload.webVitals;

  return {
    url: normalizeObservedPageUrl(readString(payload.url)),
    title: truncate(readString(payload.title), 160),
    metaDescription: truncate(readString(payload.metaDescription), 320),
    canonical: normalizeObservedPageUrl(readString(payload.canonical)),
    robots: truncate(readString(payload.robots), 120),
    headings:
      headings && typeof headings === "object" && !Array.isArray(headings)
        ? {
            h1: readStringArray((headings as ScriptPayload).h1, 10, 160),
            h2: readStringArray((headings as ScriptPayload).h2, 20, 160),
          }
        : { h1: [], h2: [] },
    schemaCount: readNonNegativeInteger(payload.schemaCount, 0, 250),
    linkCount: readNonNegativeInteger(payload.linkCount, 0, 20_000),
    webVitals:
      webVitals && typeof webVitals === "object" && !Array.isArray(webVitals)
        ? {
            cls: readOptionalNumber((webVitals as ScriptPayload).cls),
            fid: readOptionalNumber((webVitals as ScriptPayload).fid),
            inp: readOptionalNumber((webVitals as ScriptPayload).inp),
            lcp: readOptionalNumber((webVitals as ScriptPayload).lcp),
          }
        : {},
    observedAt: truncate(readString(payload.observedAt), 40),
  };
}

export function isAllowedScriptOrigin(value: string, domain: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  const normalizedDomain = domain.toLowerCase();

  return (
    hostname === normalizedDomain || hostname.endsWith(`.${normalizedDomain}`)
  );
}

export function normalizeObservedPageUrl(value: string | null | undefined) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    return `${url.origin}${url.pathname}`;
  } catch {
    return truncate(value.split("?")[0].split("#")[0], 2048);
  }
}

export function consumeScriptIngestionRateLimit(key: string, now = Date.now()) {
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    rateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + rateLimitWindowMs,
    });
    return true;
  }

  if (bucket.count >= rateLimitMaxEvents) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export class ScriptIngestionError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readStringArray(value: unknown, limit: number, maxLength: number) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .slice(0, limit)
    .map((item) => truncate(item.trim(), maxLength))
    .filter(Boolean);
}

function readNonNegativeInteger(value: unknown, fallback: number, max: number) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return fallback;
  }

  return Math.min(Math.floor(value), max);
}

function readOptionalNumber(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return undefined;
  }

  return Math.round(value * 1000) / 1000;
}

function truncate(value: string, maxLength: number) {
  return value.slice(0, maxLength);
}

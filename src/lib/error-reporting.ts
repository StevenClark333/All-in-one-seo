import { logger } from "@/lib/logger";

export type ErrorReportInput = {
  context?: Record<string, unknown>;
  error: Error | unknown;
  source: string;
};

export async function reportError({
  context,
  error,
  source,
}: ErrorReportInput) {
  const payload = buildErrorReportPayload({ context, error, source });

  logger.error("Application error reported.", payload);

  const endpoint = process.env.ERROR_REPORTING_WEBHOOK_URL;

  if (!endpoint) {
    return { delivered: false, payload };
  }

  try {
    const response = await fetch(endpoint, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    });

    return { delivered: response.ok, payload };
  } catch {
    return { delivered: false, payload };
  }
}

export function buildErrorReportPayload({
  context,
  error,
  source,
}: ErrorReportInput) {
  const normalized = normalizeError(error);

  return {
    context,
    error: normalized,
    source,
    timestamp: new Date().toISOString(),
  };
}

function normalizeError(error: Error | unknown) {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack?.slice(0, 4000),
    };
  }

  return {
    message: String(error),
    name: "UnknownError",
  };
}

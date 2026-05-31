const defaultWindowMs = 60_000;
const requestBuckets = new Map<string, { count: number; resetAt: number }>();

export class ApiProtectionError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function readLimitedText(
  request: Request,
  maxBytes: number,
  message = "Request payload is too large.",
) {
  const text = await request.text();

  if (byteLength(text) > maxBytes) {
    throw new ApiProtectionError(message, 413);
  }

  return text;
}

export function enforceRequestRateLimit({
  key,
  limit,
  now = Date.now(),
  windowMs = defaultWindowMs,
}: {
  key: string;
  limit: number;
  now?: number;
  windowMs?: number;
}) {
  const bucket = requestBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    requestBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export function requireRequestRateLimit({
  limit,
  prefix,
  request,
}: {
  limit: number;
  prefix: string;
  request: Request;
}) {
  const key = `${prefix}:${getRequestClientKey(request)}`;

  if (!enforceRequestRateLimit({ key, limit })) {
    throw new ApiProtectionError("Request rate limit exceeded.", 429);
  }
}

export function getRequestClientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();

  return (
    ip ||
    request.headers.get("x-real-ip") ||
    request.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function apiProtectionResponse(error: ApiProtectionError) {
  return Response.json({ error: error.message }, { status: error.status });
}

function byteLength(value: string) {
  return new TextEncoder().encode(value).length;
}

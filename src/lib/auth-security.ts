import { createHash, randomBytes } from "crypto";
import { AuthTokenPurpose } from "@prisma/client";
import { addDays } from "@/lib/date-utils";
import { getPrisma } from "@/lib/prisma";

const authRateLimitWindowMs = 60_000;
const authRateLimitMax = 10;
const authRateLimitBuckets = new Map<
  string,
  { count: number; resetAt: number }
>();
const maxFailedLogins = 5;
const lockoutMinutes = 15;

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase();
}

export function consumeAuthRateLimit(key: string, now = Date.now()) {
  const bucket = authRateLimitBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    authRateLimitBuckets.set(key, {
      count: 1,
      resetAt: now + authRateLimitWindowMs,
    });
    return true;
  }

  if (bucket.count >= authRateLimitMax) {
    return false;
  }

  bucket.count += 1;
  return true;
}

export function isAccountLocked(
  lockedUntil: Date | null | undefined,
  now = new Date(),
) {
  return Boolean(lockedUntil && lockedUntil > now);
}

export function getNextFailedLoginState(
  failedLoginCount: number,
  now = new Date(),
) {
  const nextCount = failedLoginCount + 1;

  return {
    failedLoginCount: nextCount,
    lockedUntil:
      nextCount >= maxFailedLogins
        ? new Date(now.getTime() + lockoutMinutes * 60 * 1000)
        : null,
  };
}

export async function createAuthToken({
  days = 1,
  purpose,
  userId,
}: {
  days?: number;
  purpose: AuthTokenPurpose;
  userId: string;
}) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = addDays(new Date(), days);

  await getPrisma().authToken.create({
    data: {
      expiresAt,
      purpose,
      tokenHash: hashAuthToken(token),
      userId,
    },
  });

  return { expiresAt, token };
}

export async function consumeAuthToken({
  purpose,
  token,
}: {
  purpose: AuthTokenPurpose;
  token: string;
}) {
  const record = await getPrisma().authToken.findUnique({
    where: { tokenHash: hashAuthToken(token) },
  });

  if (
    !record ||
    record.purpose !== purpose ||
    record.usedAt ||
    record.expiresAt < new Date()
  ) {
    throw new Error("This authentication link is invalid or expired.");
  }

  return getPrisma().authToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });
}

function hashAuthToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

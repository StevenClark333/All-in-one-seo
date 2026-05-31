import assert from "node:assert/strict";
import test from "node:test";
import {
  ApiProtectionError,
  enforceRequestRateLimit,
  getRequestClientKey,
  readLimitedText,
} from "@/lib/api-protection";

test("reads client identity from forwarded headers", () => {
  const request = new Request("https://app.test/api", {
    headers: { "x-forwarded-for": "203.0.113.10, 10.0.0.1" },
  });

  assert.equal(getRequestClientKey(request), "203.0.113.10");
});

test("enforces request rate limits by key and window", () => {
  const key = `api_${Date.now()}`;

  assert.equal(
    enforceRequestRateLimit({ key, limit: 2, now: 1, windowMs: 1000 }),
    true,
  );
  assert.equal(
    enforceRequestRateLimit({ key, limit: 2, now: 2, windowMs: 1000 }),
    true,
  );
  assert.equal(
    enforceRequestRateLimit({ key, limit: 2, now: 3, windowMs: 1000 }),
    false,
  );
  assert.equal(
    enforceRequestRateLimit({ key, limit: 2, now: 1002, windowMs: 1000 }),
    true,
  );
});

test("rejects request bodies over the configured byte limit", async () => {
  const request = new Request("https://app.test/api", {
    body: "hello",
    method: "POST",
  });

  await assert.rejects(readLimitedText(request, 4), ApiProtectionError);
});

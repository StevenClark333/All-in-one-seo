import assert from "node:assert/strict";
import test from "node:test";
import {
  HTML_VERIFICATION_PATH,
  calculateNextVerificationRetry,
  formatHtmlVerificationUrl,
  formatVerificationValue,
} from "@/lib/domain-verification";

test("formats verification values for DNS and file checks", () => {
  assert.equal(
    formatVerificationValue("abc123"),
    "allinone-seo-verification=abc123",
  );
  assert.equal(
    formatHtmlVerificationUrl("example.com"),
    `https://example.com${HTML_VERIFICATION_PATH}`,
  );
});

test("calculates bounded exponential verification retry windows", () => {
  const now = Date.now();
  const firstRetry = calculateNextVerificationRetry(1).getTime();
  const cappedRetry = calculateNextVerificationRetry(12).getTime();

  assert.ok(firstRetry >= now + 60_000 - 1_000);
  assert.ok(firstRetry <= now + 60_000 + 1_000);
  assert.ok(cappedRetry <= now + 60 * 60_000 + 1_000);
});

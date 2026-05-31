import assert from "node:assert/strict";
import test from "node:test";
import {
  consumeScriptIngestionRateLimit,
  isAllowedScriptOrigin,
  normalizeObservedPageUrl,
  sanitizeScriptPayload,
} from "@/lib/script-ingestion";

test("allows script origins for the configured domain and subdomains", () => {
  assert.equal(
    isAllowedScriptOrigin("https://example.com/pricing", "example.com"),
    true,
  );
  assert.equal(
    isAllowedScriptOrigin("https://www.example.com/pricing", "example.com"),
    true,
  );
  assert.equal(
    isAllowedScriptOrigin("https://attackerexample.com", "example.com"),
    false,
  );
});

test("normalizes observed URLs by stripping query strings and hash fragments", () => {
  assert.equal(
    normalizeObservedPageUrl("https://example.com/pricing?email=a#hero"),
    "https://example.com/pricing",
  );
});

test("sanitizes script payloads to allowlisted SEO fields", () => {
  const payload = sanitizeScriptPayload({
    url: "https://example.com/?token=secret",
    title: "A".repeat(200),
    metaDescription: "Useful page",
    canonical: "https://example.com/?utm=1",
    robots: "index,follow",
    formValue: "private",
    headings: {
      h1: [" Main heading "],
      h2: ["A", "B"],
    },
    schemaCount: 2.9,
    linkCount: 12,
    webVitals: {
      cls: 0.12345,
      lcp: 1234.5678,
    },
    observedAt: "2026-05-29T00:00:00.000Z",
  });

  assert.equal(payload.url, "https://example.com/");
  assert.equal(payload.title.length, 160);
  assert.equal(payload.canonical, "https://example.com/");
  assert.deepEqual(payload.headings.h1, ["Main heading"]);
  assert.equal(payload.schemaCount, 2);
  assert.equal(payload.webVitals.cls, 0.123);
  assert.ok(!("formValue" in payload));
});

test("rate limits script ingestion per site key", () => {
  const now = Date.now();
  const key = `site_${now}`;

  for (let index = 0; index < 60; index += 1) {
    assert.equal(consumeScriptIngestionRateLimit(key, now), true);
  }

  assert.equal(consumeScriptIngestionRateLimit(key, now), false);
  assert.equal(consumeScriptIngestionRateLimit(key, now + 60_001), true);
});

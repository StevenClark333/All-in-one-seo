import assert from "node:assert/strict";
import test from "node:test";
import {
  generateWordPressReceiverKey,
  normalizeWordPressReceiverUrl,
  readWordPressReceiverConfig,
} from "@/lib/wordpress";

test("normalizes WordPress receiver URLs", async () => {
  assert.equal(
    await normalizeWordPressReceiverUrl(
      "https://example.com/wp-json/all-in-one-seo/v1/link-fixes#ignored",
    ),
    "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
  );
});

test("rejects insecure WordPress receiver URLs", async () => {
  await assert.rejects(() =>
    normalizeWordPressReceiverUrl(
      "http://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    ),
  );
});

test("generates strong WordPress receiver keys", () => {
  const first = generateWordPressReceiverKey();
  const second = generateWordPressReceiverKey();

  assert.match(first, /^aioseo_wp_[A-Za-z0-9_-]{32}$/);
  assert.notEqual(first, second);
});

test("reads WordPress receiver test status from config", () => {
  assert.deepEqual(
    readWordPressReceiverConfig({
      connectedAt: "2026-06-03T00:00:00.000Z",
      lastTestAt: "2026-06-03T00:05:00.000Z",
      lastTestMessage: "WordPress receiver accepted the test payload.",
      lastTestStatus: "PASSED",
      lastTestStatusCode: 200,
      receiverKey: "aioseo_wp_example",
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    }),
    {
      connectedAt: "2026-06-03T00:00:00.000Z",
      lastTestAt: "2026-06-03T00:05:00.000Z",
      lastTestMessage: "WordPress receiver accepted the test payload.",
      lastTestStatus: "PASSED",
      lastTestStatusCode: 200,
      receiverKey: "aioseo_wp_example",
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    },
  );
});

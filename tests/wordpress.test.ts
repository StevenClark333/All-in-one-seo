import assert from "node:assert/strict";
import test from "node:test";
import {
  generateWordPressReceiverKey,
  normalizeWordPressReceiverUrl,
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

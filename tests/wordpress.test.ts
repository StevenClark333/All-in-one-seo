import assert from "node:assert/strict";
import test from "node:test";
import { normalizeWordPressReceiverUrl } from "@/lib/wordpress";

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

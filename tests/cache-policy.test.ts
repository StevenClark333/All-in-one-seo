import assert from "node:assert/strict";
import test from "node:test";
import { getCachePolicy } from "@/lib/cache-policy";

test("defines no-store cache policy for dynamic ingestion and webhook routes", () => {
  assert.equal(getCachePolicy("noStore"), "no-store");
});

test("defines CDN cache policy for the install script", () => {
  assert.match(getCachePolicy("script"), /s-maxage=3600/);
  assert.match(getCachePolicy("script"), /stale-while-revalidate=86400/);
});

test("defines immutable cache policy for static assets", () => {
  assert.match(getCachePolicy("staticAsset"), /immutable/);
});

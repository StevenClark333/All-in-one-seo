import assert from "node:assert/strict";
import test from "node:test";
import { assertCrawlUrlIsSafe, isPrivateAddress } from "@/lib/crawler-security";

test("identifies private and internal addresses", () => {
  assert.equal(isPrivateAddress("127.0.0.1"), true);
  assert.equal(isPrivateAddress("10.0.0.5"), true);
  assert.equal(isPrivateAddress("172.16.0.1"), true);
  assert.equal(isPrivateAddress("192.168.1.10"), true);
  assert.equal(isPrivateAddress("169.254.1.1"), true);
  assert.equal(isPrivateAddress("8.8.8.8"), false);
});

test("blocks unsafe crawler URL protocols", async () => {
  await assert.rejects(
    () => assertCrawlUrlIsSafe("file:///etc/passwd"),
    /HTTP and HTTPS/,
  );
});

test("blocks private crawler destinations", async () => {
  await assert.rejects(
    () => assertCrawlUrlIsSafe("http://127.0.0.1:3000"),
    /private or internal/,
  );
});

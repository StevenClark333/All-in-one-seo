import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeDomain,
  normalizeDomainCrawlFrequency,
  normalizeDomainPlatform,
  parseBulkDomainRows,
} from "@/lib/domain-management";

test("normalizes domains from common URL forms", () => {
  assert.equal(
    normalizeDomain("https://www.Example.com/blog?a=1"),
    "example.com",
  );
  assert.equal(normalizeDomain("WWW.Shop.test/products"), "shop.test");
});

test("normalizes domain settings defensively", () => {
  assert.equal(normalizeDomainPlatform("shopify"), "SHOPIFY");
  assert.equal(normalizeDomainPlatform("unknown-platform"), "UNKNOWN");
  assert.equal(normalizeDomainCrawlFrequency("daily"), "DAILY");
  assert.equal(normalizeDomainCrawlFrequency("hourly"), "WEEKLY");
});

test("parses bulk domain import rows", () => {
  assert.deepEqual(
    parseBulkDomainRows(
      "https://www.acme.test, Acme, WordPress, Daily\nbeta.test",
    ),
    [
      {
        clientName: "Acme",
        crawlFrequency: "DAILY",
        domain: "acme.test",
        platform: "WORDPRESS",
      },
      {
        clientName: undefined,
        crawlFrequency: "WEEKLY",
        domain: "beta.test",
        platform: "UNKNOWN",
      },
    ],
  );
});

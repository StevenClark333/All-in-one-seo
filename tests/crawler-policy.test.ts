import assert from "node:assert/strict";
import test from "node:test";
import {
  crawlDepthLimit,
  isCrawlDue,
  isDomainCrawlRateLimited,
  shouldPersistDiscoveredLinkDepth,
} from "@/lib/crawler-policy";

test("detects domain crawl rate limits", () => {
  const now = new Date("2026-05-30T12:00:00.000Z");

  assert.equal(
    isDomainCrawlRateLimited({
      lastCrawledAt: new Date("2026-05-30T11:50:00.000Z"),
      now,
    }),
    true,
  );
  assert.equal(
    isDomainCrawlRateLimited({
      lastCrawledAt: new Date("2026-05-30T11:00:00.000Z"),
      now,
    }),
    false,
  );
});

test("detects due scheduled crawls", () => {
  const now = new Date("2026-05-30T12:00:00.000Z");

  assert.equal(
    isCrawlDue({ crawlFrequency: "DAILY", lastCrawledAt: null, now }),
    true,
  );
  assert.equal(
    isCrawlDue({
      crawlFrequency: "DAILY",
      lastCrawledAt: new Date("2026-05-29T11:59:00.000Z"),
      now,
    }),
    true,
  );
  assert.equal(
    isCrawlDue({
      crawlFrequency: "WEEKLY",
      lastCrawledAt: new Date("2026-05-28T12:00:00.000Z"),
      now,
    }),
    false,
  );
  assert.equal(
    isCrawlDue({ crawlFrequency: "MANUAL", lastCrawledAt: null, now }),
    false,
  );
});

test("caps persisted crawl depth", () => {
  assert.equal(crawlDepthLimit, 1);
  assert.equal(shouldPersistDiscoveredLinkDepth(1), true);
  assert.equal(shouldPersistDiscoveredLinkDepth(2), false);
});

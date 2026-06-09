import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCrawlRunChangeValue,
  formatCrawlRunResponse,
} from "@/lib/crawl-run-display-labels";

test("formats missing crawl recap response values as gentle setup states", () => {
  assert.equal(formatCrawlRunResponse(null), "Not checked yet");
  assert.equal(formatCrawlRunResponse(200), "Good (200)");
  assert.equal(formatCrawlRunResponse(301), "Redirects (301)");
  assert.equal(formatCrawlRunResponse(500), "Needs review (500)");
});

test("formats missing crawl recap change values as gentle setup states", () => {
  assert.equal(formatCrawlRunChangeValue(null), "Not found yet");
  assert.equal(formatCrawlRunChangeValue(""), "Not found yet");
  assert.equal(formatCrawlRunChangeValue("New title"), "New title");
});

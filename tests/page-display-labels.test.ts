import assert from "node:assert/strict";
import test from "node:test";
import {
  formatPageCheckDate,
  formatPageClient,
  formatPageMetaText,
  formatPageResponse,
  formatPageWordCount,
} from "@/lib/page-display-labels";

test("formats missing page snapshot data as gentle setup states", () => {
  assert.equal(formatPageCheckDate(null), "Not checked yet");
  assert.notEqual(
    formatPageCheckDate(new Date("2026-06-09T12:00:00.000Z")),
    "Not checked yet",
  );
  assert.equal(formatPageClient(null), "No client yet");
  assert.equal(formatPageClient(""), "No client yet");
  assert.equal(formatPageClient("Urban Thread"), "Urban Thread");
  assert.equal(formatPageMetaText(null), "Not found yet");
  assert.equal(formatPageMetaText("  "), "Not found yet");
  assert.equal(formatPageMetaText("Summer dresses"), "Summer dresses");
  assert.equal(formatPageResponse(null), "Not checked yet");
  assert.equal(formatPageResponse(200), "Good (200)");
  assert.equal(formatPageResponse(301), "Redirects (301)");
  assert.equal(formatPageResponse(404), "Needs review (404)");
  assert.equal(formatPageWordCount(null), "Not counted yet");
  assert.equal(formatPageWordCount(1280), "1,280 words");
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  formatWebsiteClient,
  formatWebsiteHealth,
  formatWebsitePercent,
  formatWebsiteResponse,
} from "@/lib/website-display-labels";

test("formats missing website health data as gentle setup states", () => {
  assert.equal(formatWebsiteClient(null), "No client yet");
  assert.equal(formatWebsiteClient(""), "No client yet");
  assert.equal(formatWebsiteClient("Urban Thread"), "Urban Thread");
  assert.equal(formatWebsiteHealth(null), "No score yet");
  assert.equal(formatWebsiteHealth(84), "84%");
  assert.equal(formatWebsitePercent(null), "Not checked yet");
  assert.equal(formatWebsitePercent(92), "92%");
  assert.equal(formatWebsiteResponse(null), "Not checked yet");
  assert.equal(formatWebsiteResponse(200), "Good (200)");
  assert.equal(formatWebsiteResponse(301), "Redirects (301)");
  assert.equal(formatWebsiteResponse(404), "Needs review (404)");
});

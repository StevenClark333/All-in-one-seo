import assert from "node:assert/strict";
import test from "node:test";
import {
  formatKeywordIntent,
  formatKeywordPosition,
  formatKeywordPositionInline,
} from "@/lib/keyword-display-labels";

test("formats keyword intent labels for nontechnical readers", () => {
  assert.equal(formatKeywordIntent("informational"), "Learning search");
  assert.equal(formatKeywordIntent("commercial"), "Buying research");
  assert.equal(formatKeywordIntent("transactional"), "Ready to buy");
  assert.equal(formatKeywordIntent("brand"), "Brand/site lookup");
  assert.equal(formatKeywordIntent("navigational"), "Brand/site lookup");
  assert.equal(formatKeywordIntent("comparison"), "Comparing options");
  assert.equal(formatKeywordIntent("local"), "Nearby search");
});

test("formats missing keyword positions as not ranking yet", () => {
  assert.equal(formatKeywordPosition(null), "Not ranking yet");
  assert.equal(formatKeywordPosition(undefined), "Not ranking yet");
  assert.equal(formatKeywordPosition(0), "Not ranking yet");
  assert.equal(formatKeywordPosition(8.4), "8.4");
  assert.equal(formatKeywordPositionInline(null), "Not ranking yet");
  assert.equal(formatKeywordPositionInline(0), "Not ranking yet");
  assert.equal(formatKeywordPositionInline(8.4), "Position 8.4");
});

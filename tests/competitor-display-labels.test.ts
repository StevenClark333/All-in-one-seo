import assert from "node:assert/strict";
import test from "node:test";
import {
  formatCompetitorHealth,
  formatCompetitorOwner,
  formatCompetitorPosition,
  formatCompetitorRankNote,
} from "@/lib/competitor-display-labels";

test("formats missing competitor comparison labels softly", () => {
  assert.equal(formatCompetitorHealth(null), "No score yet");
  assert.equal(formatCompetitorHealth(undefined), "No score yet");
  assert.equal(formatCompetitorHealth(84), "84");
  assert.equal(formatCompetitorOwner(null), "No client yet");
  assert.equal(formatCompetitorOwner(""), "No client yet");
  assert.equal(formatCompetitorOwner("BrightLedger"), "BrightLedger");
  assert.equal(formatCompetitorRankNote(null), "Waiting for rankings");
  assert.equal(formatCompetitorRankNote("seo audit"), "seo audit");
});

test("uses the same not-ranking label for competitor positions", () => {
  assert.equal(formatCompetitorPosition(null), "Not ranking yet");
  assert.equal(formatCompetitorPosition(0), "Not ranking yet");
  assert.equal(formatCompetitorPosition(6.2), "6.2");
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  formatRankClient,
  formatRankDifficulty,
  formatRankPosition,
  formatRankVolume,
} from "@/lib/rank-display-labels";

test("formats missing rank tracking data as gentle setup states", () => {
  assert.equal(formatRankClient(null), "No client yet");
  assert.equal(formatRankClient(""), "No client yet");
  assert.equal(formatRankClient("Urban Thread"), "Urban Thread");
  assert.equal(formatRankDifficulty(null), "No difficulty yet");
  assert.equal(formatRankDifficulty(47), "47");
  assert.equal(formatRankPosition(null), "Not ranking yet");
  assert.equal(formatRankPosition(0), "Not ranking yet");
  assert.equal(formatRankPosition(5.5), "5.5");
  assert.equal(formatRankVolume(null), "No volume yet");
  assert.equal(formatRankVolume(1200), "1,200");
});

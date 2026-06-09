import assert from "node:assert/strict";
import test from "node:test";
import { formatOverviewOwner } from "@/lib/overview-display-labels";

test("formats missing overview owners as gentle setup states", () => {
  assert.equal(formatOverviewOwner(null), "No owner yet");
  assert.equal(formatOverviewOwner(""), "No owner yet");
  assert.equal(formatOverviewOwner("Maya"), "Maya");
});

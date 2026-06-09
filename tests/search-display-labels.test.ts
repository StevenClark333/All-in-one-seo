import assert from "node:assert/strict";
import test from "node:test";
import {
  formatSearchMovement,
  formatSearchPosition,
  formatSearchPositionWithMovement,
} from "@/lib/search-display-labels";

test("formats missing search positions as not ranking yet", () => {
  assert.equal(formatSearchPosition(null), "Not ranking yet");
  assert.equal(formatSearchPosition(undefined), "Not ranking yet");
  assert.equal(formatSearchPosition(0), "Not ranking yet");
  assert.equal(formatSearchPosition(4.3), "4.3");
});

test("formats new search movement in plain language", () => {
  assert.equal(formatSearchMovement(null), "New this period");
  assert.equal(formatSearchMovement(1.2), "+1.2");
  assert.equal(formatSearchMovement(-2.4), "-2.4");
  assert.equal(
    formatSearchPositionWithMovement({ movement: null, position: 0 }),
    "Not ranking yet (New this period)",
  );
});

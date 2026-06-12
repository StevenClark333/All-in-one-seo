import assert from "node:assert/strict";
import test from "node:test";
import { softenGlobalSearchProblemTitle } from "@/lib/global-search";

test("softens global search problem titles for beginner scanning", () => {
  assert.equal(
    softenGlobalSearchProblemTitle("Critical Regression"),
    "Important change",
  );
  assert.equal(
    softenGlobalSearchProblemTitle("Duplicate Meta Description"),
    "Repeated page description",
  );
  assert.doesNotMatch(
    softenGlobalSearchProblemTitle("Critical Regression"),
    /urgent/i,
  );
});

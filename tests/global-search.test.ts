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
  assert.equal(
    softenGlobalSearchProblemTitle("Broken internal link detected"),
    "Page link that needs help",
  );
  assert.equal(
    softenGlobalSearchProblemTitle("Canonical points to a non-200 URL"),
    "Preferred page link points to a page that is not loading",
  );
  assert.doesNotMatch(
    softenGlobalSearchProblemTitle("Critical Regression"),
    /urgent/i,
  );
});

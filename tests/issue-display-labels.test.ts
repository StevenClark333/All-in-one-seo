import assert from "node:assert/strict";
import test from "node:test";
import {
  formatIssueNoteAuthor,
  softenIssueTitle,
} from "@/lib/issue-display-labels";

test("formats missing issue note authors as gentle setup states", () => {
  assert.equal(formatIssueNoteAuthor(null), "No author yet");
  assert.equal(formatIssueNoteAuthor(""), "No author yet");
  assert.equal(formatIssueNoteAuthor("Maya"), "Maya");
});

test("softens stored issue titles for beginner-facing workspace lists", () => {
  assert.equal(
    softenIssueTitle("Broken internal link detected"),
    "Page link that needs help",
  );
  assert.equal(
    softenIssueTitle("Canonical points to a non-200 URL"),
    "Preferred page link points to a page that is not loading",
  );
  assert.equal(
    softenIssueTitle("Missing canonical tag"),
    "Preferred page link missing",
  );
  assert.equal(
    softenIssueTitle("Homepage became noindex after latest deploy"),
    "Homepage was hidden from Google after deploy",
  );
});

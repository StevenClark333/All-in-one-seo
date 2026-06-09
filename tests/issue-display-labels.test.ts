import assert from "node:assert/strict";
import test from "node:test";
import { formatIssueNoteAuthor } from "@/lib/issue-display-labels";

test("formats missing issue note authors as gentle setup states", () => {
  assert.equal(formatIssueNoteAuthor(null), "No author yet");
  assert.equal(formatIssueNoteAuthor(""), "No author yet");
  assert.equal(formatIssueNoteAuthor("Maya"), "Maya");
});

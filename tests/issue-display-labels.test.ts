import assert from "node:assert/strict";
import test from "node:test";
import {
  formatIssueNoteAuthor,
  softenIssueDescription,
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
    softenIssueTitle("Duplicate meta descriptions across page template"),
    "Page template repeats the same description",
  );
  assert.equal(
    softenIssueTitle("Homepage blocked by robots.txt"),
    "Homepage blocked from Google",
  );
  assert.equal(softenIssueTitle("Missing page title"), "Page title missing");
  assert.equal(
    softenIssueTitle("Missing canonical tag"),
    "Preferred page link missing",
  );
  assert.equal(
    softenIssueTitle("Homepage became noindex after latest deploy"),
    "Homepage was hidden from Google after deploy",
  );
});

test("softens stored issue descriptions for beginner-facing problem text", () => {
  assert.equal(
    softenIssueDescription(
      "Internal link https://example.com/login returned HTTP 404.",
    ),
    "Link that stopped working: https://example.com/login could not be opened (404).",
  );
  assert.equal(
    softenIssueDescription(
      "https://example.com/ canonical returned HTTP 403.",
    ),
    "https://example.com/ preferred page link could not be opened (403).",
  );
});

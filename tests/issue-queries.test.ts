import assert from "node:assert/strict";
import test from "node:test";
import { getIssueTypeGroupKey } from "@/lib/issue-queries";

test("groups URL-specific issue types under one friendly key", () => {
  assert.equal(
    getIssueTypeGroupKey(
      "internally_linked_url_missing_from_sitemap:https://example.com/about",
    ),
    "internally_linked_url_missing_from_sitemap",
  );
  assert.equal(getIssueTypeGroupKey("missing_title"), "missing_title");
});

test("normalizes stored generated issue names into friendly problem-area keys", () => {
  assert.equal(
    getIssueTypeGroupKey("Broken Internal Link"),
    "broken_internal_link",
  );
  assert.equal(
    getIssueTypeGroupKey("Broken internal link detected"),
    "broken_internal_link",
  );
  assert.equal(
    getIssueTypeGroupKey("Canonical points to a non-200 URL"),
    "canonical_non_200",
  );
  assert.equal(
    getIssueTypeGroupKey("Product template canonical points to non-200 URLs"),
    "canonical_non_200",
  );
});

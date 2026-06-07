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

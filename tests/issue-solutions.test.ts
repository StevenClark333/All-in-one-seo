import assert from "node:assert/strict";
import test from "node:test";
import { buildIssueSolution } from "@/lib/issue-solutions";

test("maps broken internal links to Fix Center actions", () => {
  const solution = buildIssueSolution({
    issueType: "broken_internal_link:https://example.com/old",
    platform: "SHOPIFY",
    title: "Broken link",
  });

  assert.equal(solution.primaryAction, "fix-center");
  assert.equal(solution.actionLabel, "Generate link fix");
  assert.equal(solution.effort, "Quick fix");
});

test("maps schema issues to generated fix briefs", () => {
  const solution = buildIssueSolution({
    issueType: "product_schema_missing",
    platform: "SHOPIFY",
    title: "Product schema missing",
  });

  assert.equal(solution.primaryAction, "recommendations");
  assert.equal(solution.effort, "Template fix");
  assert.match(solution.detail, /structured data/i);
});

test("maps canonical issues to platform-specific guidance", () => {
  const solution = buildIssueSolution({
    issueType: "missing_canonical",
    platform: "CUSTOM",
    title: "Missing canonical",
  });

  assert.equal(solution.title, "Correct the canonical URL");
  assert.match(solution.detail, /Custom/i);
});

test("falls back to recommendation text for unknown issues", () => {
  const solution = buildIssueSolution({
    issueType: "custom_issue",
    platform: "UNKNOWN",
    recommendation: "Fix the custom issue.",
    title: "Custom issue",
  });

  assert.equal(solution.detail, "Fix the custom issue.");
  assert.equal(solution.primaryAction, "issue");
});

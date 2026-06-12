import assert from "node:assert/strict";
import test from "node:test";
import { buildIssueSolution } from "@/lib/issue-solutions";

test("maps stopped page links to Fixes actions", () => {
  const solution = buildIssueSolution({
    issueType: "broken_internal_link:https://example.com/old",
    platform: "SHOPIFY",
    title: "Broken link",
  });

  assert.equal(solution.primaryAction, "fix-center");
  assert.equal(solution.actionLabel, "Create link note");
  assert.equal(solution.title, "Replace link that stopped working");
  assert.equal(solution.effort, "Quick fix");
  assert.equal(solution.fixAvailability.label, "Can prepare here");
  assert.match(solution.whyMatters, /Links that stop working/i);
  assert.match(solution.steps.join(" "), /Open Fixes/i);
  assert.doesNotMatch(
    [
      solution.actionLabel,
      solution.detail,
      solution.fixAvailability.detail,
      solution.steps.join(" "),
      solution.title,
      solution.whyMatters,
    ].join(" "),
    /broken internal link|Fix Center|replacement URL|internal URL/i,
  );
});

test("maps page-list link gaps to helpful page-link notes", () => {
  const solution = buildIssueSolution({
    issueType: "sitemap_url_not_internally_linked:https://example.com/services",
    platform: "WORDPRESS",
    title: "Page list gap",
  });

  assert.equal(solution.primaryAction, "fix-center");
  assert.equal(solution.actionLabel, "Create helpful link note");
  assert.equal(solution.title, "Add helpful page link");
  assert.match(solution.detail, /helpful link/i);
  assert.match(solution.fixAvailability.detail, /visible link words/i);
  assert.doesNotMatch(
    [
      solution.actionLabel,
      solution.detail,
      solution.fixAvailability.detail,
      solution.steps.join(" "),
      solution.title,
      solution.whyMatters,
    ].join(" "),
    /internal link fix|source page|target page|anchor text|sitemap\/internal link|Fix Center/i,
  );
});

test("maps Google detail problems to generated fix notes", () => {
  const solution = buildIssueSolution({
    issueType: "product_schema_missing",
    platform: "SHOPIFY",
    title: "Product schema missing",
  });

  assert.equal(solution.primaryAction, "recommendations");
  assert.equal(solution.effort, "Template fix");
  assert.equal(solution.fixAvailability.label, "Needs site helper");
  assert.equal(solution.actionLabel, "Add Google details note");
  assert.equal(solution.title, "Add page details for Google");
  assert.match(solution.detail, /page details for Google/i);
  assert.doesNotMatch(
    [
      solution.actionLabel,
      solution.detail,
      solution.fixAvailability.detail,
      solution.steps.join(" "),
      solution.title,
      solution.whyMatters,
    ].join(" "),
    /schema|structured data|JSON-LD/i,
  );
});

test("maps preferred page issues to platform-specific guidance", () => {
  const solution = buildIssueSolution({
    issueType: "missing_canonical",
    platform: "CUSTOM",
    title: "Missing canonical",
  });

  assert.equal(solution.actionLabel, "Fix preferred page note");
  assert.equal(solution.title, "Correct the preferred page");
  assert.equal(solution.fixAvailability.label, "Needs website editor");
  assert.match(solution.detail, /Custom/i);
  assert.doesNotMatch(
    [
      solution.actionLabel,
      solution.detail,
      solution.fixAvailability.detail,
      solution.steps.join(" "),
      solution.title,
      solution.whyMatters,
    ].join(" "),
    /canonical|indexable URL/i,
  );
});

test("maps Google visibility problems to site helper notes", () => {
  const solution = buildIssueSolution({
    issueType: "page_noindex",
    platform: "CUSTOM",
    title: "Page hidden from Google",
  });

  assert.equal(solution.actionLabel, "Fix Google visibility note");
  assert.equal(solution.title, "Restore Google visibility");
  assert.equal(solution.fixAvailability.label, "Needs site helper");
  assert.match(solution.detail, /appear in Google/i);
  assert.doesNotMatch(
    [
      solution.actionLabel,
      solution.detail,
      solution.fixAvailability.detail,
      solution.steps.join(" "),
      solution.title,
      solution.whyMatters,
    ].join(" "),
    /indexability|noindex|indexable/i,
  );
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
  assert.equal(solution.fixAvailability.label, "Needs site helper");
  assert.match(solution.whyMatters, /ranking drops/i);
});

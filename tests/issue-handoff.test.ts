import assert from "node:assert/strict";
import test from "node:test";
import { buildIssueHandoffBrief } from "@/lib/issue-handoff";
import { buildIssueSolution } from "@/lib/issue-solutions";

test("builds plain-language CMS handoff markdown for an issue", () => {
  const solution = buildIssueSolution({
    issueType: "missing_meta_description",
    platform: "SHOPIFY",
    title: "Missing meta description",
  });
  const brief = buildIssueHandoffBrief({
    clientName: "Urban Thread",
    description: "The product page is missing a useful search description.",
    domain: "urbanthread.store",
    issueType: "missing_meta_description",
    pageUrl: "https://urbanthread.store/products/jacket",
    platform: "SHOPIFY",
    recommendation: "Add a concise product-specific meta description.",
    severity: "WARNING",
    solution,
    title: "Missing meta description",
  });

  assert.equal(brief.owner, "CMS editor or site manager");
  assert.match(brief.exportFilename, /urbanthread-store/);
  assert.match(brief.markdown, /## What is wrong/);
  assert.match(brief.markdown, /Needs CMS/);
  assert.match(brief.markdown, /Run a fresh scan/);
});

test("builds developer handoff markdown for indexability issues", () => {
  const solution = buildIssueSolution({
    issueType: "homepage_blocked_by_robots",
    platform: "CUSTOM",
    title: "Homepage blocked by robots",
  });
  const brief = buildIssueHandoffBrief({
    description: "The homepage is blocked from search engines.",
    domain: "example.com",
    issueType: "homepage_blocked_by_robots",
    platform: "CUSTOM",
    severity: "CRITICAL",
    solution,
    title: "Homepage blocked by robots",
  });

  assert.equal(brief.owner, "Developer or site admin");
  assert.match(brief.markdown, /Developer or site admin/);
  assert.match(brief.markdown, /Site-wide issue on example\.com/);
});

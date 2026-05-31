import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLocalIssueRecommendations,
  buildLocalPageRecommendations,
  buildLocalTemplateFixBriefs,
  validateRecommendationPayloads,
} from "@/lib/ai";

test("builds deterministic page SEO recommendations", () => {
  const recommendations = buildLocalPageRecommendations({
    url: "https://example.com/services/local-seo",
    domain: "example.com",
    title: null,
    metaDescription: null,
    h1: null,
  });

  assert.equal(recommendations.title.suggestedValue, "Local Seo | example.com");
  assert.match(
    recommendations.metaDescription.suggestedValue ?? "",
    /local seo/i,
  );
  assert.equal(recommendations.h1.suggestedValue, "Local Seo");
  assert.equal(
    recommendations.schema.suggestedValue,
    "WebPage, BreadcrumbList, Organization",
  );
  assert.match(recommendations.internalLinking.summary, /Link to this page/i);
  assert.match(recommendations.contentGap.summary, /Expand the page/i);
});

test("builds deterministic issue fix briefs", () => {
  const recommendations = buildLocalIssueRecommendations({
    title: "Missing title",
    description: "The page has no title tag.",
    recommendation: "Add a unique title tag.",
    platform: "WORDPRESS",
  });

  assert.match(recommendations.explanation.summary, /no title tag/i);
  assert.match(recommendations.developerBrief.implementation ?? "", /route/i);
  assert.match(
    recommendations.cmsBrief.cmsInstructions?.WordPress ?? "",
    /SEO plugin/i,
  );
});

test("rejects unsafe AI recommendation payloads", () => {
  const fallback = buildLocalPageRecommendations({
    url: "https://example.com/products/widget",
    domain: "example.com",
  });
  const sanitized = validateRecommendationPayloads(
    {
      title: {
        title: "<script>alert(1)</script>",
        summary: "Unsafe",
        rationale: "Unsafe",
      },
      schema: {
        title: "Schema",
        summary: "Use Product schema.",
        suggestedValue: "Product",
        rationale: "It matches the page type.",
      },
    },
    fallback,
  );

  assert.equal(sanitized.title.title, "SEO title suggestion");
  assert.equal(sanitized.schema.suggestedValue, "Product");
  assert.equal(
    sanitized.internalLinking.title,
    "Internal linking recommendation",
  );
});

test("builds deterministic template-level fix briefs", () => {
  const recommendations = buildLocalTemplateFixBriefs({
    domain: "example.com",
    platform: "SHOPIFY",
    templateKey: "product",
    templateLabel: "Product",
    pageCount: 12,
    issueCount: 24,
    criticalCount: 4,
    warningCount: 10,
    issueTypes: [
      { issueType: "missing_schema", count: 12 },
      { issueType: "missing_meta_description", count: 12 },
    ],
  });

  assert.match(recommendations.developerBrief.summary, /24 active issues/i);
  assert.match(
    recommendations.developerBrief.implementation ?? "",
    /shared route/i,
  );
  assert.match(
    recommendations.cmsBrief.cmsInstructions?.Shopify ?? "",
    /Liquid template/i,
  );
});

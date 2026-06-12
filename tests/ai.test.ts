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
  assert.equal(recommendations.title.title, "Page title suggestion");
  assert.match(
    recommendations.metaDescription.suggestedValue ?? "",
    /local seo/i,
  );
  assert.equal(
    recommendations.metaDescription.title,
    "Page description suggestion",
  );
  assert.equal(recommendations.h1.suggestedValue, "Local Seo");
  assert.equal(recommendations.h1.title, "Main heading suggestion");
  assert.equal(recommendations.schema.title, "Google details suggestion");
  assert.equal(
    recommendations.schema.suggestedValue,
    "WebPage, BreadcrumbList, Organization",
  );
  assert.match(recommendations.internalLinking.summary, /clear link text/i);
  assert.equal(
    recommendations.internalLinking.title,
    "Helpful page links suggestion",
  );
  assert.match(recommendations.contentGap.summary, /Expand the page/i);
  assert.doesNotMatch(
    [
      recommendations.schema.title,
      recommendations.schema.implementation,
      recommendations.schema.rationale,
      recommendations.internalLinking.title,
      recommendations.internalLinking.summary,
      recommendations.internalLinking.implementation,
      recommendations.contentGap.title,
    ].join(" "),
    /SEO title suggestion|Meta description suggestion|H1 suggestion|Schema recommendation|Internal linking recommendation|anchor text|recrawling|canonical|sitemap|crawlable|JSON-LD|structured data|Content gap recommendation/,
  );
});

test("builds deterministic issue fix briefs", () => {
  const recommendations = buildLocalIssueRecommendations({
    title: "Missing title",
    description: "The page has no title tag.",
    recommendation: "Add a unique title tag.",
    platform: "WORDPRESS",
  });

  assert.match(recommendations.explanation.summary, /no title tag/i);
  assert.equal(
    recommendations.developerBrief.title,
    "Website helper fix note",
  );
  assert.match(
    recommendations.developerBrief.implementation ?? "",
    /new website check/i,
  );
  assert.equal(recommendations.cmsBrief.title, "Website editor fix note");
  assert.match(
    recommendations.cmsBrief.cmsInstructions?.WordPress ?? "",
    /website plugin/i,
  );
  assert.doesNotMatch(
    [
      recommendations.developerBrief.title,
      recommendations.developerBrief.implementation,
      recommendations.explanation.rationale,
      recommendations.cmsBrief.title,
      recommendations.cmsBrief.cmsInstructions?.WordPress,
      recommendations.cmsBrief.cmsInstructions?.Shopify,
      recommendations.cmsBrief.cmsInstructions?.Webflow,
      recommendations.cmsBrief.rationale,
    ].join(" "),
    /Developer fix brief|CMS-specific fix brief|SEO fields|SEO panel|SEO plugin|rendered page|live page source|crawlability|indexability|rerun the crawl|technical accuracy/,
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

  assert.equal(sanitized.title.title, "Page title suggestion");
  assert.equal(sanitized.schema.suggestedValue, "Product");
  assert.equal(
    sanitized.internalLinking.title,
    "Helpful page links suggestion",
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

  assert.match(
    recommendations.developerBrief.summary,
    /24 problems ready to review/i,
  );
  assert.match(
    recommendations.developerBrief.implementation ?? "",
    /new website check/i,
  );
  assert.equal(
    recommendations.developerBrief.title,
    "Product repeated-page fix note",
  );
  assert.match(
    recommendations.cmsBrief.cmsInstructions?.Shopify ?? "",
    /Liquid template/i,
  );
  assert.doesNotMatch(
    [
      recommendations.developerBrief.title,
      recommendations.developerBrief.summary,
      recommendations.developerBrief.implementation,
      recommendations.developerBrief.rationale,
      recommendations.cmsBrief.cmsInstructions?.WordPress,
      recommendations.cmsBrief.cmsInstructions?.Webflow,
      recommendations.cmsBrief.cmsInstructions?.Custom,
    ].join(" "),
    /template fix brief|active issues|mixed SEO issues|SEO defects|recrawl|recrawling|internal links|canonicals|robots directives|SEO plugin|SEO fields|schema settings|schema embed|CMS Collection Template/,
  );
});

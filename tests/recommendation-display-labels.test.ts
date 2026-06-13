import assert from "node:assert/strict";
import test from "node:test";
import {
  formatRecommendationTypeLabel,
  softenRecommendationSummary,
  softenRecommendationTitle,
} from "@/lib/recommendation-display-labels";

test("softens saved recommendation titles for beginner-facing Ideas lists", () => {
  assert.equal(
    softenRecommendationTitle("CMS-specific fix brief"),
    "Website editor fix note",
  );
  assert.equal(
    softenRecommendationTitle("Developer fix brief"),
    "Website helper fix note",
  );
  assert.equal(
    softenRecommendationTitle("Schema recommendation"),
    "Google details suggestion",
  );
  assert.equal(
    softenRecommendationTitle("SEO title suggestion"),
    "Page title suggestion",
  );
});

test("softens saved recommendation summaries without changing their intent", () => {
  assert.equal(
    softenRecommendationSummary(
      "Recommended workflow for custom and common CMS setups.",
    ),
    "Clear steps for common website editors.",
  );
  assert.equal(
    softenRecommendationSummary(
      "https://example.com/page appears in the sitemap but was not found in the internal link graph.",
    ),
    "https://example.com/page is in the page list but needs a helpful page link.",
  );
  assert.equal(
    softenRecommendationSummary(
      "Add at least one relevant internal link to this URL or remove it from the sitemap if it should not be discoverable.",
    ),
    "Add a helpful page link to this page, or remove it from the page list if people should not find it.",
  );
});

test("formats saved recommendation types as page-care labels", () => {
  assert.equal(formatRecommendationTypeLabel("SCHEMA"), "Google details");
  assert.equal(formatRecommendationTypeLabel("TITLE"), "Page title");
  assert.equal(formatRecommendationTypeLabel("ISSUE_FIX"), "Fix note");
});

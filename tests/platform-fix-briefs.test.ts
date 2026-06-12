import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPlatformFixBrief,
  renderPlatformFixBriefMarkdown,
} from "@/lib/platform-fix-briefs";

const baseInput = {
  anchorText: "SEO services",
  domain: "example.com",
  sourceUrl: "https://example.com/services",
  suggestedUrl: "https://example.com/seo-services",
};

test("builds custom PHP helper note with redirect snippets", () => {
  const brief = buildPlatformFixBrief({
    ...baseInput,
    brokenUrl: "https://example.com/old-seo",
    platform: "CUSTOM",
  });

  assert.equal(brief.deliveryMode, "Custom PHP helper note");
  assert.equal(brief.exportFilename, "example-com-link-repair-note.md");
  assert.ok(brief.steps.some((step) => step.includes("PHP template")));
  assert.ok(brief.snippets.some((snippet) => snippet.code.includes("Redirect 301")));
  assert.ok(brief.snippets.some((snippet) => snippet.code.includes("rewrite")));
});

test("builds Shopify theme note with redirect CSV", () => {
  const brief = buildPlatformFixBrief({
    ...baseInput,
    brokenUrl: "https://example.com/products/old",
    platform: "SHOPIFY",
  });

  assert.equal(brief.deliveryMode, "Shopify theme note");
  assert.ok(brief.snippets[0].code.includes("<a href="));
  assert.ok(brief.snippets[1].code.includes("Redirect from,Redirect to"));
});

test("builds Webflow editor note", () => {
  const brief = buildPlatformFixBrief({
    ...baseInput,
    platform: "WEBFLOW",
  });

  assert.equal(brief.deliveryMode, "Webflow Designer/CMS note");
  assert.equal(brief.exportFilename, "example-com-internal-link-note.md");
  assert.ok(brief.steps.some((step) => step.includes("Webflow")));
});

test("renders platform fix brief markdown", () => {
  const brief = buildPlatformFixBrief({
    ...baseInput,
    platform: "UNKNOWN",
  });
  const markdown = renderPlatformFixBriefMarkdown(brief);

  assert.ok(markdown.startsWith("# Add helpful page link for example.com"));
  assert.ok(markdown.includes("## Steps"));
  assert.ok(markdown.includes("## Check after publishing"));
  assert.ok(markdown.includes("How to use this note: Generic helper note"));
  assert.ok(markdown.includes("add a helpful page link"));
  assert.doesNotMatch(
    markdown,
    /Add internal link on example.com|Delivery mode|handoff|source page|source post|old URL|Run a crawl|issue status|anchor text|contextual link/,
  );
});

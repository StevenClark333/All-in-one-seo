import assert from "node:assert/strict";
import test from "node:test";
import {
  analyzeLinkGraph,
  generateInternalLinkOpportunities,
} from "@/lib/link-graph-analyzer";

test("detects deep pages from homepage graph depth", () => {
  const pages = Array.from({ length: 6 }, (_, index) => ({
    id: `page_${index}`,
    url: `https://example.com/page-${index}`,
    normalizedUrl: `https://example.com/page-${index}`,
    importance: index === 0 ? "CRITICAL" : "NORMAL",
    pageType: index === 0 ? "homepage" : null,
  }));
  const links = pages.slice(0, -1).map((page, index) => ({
    sourcePageId: page.id,
    targetPageId: pages[index + 1].id,
    normalizedUrl: pages[index + 1].normalizedUrl,
  }));

  const issues = analyzeLinkGraph({
    pages,
    links,
    sitemapUrls: pages.map((page) => page.normalizedUrl),
  });

  const deepIssues = issues.filter((issue) =>
    issue.issueType.startsWith("deep_page:"),
  );

  assert.equal(deepIssues.length, 2);
  assert.equal(deepIssues[0].severity, "WARNING");
});

test("detects sitemap and internal link mismatches", () => {
  const issues = analyzeLinkGraph({
    pages: [
      {
        id: "home",
        url: "https://example.com/",
        normalizedUrl: "https://example.com/",
        importance: "CRITICAL",
        pageType: "homepage",
      },
      {
        id: "linked",
        url: "https://example.com/linked",
        normalizedUrl: "https://example.com/linked",
        importance: "NORMAL",
        pageType: null,
      },
      {
        id: "sitemap-only",
        url: "https://example.com/sitemap-only",
        normalizedUrl: "https://example.com/sitemap-only",
        importance: "NORMAL",
        pageType: null,
      },
    ],
    links: [
      {
        sourcePageId: "home",
        targetPageId: "linked",
        normalizedUrl: "https://example.com/linked",
      },
    ],
    sitemapUrls: ["https://example.com/sitemap-only"],
  });

  const issueTypes = issues.map((issue) => issue.issueType);

  assert.ok(
    issueTypes.includes(
      "sitemap_url_not_internally_linked:https://example.com/sitemap-only",
    ),
  );
  assert.ok(
    issueTypes.includes(
      "internally_linked_url_missing_from_sitemap:https://example.com/linked",
    ),
  );
});

test("generates internal link opportunities for low-linked pages", () => {
  const pages = [
    {
      id: "home",
      url: "https://example.com/",
      normalizedUrl: "https://example.com/",
      importance: "CRITICAL",
      pageType: "homepage",
    },
    {
      id: "hub",
      url: "https://example.com/blog",
      normalizedUrl: "https://example.com/blog",
      importance: "IMPORTANT",
      pageType: "blog",
    },
    {
      id: "target",
      url: "https://example.com/blog/internal-linking",
      normalizedUrl: "https://example.com/blog/internal-linking",
      importance: "NORMAL",
      pageType: "blog",
    },
    {
      id: "other",
      url: "https://example.com/docs/setup",
      normalizedUrl: "https://example.com/docs/setup",
      importance: "NORMAL",
      pageType: "docs",
    },
  ];
  const opportunities = generateInternalLinkOpportunities({
    pages,
    links: [
      {
        sourcePageId: "home",
        targetPageId: "hub",
        normalizedUrl: "https://example.com/blog",
      },
      {
        sourcePageId: "hub",
        targetPageId: "other",
        normalizedUrl: "https://example.com/docs/setup",
      },
    ],
  });
  const targetOpportunity = opportunities.find(
    (opportunity) =>
      opportunity.sourcePageId === "hub" &&
      opportunity.targetPageId === "target",
  );

  assert.ok(targetOpportunity);
  assert.equal(targetOpportunity.anchorText, "Internal Linking");
  assert.match(targetOpportunity.reason, /blog template group/i);
});

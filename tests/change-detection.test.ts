import assert from "node:assert/strict";
import test from "node:test";
import {
  compareCrawlArtifacts,
  compareSnapshots,
  compareTemplateRegressions,
} from "@/lib/change-detection";

test("detects important SEO field changes", () => {
  const changes = compareSnapshots(
    {
      id: "current",
      pageId: "page_1",
      crawlRunId: "crawl_2",
      statusCode: 200,
      title: "New title",
      metaDescription: "New description",
      h1: "New H1",
      canonical: "https://example.com/new",
      robotsDirective: null,
      metadataJson: {
        schemaCount: 2,
        discoveredInternalLinks: [
          "https://example.com/",
          "https://example.com/pricing",
        ],
      },
      page: { id: "page_1", domainId: "domain_1" },
    },
    {
      id: "previous",
      pageId: "page_1",
      crawlRunId: "crawl_1",
      statusCode: 200,
      title: "Old title",
      metaDescription: "Old description",
      h1: "Old H1",
      canonical: "https://example.com/old",
      robotsDirective: null,
      metadataJson: {
        schemaCount: 1,
        discoveredInternalLinks: ["https://example.com/"],
      },
    },
  );

  const changeTypes = changes.map((change) => change.changeType);

  assert.ok(changeTypes.includes("title_changed"));
  assert.ok(changeTypes.includes("meta_description_changed"));
  assert.ok(changeTypes.includes("h1_changed"));
  assert.ok(changeTypes.includes("canonical_changed"));
  assert.ok(changeTypes.includes("schema_count_changed"));
  assert.ok(changeTypes.includes("internal_links_changed"));
});

test("classifies status and noindex changes as critical", () => {
  const changes = compareSnapshots(
    {
      id: "current",
      pageId: "page_1",
      crawlRunId: "crawl_2",
      statusCode: 500,
      title: "Same title",
      metaDescription: "Same description",
      h1: "Same H1",
      canonical: "https://example.com/",
      robotsDirective: "noindex",
      metadataJson: {},
      page: { id: "page_1", domainId: "domain_1" },
    },
    {
      id: "previous",
      pageId: "page_1",
      crawlRunId: "crawl_1",
      statusCode: 200,
      title: "Same title",
      metaDescription: "Same description",
      h1: "Same H1",
      canonical: "https://example.com/",
      robotsDirective: "index,follow",
      metadataJson: {},
    },
  );

  const statusChange = changes.find(
    (change) => change.changeType === "status_code_changed",
  );
  const robotsChange = changes.find(
    (change) => change.changeType === "robots_directive_changed",
  );
  const indexabilityChange = changes.find(
    (change) => change.changeType === "indexability_changed_to_noindex",
  );

  assert.equal(statusChange?.severity, "CRITICAL");
  assert.equal(statusChange?.previousValue, "200");
  assert.equal(statusChange?.newValue, "500");
  assert.equal(robotsChange?.severity, "CRITICAL");
  assert.equal(indexabilityChange?.severity, "CRITICAL");
});

test("ignores whitespace-only value differences", () => {
  const changes = compareSnapshots(
    {
      id: "current",
      pageId: "page_1",
      crawlRunId: "crawl_2",
      statusCode: 200,
      title: " Same title ",
      metaDescription: "Same description",
      h1: "Same H1",
      canonical: "https://example.com/",
      robotsDirective: null,
      metadataJson: {
        schemaCount: 1,
        discoveredInternalLinks: [
          "https://example.com/a",
          "https://example.com/b",
        ],
      },
      page: { id: "page_1", domainId: "domain_1" },
    },
    {
      id: "previous",
      pageId: "page_1",
      crawlRunId: "crawl_1",
      statusCode: 200,
      title: "Same title",
      metaDescription: "Same description",
      h1: "Same H1",
      canonical: "https://example.com/",
      robotsDirective: null,
      metadataJson: {
        schemaCount: 1,
        discoveredInternalLinks: [
          "https://example.com/b",
          "https://example.com/a",
        ],
      },
    },
  );

  assert.equal(changes.length, 0);
});

test("detects robots.txt artifact changes", () => {
  const changes = compareCrawlArtifacts(
    {
      id: "robots_current",
      crawlRunId: "crawl_2",
      domainId: "domain_1",
      type: "ROBOTS_TXT",
      url: "https://example.com/robots.txt",
      statusCode: 200,
      contentHash: "hash_new",
      metadataJson: {
        disallowRules: ["/"],
        sitemapUrls: ["https://example.com/sitemap.xml"],
      },
    },
    {
      id: "robots_previous",
      crawlRunId: "crawl_1",
      domainId: "domain_1",
      type: "ROBOTS_TXT",
      url: "https://example.com/robots.txt",
      statusCode: 200,
      contentHash: "hash_old",
      metadataJson: {
        disallowRules: ["/private"],
        sitemapUrls: [],
      },
    },
  );

  const disallowChange = changes.find(
    (change) => change.changeType === "robots_txt_disallow_rules_changed",
  );

  assert.ok(
    changes.some(
      (change) => change.changeType === "robots_txt_content_changed",
    ),
  );
  assert.ok(
    changes.some(
      (change) => change.changeType === "robots_txt_sitemaps_changed",
    ),
  );
  assert.equal(disallowChange?.severity, "CRITICAL");
});

test("detects sitemap artifact changes", () => {
  const changes = compareCrawlArtifacts(
    {
      id: "sitemap_current",
      crawlRunId: "crawl_2",
      domainId: "domain_1",
      type: "SITEMAP",
      url: "https://example.com/sitemap.xml",
      statusCode: 500,
      contentHash: "hash_new",
      metadataJson: {
        urlCount: 0,
        urls: [],
      },
    },
    {
      id: "sitemap_previous",
      crawlRunId: "crawl_1",
      domainId: "domain_1",
      type: "SITEMAP",
      url: "https://example.com/sitemap.xml",
      statusCode: 200,
      contentHash: "hash_old",
      metadataJson: {
        urlCount: 2,
        urls: ["https://example.com/", "https://example.com/about"],
      },
    },
  );

  const statusChange = changes.find(
    (change) => change.changeType === "sitemap_status_changed",
  );
  const countChange = changes.find(
    (change) => change.changeType === "sitemap_url_count_changed",
  );

  assert.equal(statusChange?.severity, "CRITICAL");
  assert.equal(countChange?.severity, "CRITICAL");
  assert.ok(
    changes.some((change) => change.changeType === "sitemap_urls_changed"),
  );
});

test("detects template-level regressions across repeated page patterns", () => {
  const pairs = Array.from({ length: 4 }, (_, index) =>
    templatePair({
      id: `blog_${index}`,
      pageType: "blog",
      url: `https://example.com/blog/post-${index}`,
      previousSchemaCount: 1,
      currentSchemaCount: 0,
      previousRobotsDirective: "index,follow",
      currentRobotsDirective: "noindex",
    }),
  );

  const regressions = compareTemplateRegressions(pairs);
  const changeTypes = regressions.map((change) => change.changeType);
  const noindexRegression = regressions.find((change) =>
    change.changeType.endsWith(":indexability_changed_to_noindex"),
  );

  assert.ok(
    changeTypes.includes("template_regression:blog:schema_count_changed"),
  );
  assert.equal(noindexRegression?.severity, "CRITICAL");
  assert.equal(noindexRegression?.affectedPages, 4);
  assert.equal(noindexRegression?.templatePages, 4);
});

test("ignores isolated page changes when template threshold is not met", () => {
  const pairs = [
    templatePair({
      id: "product_1",
      pageType: "product",
      url: "https://example.com/products/one",
      previousTitle: "Old title",
      currentTitle: "New title",
    }),
    templatePair({
      id: "product_2",
      pageType: "product",
      url: "https://example.com/products/two",
    }),
    templatePair({
      id: "product_3",
      pageType: "product",
      url: "https://example.com/products/three",
    }),
  ];

  assert.equal(compareTemplateRegressions(pairs).length, 0);
});

function templatePair(input: {
  id: string;
  pageType: string | null;
  url: string;
  previousTitle?: string;
  currentTitle?: string;
  previousSchemaCount?: number;
  currentSchemaCount?: number;
  previousRobotsDirective?: string | null;
  currentRobotsDirective?: string | null;
}) {
  return {
    current: {
      id: `${input.id}_current`,
      pageId: input.id,
      crawlRunId: "crawl_2",
      statusCode: 200,
      title: input.currentTitle ?? "Same title",
      metaDescription: "Same description",
      h1: "Same H1",
      canonical: input.url,
      robotsDirective: input.currentRobotsDirective ?? null,
      metadataJson: {
        schemaCount: input.currentSchemaCount ?? 1,
        discoveredInternalLinks: [],
      },
      page: {
        id: input.id,
        domainId: "domain_1",
        pageType: input.pageType,
        url: input.url,
      },
    },
    previous: {
      id: `${input.id}_previous`,
      pageId: input.id,
      crawlRunId: "crawl_1",
      statusCode: 200,
      title: input.previousTitle ?? "Same title",
      metaDescription: "Same description",
      h1: "Same H1",
      canonical: input.url,
      robotsDirective: input.previousRobotsDirective ?? null,
      metadataJson: {
        schemaCount: input.previousSchemaCount ?? 1,
        discoveredInternalLinks: [],
      },
    },
  };
}

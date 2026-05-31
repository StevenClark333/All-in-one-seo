import assert from "node:assert/strict";
import test from "node:test";
import { hasPoorHeadingHierarchy, runRules } from "@/lib/seo-analyzer";

const prismaWithoutDuplicates = {
  pageSnapshot: {
    findFirst: async () => null,
  },
};

test("detects critical and warning page SEO rules", async () => {
  const issues = await runRules(prismaWithoutDuplicates as never, {
    id: "snapshot_1",
    pageId: "page_1",
    statusCode: 404,
    title: null,
    metaDescription: null,
    h1: null,
    canonical: null,
    robotsDirective: "noindex,nofollow",
    wordCount: 120,
    contentHash: "hash_1",
    metadataJson: {
      h1Count: 0,
      imageCount: 2,
      imagesMissingAlt: 1,
      schemaCount: 0,
      headings: [],
    },
    page: {
      id: "page_1",
      domainId: "domain_1",
      url: "https://example.com/",
      domain: {
        id: "domain_1",
        workspaceId: "workspace_1",
        clientId: "client_1",
      },
    },
  });

  const issueTypes = issues.map((issue) => issue.issueType);

  assert.ok(issueTypes.includes("page_4xx"));
  assert.ok(issueTypes.includes("missing_title"));
  assert.ok(issueTypes.includes("missing_meta_description"));
  assert.ok(issueTypes.includes("missing_h1"));
  assert.ok(issueTypes.includes("missing_canonical"));
  assert.ok(issueTypes.includes("page_noindex"));
  assert.ok(issueTypes.includes("thin_content"));
  assert.ok(issueTypes.includes("missing_image_alt"));
  assert.ok(issueTypes.includes("missing_schema"));
});

test("detects duplicate title and meta description rules", async () => {
  const prismaWithDuplicates = {
    pageSnapshot: {
      findFirst: async () => ({ id: "other_snapshot" }),
    },
  };

  const issues = await runRules(prismaWithDuplicates as never, {
    id: "snapshot_1",
    pageId: "page_1",
    statusCode: 200,
    title: "A Useful Service Page Title",
    metaDescription:
      "This is a useful meta description that is long enough for the rule check.",
    h1: "Useful Service",
    canonical: null,
    robotsDirective: null,
    wordCount: 600,
    contentHash: "hash_2",
    metadataJson: {
      h1Count: 1,
      imageCount: 0,
      imagesMissingAlt: 0,
      schemaCount: 1,
      headings: [{ level: 1, text: "Useful Service" }],
    },
    page: {
      id: "page_1",
      domainId: "domain_1",
      url: "https://example.com/service",
      domain: {
        id: "domain_1",
        workspaceId: "workspace_1",
        clientId: null,
      },
    },
  });

  const issueTypes = issues.map((issue) => issue.issueType);

  assert.ok(issueTypes.includes("duplicate_title"));
  assert.ok(issueTypes.includes("duplicate_meta_description"));
  assert.ok(issueTypes.includes("duplicate_content_cluster"));
});

test("detects redirect, hreflang, pagination, and ecommerce rules", async () => {
  const issues = await runRules(prismaWithoutDuplicates as never, {
    id: "snapshot_1",
    pageId: "page_1",
    statusCode: 200,
    title: "Product Page With Enough Title Text",
    metaDescription:
      "This is a useful meta description that is long enough for the rule check.",
    h1: "Product",
    canonical: null,
    robotsDirective: null,
    wordCount: 800,
    contentHash: "hash_3",
    metadataJson: {
      h1Count: 1,
      headings: [{ level: 1, text: "Product" }],
      hreflangCount: 2,
      imageCount: 0,
      imagesMissingAlt: 0,
      invalidHreflangCount: 1,
      paginationLinkCount: 0,
      redirectChainLength: 3,
      schemaCount: 1,
      schemaTypes: ["BreadcrumbList"],
    },
    page: {
      id: "page_1",
      domainId: "domain_1",
      url: "https://example.com/products/widget?page=2",
      domain: {
        id: "domain_1",
        workspaceId: "workspace_1",
        clientId: null,
      },
    },
  });

  const issueTypes = issues.map((issue) => issue.issueType);

  assert.ok(issueTypes.includes("redirect_chain"));
  assert.ok(issueTypes.includes("invalid_hreflang"));
  assert.ok(issueTypes.includes("missing_pagination_links"));
  assert.ok(issueTypes.includes("product_schema_missing"));
});

test("detects poor heading hierarchy", () => {
  assert.equal(
    hasPoorHeadingHierarchy([
      { level: 1, text: "Main" },
      { level: 3, text: "Skipped H2" },
    ]),
    true,
  );
  assert.equal(
    hasPoorHeadingHierarchy([
      { level: 1, text: "Main" },
      { level: 2, text: "Section" },
      { level: 3, text: "Detail" },
    ]),
    false,
  );
});

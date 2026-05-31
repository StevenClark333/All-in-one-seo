import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateGscPageImportance,
  findMatchingGscSite,
  parseSearchAnalyticsRows,
  readGscSites,
} from "@/lib/google-search-console";

test("reads imported Google Search Console sites from integration config", () => {
  const sites = readGscSites({
    sites: [
      {
        siteUrl: "sc-domain:example.com",
        permissionLevel: "siteOwner",
      },
      {
        siteUrl: "",
        permissionLevel: "siteRestrictedUser",
      },
    ],
  });

  assert.deepEqual(sites, [
    {
      siteUrl: "sc-domain:example.com",
      permissionLevel: "siteOwner",
    },
  ]);
});

test("matches URL-prefix and domain Search Console properties to domains", () => {
  assert.equal(
    findMatchingGscSite("example.com", [
      { siteUrl: "https://www.example.com/", permissionLevel: "siteOwner" },
    ])?.siteUrl,
    "https://www.example.com/",
  );
  assert.equal(
    findMatchingGscSite("example.com", [
      { siteUrl: "sc-domain:example.com", permissionLevel: "siteOwner" },
    ])?.siteUrl,
    "sc-domain:example.com",
  );
});

test("parses Google Search Console search analytics rows", () => {
  const rows = parseSearchAnalyticsRows({
    rows: [
      {
        keys: [
          "2026-05-28",
          "https://example.com/pricing",
          "seo pricing",
          "usa",
          "DESKTOP",
        ],
        clicks: 12.2,
        impressions: 100.7,
        ctr: 0.12,
        position: 4.8,
      },
      {
        keys: ["bad-date", "https://example.com/"],
      },
    ],
  });

  assert.equal(rows.length, 1);
  assert.equal(rows[0].pageUrl, "https://example.com/pricing");
  assert.equal(rows[0].query, "seo pricing");
  assert.equal(rows[0].clicks, 12);
  assert.equal(rows[0].impressions, 101);
  assert.equal(rows[0].ctr, 0.12);
  assert.equal(rows[0].position, 4.8);
});

test("calculates page importance from Google Search Console demand", () => {
  assert.equal(
    calculateGscPageImportance({ clicks: 50, impressions: 10 }),
    "CRITICAL",
  );
  assert.equal(
    calculateGscPageImportance({ clicks: 5, impressions: 1000 }),
    "CRITICAL",
  );
  assert.equal(
    calculateGscPageImportance({ clicks: 10, impressions: 50 }),
    "IMPORTANT",
  );
  assert.equal(
    calculateGscPageImportance({ clicks: 1, impressions: 20 }),
    "NORMAL",
  );
});

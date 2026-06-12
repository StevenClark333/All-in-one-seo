import assert from "node:assert/strict";
import test from "node:test";
import {
  buildKeywordContentGaps,
  buildCompetitorContentGaps,
  buildKeywordOpportunities,
  classifyKeywordIntent,
  groupKeywordIntents,
  rowsToSearchGroups,
  summarizeRankTracking,
} from "@/lib/product-seo-groups";
import type { SearchMetricRow } from "@/lib/search-performance";

const date = new Date("2026-05-28T00:00:00.000Z");

test("classifies common keyword intent patterns", () => {
  assert.equal(classifyKeywordIntent("seo audit pricing"), "transactional");
  assert.equal(classifyKeywordIntent("semrush vs ahrefs"), "comparison");
  assert.equal(classifyKeywordIntent("best seo audit tool"), "commercial");
  assert.equal(classifyKeywordIntent("how to fix canonical tags"), "informational");
  assert.equal(classifyKeywordIntent("seo agency near me"), "local");
  assert.equal(classifyKeywordIntent("all in one seo ops"), "brand");
});

test("builds keyword opportunities from high-demand low-ctr query groups", () => {
  const groups = rowsToSearchGroups([
    buildRow({
      clicks: 1,
      impressions: 1000,
      position: 8,
      query: "best seo audit tool",
    }),
    buildRow({
      clicks: 90,
      impressions: 100,
      position: 1,
      query: "brand login",
    }),
  ]);

  const opportunities = buildKeywordOpportunities(groups);

  assert.equal(opportunities[0].key, "best seo audit tool");
  assert.equal(opportunities[0].intent, "commercial");
  assert.equal(
    opportunities[0].reason,
    "Close enough to improve with focused content and helpful page links.",
  );
  assert.ok(opportunities[0].opportunityScore > 20);
  assert.doesNotMatch(opportunities[0].reason, /internal links/i);
});

test("detects content gaps for visible queries with weak clicks or rankings", () => {
  const groups = rowsToSearchGroups([
    buildRow({
      clicks: 0,
      impressions: 250,
      position: 6,
      query: "technical seo checklist",
    }),
  ]);

  const gaps = buildKeywordContentGaps(groups);

  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].reason, "Visible query has no clicks yet.");
});

test("groups keyword demand by intent", () => {
  const groups = rowsToSearchGroups([
    buildRow({ impressions: 100, query: "seo pricing" }),
    buildRow({ impressions: 50, query: "how to improve seo" }),
  ]);

  const intents = groupKeywordIntents(groups);

  assert.equal(intents[0].intent, "transactional");
  assert.equal(intents[0].impressions, 100);
  assert.equal(intents[1].intent, "informational");
});

test("summarizes latest owned rank positions", () => {
  const summary = summarizeRankTracking([
    {
      rankings: [
        { competitorDomain: null, position: 2 },
        { competitorDomain: null, position: 5 },
      ],
    },
    {
      rankings: [
        { competitorDomain: null, position: 8 },
        { competitorDomain: null, position: 6 },
      ],
    },
    { rankings: [{ competitorDomain: "competitor.com", position: 1 }] },
  ]);

  assert.equal(summary.keywords, 3);
  assert.equal(summary.improved, 1);
  assert.equal(summary.worsened, 1);
  assert.equal(summary.topThree, 1);
  assert.equal(summary.topTen, 2);
  assert.equal(summary.averagePosition, 5);
});

test("builds competitor content gaps when competitors outrank owned pages", () => {
  const gaps = buildCompetitorContentGaps([
    {
      keyword: "seo audit software",
      metrics: [{ searchVolume: 1000 }],
      rankings: [
        { competitorDomain: null, position: 12 },
        { competitorDomain: "competitor.com", position: 3 },
      ],
    },
  ]);

  assert.equal(gaps.length, 1);
  assert.equal(gaps[0].competitorDomain, "competitor.com");
  assert.equal(gaps[0].ownedPosition, 12);
  assert.equal(
    gaps[0].reason,
    "Competitor is ahead for this watched search term.",
  );
  assert.ok(gaps[0].priority > 0);
});

function buildRow(
  overrides: Partial<SearchMetricRow> = {},
): SearchMetricRow {
  return {
    clicks: 0,
    country: "usa",
    date,
    device: "DESKTOP",
    impressions: 1,
    pageUrl: "https://example.com/",
    position: 1,
    query: "brand",
    ...overrides,
  };
}

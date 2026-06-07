import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateVisibility,
  groupSearchMetrics,
  summarizeSearchMetrics,
  type SearchMetricRow,
} from "@/lib/search-performance";

const date = new Date("2026-05-28T00:00:00.000Z");

test("summarizes Search Console metrics with weighted position and ctr", () => {
  const rows: SearchMetricRow[] = [
    buildRow({ clicks: 10, impressions: 100, position: 2 }),
    buildRow({ clicks: 5, impressions: 50, position: 8 }),
  ];

  const summary = summarizeSearchMetrics(rows);

  assert.equal(summary.clicks, 15);
  assert.equal(summary.impressions, 150);
  assert.equal(summary.ctr, 0.1);
  assert.equal(summary.avgPosition, 4);
});

test("calculates impression-weighted visibility", () => {
  assert.equal(
    calculateVisibility([
      buildRow({ impressions: 100, position: 1 }),
      buildRow({ impressions: 100, position: 51 }),
    ]),
    75,
  );
});

test("groups query movement against the previous period", () => {
  const previous = groupSearchMetrics(
    [buildRow({ position: 8, query: "seo audit" })],
    "query",
    [],
  );
  const current = groupSearchMetrics(
    [buildRow({ position: 4, query: "seo audit" })],
    "query",
    previous,
  );

  assert.equal(current[0].key, "seo audit");
  assert.equal(current[0].previousPosition, 8);
  assert.equal(current[0].positionChange, 4);
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

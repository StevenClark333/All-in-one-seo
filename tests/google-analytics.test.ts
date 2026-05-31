import assert from "node:assert/strict";
import test from "node:test";
import {
  parseAnalyticsReportRows,
  readGaProperties,
} from "@/lib/google-analytics";

test("reads imported Google Analytics properties from integration config", () => {
  const properties = readGaProperties({
    properties: [
      {
        account: "accounts/123",
        accountDisplayName: "Agency",
        displayName: "Client GA4",
        property: "properties/456",
      },
      {
        displayName: "Broken",
        property: "",
      },
    ],
  });

  assert.deepEqual(properties, [
    {
      account: "accounts/123",
      accountDisplayName: "Agency",
      displayName: "Client GA4",
      property: "properties/456",
    },
  ]);
});

test("parses Google Analytics Data API report rows", () => {
  const rows = parseAnalyticsReportRows({
    rows: [
      {
        dimensionValues: [{ value: "20260529" }, { value: "/pricing" }],
        metricValues: [
          { value: "42" },
          { value: "30" },
          { value: "90" },
          { value: "3.5" },
        ],
      },
      {
        dimensionValues: [{ value: "bad-date" }, { value: "/broken" }],
      },
    ],
  });

  assert.equal(rows.length, 1);
  assert.equal(rows[0].pagePath, "/pricing");
  assert.equal(rows[0].sessions, 42);
  assert.equal(rows[0].activeUsers, 30);
  assert.equal(rows[0].screenPageViews, 90);
  assert.equal(rows[0].conversions, 3.5);
});

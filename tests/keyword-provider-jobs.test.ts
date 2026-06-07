import assert from "node:assert/strict";
import test from "node:test";
import { isKeywordImportDue } from "@/lib/keyword-provider-jobs";

const now = new Date("2026-06-04T12:00:00.000Z");

test("detects due keyword imports by tracking frequency", () => {
  assert.equal(isKeywordImportDue("DAILY", daysAgo(2), now), true);
  assert.equal(isKeywordImportDue("DAILY", hoursAgo(6), now), false);
  assert.equal(isKeywordImportDue("WEEKLY", daysAgo(8), now), true);
  assert.equal(isKeywordImportDue("WEEKLY", daysAgo(3), now), false);
  assert.equal(isKeywordImportDue("MONTHLY", daysAgo(30), now), true);
  assert.equal(isKeywordImportDue("MONTHLY", daysAgo(10), now), false);
});

test("treats keywords with no prior import as due", () => {
  assert.equal(isKeywordImportDue("WEEKLY", null, now), true);
});

function daysAgo(days: number) {
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
}

function hoursAgo(hours: number) {
  return new Date(now.getTime() - hours * 60 * 60 * 1000);
}

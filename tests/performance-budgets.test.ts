import assert from "node:assert/strict";
import test from "node:test";
import {
  calculatePercentile,
  isWithinBudget,
  performanceBudgets,
} from "@/lib/performance-budgets";

test("defines production performance budgets", () => {
  assert.equal(performanceBudgets.apiHealthP95Ms, 300);
  assert.equal(performanceBudgets.ingestionP95Ms, 250);
  assert.equal(performanceBudgets.crawlerHomepageTimeoutMs, 15_000);
});

test("checks whether timings are inside budget", () => {
  assert.equal(isWithinBudget(249, 250), true);
  assert.equal(isWithinBudget(251, 250), false);
  assert.equal(isWithinBudget(Number.NaN, 250), false);
});

test("calculates percentile timings", () => {
  assert.equal(calculatePercentile([40, 10, 30, 20], 50), 20);
  assert.equal(calculatePercentile([40, 10, 30, 20], 95), 40);
  assert.equal(calculatePercentile([], 95), 0);
});

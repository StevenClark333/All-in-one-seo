import assert from "node:assert/strict";
import test from "node:test";
import { calculateScoreFromMetrics } from "@/lib/site-scoring";

test("calculates perfect score when no penalties apply", () => {
  const { score, reasonsJson } = calculateScoreFromMetrics({
    criticalIssues: 0,
    warningIssues: 0,
    suggestionIssues: 0,
    pageCount: 1,
    criticalPageIssues: 0,
    linkCount: 0,
    brokenLinks: 0,
  });

  assert.equal(score, 100);
  assert.equal(reasonsJson.penalties.noPages, 0);
});

test("applies weighted penalties and explains score", () => {
  const { score, reasonsJson } = calculateScoreFromMetrics({
    criticalIssues: 2,
    warningIssues: 3,
    suggestionIssues: 4,
    pageCount: 3,
    criticalPageIssues: 1,
    linkCount: 0,
    brokenLinks: 2,
  });

  assert.equal(score, 30);
  assert.deepEqual(reasonsJson.penalties, {
    critical: 24,
    criticalPages: 5,
    warning: 15,
    suggestion: 8,
    brokenLinks: 8,
    noPages: 0,
    noLinks: 10,
  });
});

test("clamps score between 0 and 100", () => {
  const { score } = calculateScoreFromMetrics({
    criticalIssues: 20,
    warningIssues: 20,
    suggestionIssues: 20,
    pageCount: 0,
    criticalPageIssues: 10,
    linkCount: 0,
    brokenLinks: 20,
  });

  assert.equal(score, 0);
});

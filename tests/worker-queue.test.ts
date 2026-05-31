import assert from "node:assert/strict";
import test from "node:test";
import {
  calculateNextAttemptAt,
  defaultWorkerMaxAttempts,
  getFailureStatus,
  workerConcurrencyLimits,
} from "@/lib/worker-queue";

test("defines production worker concurrency limits", () => {
  assert.equal(workerConcurrencyLimits.CRAWL_RUN, 3);
  assert.equal(workerConcurrencyLimits.DOMAIN_VERIFICATION, 10);
  assert.equal(workerConcurrencyLimits.SCHEDULED_REPORT, 4);
  assert.equal(workerConcurrencyLimits.AI_RECOMMENDATION, 2);
});

test("calculates bounded exponential retry delays", () => {
  const now = new Date("2026-05-30T00:00:00.000Z");

  assert.equal(
    calculateNextAttemptAt(1, now).toISOString(),
    "2026-05-30T00:00:30.000Z",
  );
  assert.equal(
    calculateNextAttemptAt(5, now).toISOString(),
    "2026-05-30T00:05:00.000Z",
  );
  assert.equal(
    calculateNextAttemptAt(10, now).toISOString(),
    "2026-05-30T00:05:00.000Z",
  );
});

test("moves exhausted jobs to the dead-letter state", () => {
  assert.equal(
    getFailureStatus({ attempts: 1, maxAttempts: defaultWorkerMaxAttempts }),
    "FAILED",
  );
  assert.equal(
    getFailureStatus({
      attempts: defaultWorkerMaxAttempts,
      maxAttempts: defaultWorkerMaxAttempts,
    }),
    "DEAD_LETTER",
  );
});

import assert from "node:assert/strict";
import test from "node:test";
import { buildLinkFixLifecycleSteps } from "@/lib/link-fixes";

test("builds lifecycle steps for an exported link fix", () => {
  const approvedAt = new Date("2026-06-03T10:00:00.000Z");
  const exportedAt = new Date("2026-06-03T10:05:00.000Z");

  const steps = buildLinkFixLifecycleSteps({
    approvedAt,
    exportedAt,
    status: "EXPORTED",
    verificationStatus: "NOT_CHECKED",
  });

  assert.deepEqual(
    steps.map((step) => [step.label, step.status, step.timestamp]),
    [
      ["Approved", "COMPLETE", approvedAt],
      ["Sent to workflow", "COMPLETE", exportedAt],
      ["Applied on site", "CURRENT", null],
      ["Crawl verification", "PENDING", null],
    ],
  );
});

test("marks verification as current after a fix is applied", () => {
  const appliedAt = new Date("2026-06-03T11:00:00.000Z");
  const steps = buildLinkFixLifecycleSteps({
    appliedAt,
    approvedAt: new Date("2026-06-03T10:00:00.000Z"),
    exportedAt: new Date("2026-06-03T10:05:00.000Z"),
    status: "APPLIED",
    verificationMessage: "Waiting for the next crawl to verify this fix.",
    verificationStatus: "PENDING",
  });

  assert.deepEqual(
    steps.map((step) => [step.label, step.status]),
    [
      ["Approved", "COMPLETE"],
      ["Sent to workflow", "COMPLETE"],
      ["Applied on site", "COMPLETE"],
      ["Crawl verification", "CURRENT"],
    ],
  );
  assert.equal(
    steps.at(-1)?.detail,
    "Waiting for the next crawl to verify this fix.",
  );
  assert.equal(steps.at(-2)?.timestamp, appliedAt);
});

test("shows a compact dismissed lifecycle", () => {
  const dismissedAt = new Date("2026-06-03T12:00:00.000Z");

  assert.deepEqual(
    buildLinkFixLifecycleSteps({
      dismissedAt,
      status: "DISMISSED",
      verificationStatus: "NOT_CHECKED",
    }),
    [
      {
        detail: "This suggestion was dismissed and is no longer active.",
        label: "Dismissed",
        status: "COMPLETE",
        timestamp: dismissedAt,
      },
    ],
  );
});

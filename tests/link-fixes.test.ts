import assert from "node:assert/strict";
import test from "node:test";
import {
  buildLinkFixLifecycleSteps,
  buildManualInstructions,
} from "@/lib/link-fixes";

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
      ["Website check", "PENDING", null],
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
    verificationMessage:
      "Waiting for the next website check to review this update.",
    verificationStatus: "PENDING",
  });

  assert.deepEqual(
    steps.map((step) => [step.label, step.status]),
    [
      ["Approved", "COMPLETE"],
      ["Sent to workflow", "COMPLETE"],
      ["Applied on site", "COMPLETE"],
      ["Website check", "CURRENT"],
    ],
  );
  assert.equal(
    steps.at(-1)?.detail,
    "Waiting for the next website check to review this update.",
  );
  assert.equal(steps.at(-2)?.timestamp, appliedAt);
});

test("uses soft manual link update instructions", () => {
  const replaceInstruction = buildManualInstructions({
    anchorText: "Services",
    brokenUrl: "https://example.com/old-services",
    sourceUrl: "https://example.com/about",
    suggestedUrl: "https://example.com/services",
  });
  const addInstruction = buildManualInstructions({
    sourceUrl: "https://example.com/about",
    suggestedUrl: "https://example.com/services",
  });

  assert.equal(
    replaceInstruction,
    'On https://example.com/about, replace the link that stopped working, https://example.com/old-services, with https://example.com/services. Use the visible link words "Services" if they fit naturally. Run a fresh website check after publishing to confirm the update.',
  );
  assert.equal(
    addInstruction,
    'On https://example.com/about, add a helpful page link to https://example.com/services. Use the visible link words "Learn more" if they fit naturally. Run a fresh website check after publishing to confirm the update.',
  );
  assert.doesNotMatch(
    [replaceInstruction, addInstruction].join(" "),
    /internal link|anchor text|Recrawl|recrawl|link graph|source page/i,
  );
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

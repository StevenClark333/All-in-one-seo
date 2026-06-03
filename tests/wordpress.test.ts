import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWordPressOnboardingSteps,
  generateWordPressReceiverKey,
  isWordPressReceiverReady,
  normalizeWordPressReceiverUrl,
  readWordPressReceiverConfig,
} from "@/lib/wordpress";

test("normalizes WordPress receiver URLs", async () => {
  assert.equal(
    await normalizeWordPressReceiverUrl(
      "https://example.com/wp-json/all-in-one-seo/v1/link-fixes#ignored",
    ),
    "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
  );
});

test("rejects insecure WordPress receiver URLs", async () => {
  await assert.rejects(() =>
    normalizeWordPressReceiverUrl(
      "http://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    ),
  );
});

test("generates strong WordPress receiver keys", () => {
  const first = generateWordPressReceiverKey();
  const second = generateWordPressReceiverKey();

  assert.match(first, /^aioseo_wp_[A-Za-z0-9_-]{32}$/);
  assert.notEqual(first, second);
});

test("reads WordPress receiver test status from config", () => {
  assert.deepEqual(
    readWordPressReceiverConfig({
      connectedAt: "2026-06-03T00:00:00.000Z",
      lastTestAt: "2026-06-03T00:05:00.000Z",
      lastTestMessage: "WordPress receiver accepted the test payload.",
      lastTestStatus: "PASSED",
      lastTestStatusCode: 200,
      receiverKey: "aioseo_wp_example",
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    }),
    {
      connectedAt: "2026-06-03T00:00:00.000Z",
      lastTestAt: "2026-06-03T00:05:00.000Z",
      lastTestMessage: "WordPress receiver accepted the test payload.",
      lastTestStatus: "PASSED",
      lastTestStatusCode: 200,
      receiverKey: "aioseo_wp_example",
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    },
  );
});

test("builds WordPress onboarding checklist states", () => {
  const completeSteps = buildWordPressOnboardingSteps({
    lastTestStatus: "PASSED",
    receiverKey: "aioseo_wp_example",
    receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    scriptStatus: "DETECTED",
  });

  assert.deepEqual(
    completeSteps.map((step) => [step.label, step.status]),
    [
      ["Plugin package ready", "READY"],
      ["Monitoring script detected", "COMPLETE"],
      ["Receiver endpoint saved", "COMPLETE"],
      ["Receiver key generated", "COMPLETE"],
      ["Receiver tested", "COMPLETE"],
      ["Fix delivery enabled", "COMPLETE"],
    ],
  );

  const pendingSteps = buildWordPressOnboardingSteps({
    lastTestMessage: "Unauthorized",
    lastTestStatus: "FAILED",
    receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    scriptStatus: "NOT_INSTALLED",
  });

  assert.equal(
    pendingSteps.find((step) => step.label === "Monitoring script detected")
      ?.status,
    "NEEDS_ACTION",
  );
  assert.equal(
    pendingSteps.find((step) => step.label === "Receiver tested")?.status,
    "WARNING",
  );
  assert.equal(
    pendingSteps.find((step) => step.label === "Fix delivery enabled")?.status,
    "NEEDS_ACTION",
  );
});

test("requires a passed receiver test before WordPress fix delivery", () => {
  assert.equal(
    isWordPressReceiverReady({
      lastTestStatus: "PASSED",
      receiverKey: "aioseo_wp_example",
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    }),
    true,
  );
  assert.equal(
    isWordPressReceiverReady({
      lastTestStatus: "FAILED",
      receiverKey: "aioseo_wp_example",
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    }),
    false,
  );
  assert.equal(
    isWordPressReceiverReady({
      lastTestStatus: "PASSED",
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    }),
    false,
  );
});

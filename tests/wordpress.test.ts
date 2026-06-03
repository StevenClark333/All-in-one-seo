import assert from "node:assert/strict";
import test from "node:test";
import {
  buildWordPressInstallValues,
  buildWordPressOnboardingSteps,
  generateWordPressReceiverKey,
  getWordPressReceiverReadinessMessage,
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

test("builds copy-friendly WordPress install values", () => {
  assert.deepEqual(
    buildWordPressInstallValues({
      appUrl: "https://allinoneseo.example.com/",
      domain: "client.example.com",
      receiverKey: "aioseo_wp_example",
      receiverUrl:
        "https://client.example.com/wp-json/all-in-one-seo/v1/link-fixes",
      siteId: "site_123",
    }),
    [
      {
        help: "Paste this into the App URL field in the WordPress plugin settings.",
        label: "App URL",
        value: "https://allinoneseo.example.com",
      },
      {
        help: "Paste this into the Site ID field so the plugin reports data for the correct portal domain.",
        label: "Site ID",
        value: "site_123",
      },
      {
        help: "Paste this into the Receiver API key field in WordPress. Save the receiver endpoint first if no key exists yet.",
        label: "Receiver API key",
        value: "aioseo_wp_example",
      },
      {
        help: "Save this receiver endpoint in the portal, then test it before sending fixes from Fix Center.",
        label: "Receiver endpoint",
        value:
          "https://client.example.com/wp-json/all-in-one-seo/v1/link-fixes",
      },
      {
        help: "The WordPress plugin calls this portal endpoint after a fix is applied or reviewed.",
        label: "Callback URL",
        value:
          "https://allinoneseo.example.com/api/integrations/wordpress/link-fix-status",
      },
    ],
  );

  assert.equal(
    buildWordPressInstallValues({
      appUrl: "https://allinoneseo.example.com",
      domain: "client.example.com",
      siteId: "site_123",
    }).find((item) => item.label === "Receiver endpoint")?.value,
    "https://client.example.com/wp-json/all-in-one-seo/v1/link-fixes",
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

test("explains why a WordPress receiver is unavailable", () => {
  assert.equal(
    getWordPressReceiverReadinessMessage({}),
    "Save the WordPress receiver endpoint in Integrations.",
  );
  assert.equal(
    getWordPressReceiverReadinessMessage({
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    }),
    "Generate or save the WordPress receiver API key in Integrations.",
  );
  assert.equal(
    getWordPressReceiverReadinessMessage({
      lastTestStatus: "FAILED",
      receiverKey: "aioseo_wp_example",
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    }),
    "The latest WordPress receiver test failed. Fix the endpoint or key, then test again.",
  );
  assert.equal(
    getWordPressReceiverReadinessMessage({
      lastTestStatus: "PASSED",
      receiverKey: "aioseo_wp_example",
      receiverUrl: "https://example.com/wp-json/all-in-one-seo/v1/link-fixes",
    }),
    "WordPress receiver is ready.",
  );
});

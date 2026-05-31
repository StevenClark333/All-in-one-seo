import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeSlackWebhookUrl,
  readSlackIntegrationConfig,
} from "@/lib/slack";

test("normalizes Slack incoming webhook URLs", () => {
  assert.equal(
    normalizeSlackWebhookUrl(
      "https://hooks.slack.com/services/T000/B000/SECRET?x=1#frag",
    ),
    "https://hooks.slack.com/services/T000/B000/SECRET",
  );
});

test("allows Slack Gov incoming webhook URLs", () => {
  assert.equal(
    normalizeSlackWebhookUrl("https://hooks.slack-gov.com/services/T/B/S"),
    "https://hooks.slack-gov.com/services/T/B/S",
  );
});

test("rejects non-Slack webhook URLs", () => {
  assert.throws(() => normalizeSlackWebhookUrl("https://example.com/hook"));
  assert.throws(() =>
    normalizeSlackWebhookUrl("http://hooks.slack.com/services/T/B/S"),
  );
});

test("reads Slack integration config", () => {
  assert.deepEqual(
    readSlackIntegrationConfig({
      channelName: "#seo-alerts",
      connectedAt: "2026-05-30T00:00:00.000Z",
      webhookUrl: "https://hooks.slack.com/services/T/B/S",
    }),
    {
      channelName: "#seo-alerts",
      connectedAt: "2026-05-30T00:00:00.000Z",
      webhookUrl: "https://hooks.slack.com/services/T/B/S",
    },
  );
});

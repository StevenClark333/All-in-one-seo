import assert from "node:assert/strict";
import test from "node:test";
import {
  buildAutomationWebhookPayload,
  normalizeAutomationWebhookUrl,
  readAutomationIntegrationConfig,
} from "@/lib/automation-integrations";

test("normalizes Zapier webhook URLs", async () => {
  assert.equal(
    await normalizeAutomationWebhookUrl({
      provider: "ZAPIER",
      webhookUrl: "https://hooks.zapier.com/hooks/catch/123/abc#frag",
    }),
    "https://hooks.zapier.com/hooks/catch/123/abc",
  );
});

test("normalizes Make webhook URLs", async () => {
  assert.equal(
    await normalizeAutomationWebhookUrl({
      provider: "MAKE",
      webhookUrl: "https://hook.us1.make.com/abc123",
    }),
    "https://hook.us1.make.com/abc123",
  );
});

test("rejects mismatched automation webhook providers", async () => {
  await assert.rejects(() =>
    normalizeAutomationWebhookUrl({
      provider: "ZAPIER",
      webhookUrl: "https://hook.us1.make.com/abc123",
    }),
  );
});

test("reads automation integration config", () => {
  assert.deepEqual(
    readAutomationIntegrationConfig({
      label: "Client handoff",
      webhookUrl: "https://hooks.zapier.com/hooks/catch/123/abc",
    }),
    {
      label: "Client handoff",
      webhookUrl: "https://hooks.zapier.com/hooks/catch/123/abc",
    },
  );
});

test("builds automation webhook payloads", () => {
  assert.deepEqual(
    buildAutomationWebhookPayload({
      eventType: "issue.created",
      provider: "MAKE",
      resourceId: "issue_123",
      summary: "New critical SEO issue",
    }),
    {
      eventType: "issue.created",
      provider: "MAKE",
      resourceId: "issue_123",
      source: "all-in-one-seo",
      summary: "New critical SEO issue",
    },
  );
});

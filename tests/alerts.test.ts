import assert from "node:assert/strict";
import test from "node:test";
import {
  buildSlackAlertPayload,
  buildTeamsAlertPayload,
  buildWebhookAlertPayload,
  getRuleDomainIds,
  isSafeAlertDestinationUrl,
  severitiesAtOrAbove,
} from "@/lib/alerts";

test("selects alert severities at or above threshold", () => {
  assert.deepEqual(severitiesAtOrAbove("CRITICAL"), ["CRITICAL"]);
  assert.deepEqual(severitiesAtOrAbove("WARNING"), ["CRITICAL", "WARNING"]);
  assert.deepEqual(severitiesAtOrAbove("SUGGESTION"), [
    "CRITICAL",
    "WARNING",
    "SUGGESTION",
  ]);
});

test("resolves alert rule domain scope", () => {
  assert.deepEqual(getRuleDomainIds({ domainId: "domain_1", client: null }), [
    "domain_1",
  ]);
  assert.deepEqual(
    getRuleDomainIds({
      domainId: null,
      client: { domains: [{ id: "domain_1" }, { id: "domain_2" }] },
    }),
    ["domain_1", "domain_2"],
  );
  assert.equal(getRuleDomainIds({ domainId: null, client: null }), null);
});

test("builds Slack, Teams, and webhook alert payloads", () => {
  assert.deepEqual(buildSlackAlertPayload("Title changed", "Fix it"), {
    text: "*Title changed*\nFix it",
  });
  assert.deepEqual(buildTeamsAlertPayload("Title changed", "Fix it"), {
    "@type": "MessageCard",
    "@context": "https://schema.org/extensions",
    summary: "Title changed",
    title: "Title changed",
    text: "Fix it",
  });
  assert.deepEqual(buildWebhookAlertPayload("Title changed", "Fix it"), {
    subject: "Title changed",
    body: "Fix it",
    source: "all-in-one-seo",
  });
});

test("rejects unsafe alert destination URLs before delivery", async () => {
  assert.equal(await isSafeAlertDestinationUrl("not-a-url"), false);
  assert.equal(await isSafeAlertDestinationUrl("http://example.com"), false);
});

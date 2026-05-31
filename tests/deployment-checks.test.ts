import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  isSuccessfulDeploymentStatus,
  parseNetlifyDeploymentPayload,
  parseVercelDeploymentPayload,
  readDeploymentIntegrationConfig,
  verifyNetlifyWebhookSignature,
  verifyVercelWebhookSignature,
} from "@/lib/deployment-checks";

test("parses Vercel deployment webhook payloads", () => {
  const summary = parseVercelDeploymentPayload({
    type: "deployment.ready",
    payload: {
      deployment: {
        id: "dpl_123",
        meta: { githubCommitSha: "abc123" },
        name: "marketing-site",
        url: "marketing-site.vercel.app",
      },
      project: { id: "prj_123" },
      target: "production",
    },
  });

  assert.deepEqual(summary, {
    commitSha: "abc123",
    deploymentId: "dpl_123",
    deploymentUrl: "https://marketing-site.vercel.app",
    eventType: "deployment.ready",
    projectId: "prj_123",
    projectName: "marketing-site",
    status: "READY",
    target: "production",
  });
});

test("verifies Vercel webhook signatures", () => {
  const rawBody = JSON.stringify({ type: "deployment.ready" });
  const secret = "vercel-secret";
  const signature = createHmac("sha1", secret).update(rawBody).digest("hex");

  assert.equal(
    verifyVercelWebhookSignature({ rawBody, secret, signature }),
    true,
  );
  assert.equal(
    verifyVercelWebhookSignature({
      rawBody,
      secret,
      signature: "sha1=bad",
    }),
    false,
  );
});

test("parses Netlify deployment webhook payloads", () => {
  const summary = parseNetlifyDeploymentPayload({
    commit_ref: "abc123",
    context: "production",
    deploy_id: "deploy_123",
    deploy_url: "https://example.netlify.app",
    name: "marketing-site",
    site_id: "site_123",
    state: "ready",
  });

  assert.deepEqual(summary, {
    commitSha: "abc123",
    deploymentId: "deploy_123",
    deploymentUrl: "https://example.netlify.app",
    eventType: "ready",
    projectId: "site_123",
    projectName: "marketing-site",
    status: "SUCCEEDED",
    target: "production",
  });
});

test("verifies Netlify JWS webhook signatures", () => {
  const rawBody = JSON.stringify({ state: "ready" });
  const secret = "netlify-secret";
  const encodedHeader = Buffer.from(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  ).toString("base64url");
  const encodedPayload = Buffer.from(rawBody).toString("base64url");
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const encodedSignature = createHmac("sha256", secret)
    .update(signingInput)
    .digest("base64url");
  const signature = `${signingInput}.${encodedSignature}`;

  assert.equal(
    verifyNetlifyWebhookSignature({ rawBody, secret, signature }),
    true,
  );
  assert.equal(
    verifyNetlifyWebhookSignature({
      rawBody,
      secret,
      signature: `${signingInput}.bad`,
    }),
    false,
  );
});

test("reads deployment integration config", () => {
  assert.deepEqual(
    readDeploymentIntegrationConfig({
      projectId: "prj_123",
      projectName: "Marketing",
      webhookSecret: "secret",
    }),
    {
      projectId: "prj_123",
      projectName: "Marketing",
      siteId: "",
      siteName: "",
      webhookSecret: "secret",
    },
  );
});

test("detects successful deployment statuses", () => {
  assert.equal(isSuccessfulDeploymentStatus("READY"), true);
  assert.equal(isSuccessfulDeploymentStatus("SUCCEEDED"), true);
  assert.equal(isSuccessfulDeploymentStatus("FAILED"), false);
});

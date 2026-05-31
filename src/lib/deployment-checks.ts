import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { Prisma } from "@prisma/client";
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
} from "@/lib/integration-secrets";
import { getPrisma } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

export type DeploymentCheckSummary = {
  commitSha: string;
  deploymentId: string;
  deploymentUrl: string;
  eventType: string;
  projectId: string;
  projectName: string;
  status: string;
  target: string;
};

export async function upsertVercelIntegration({
  domainId,
  projectId,
  projectName,
  webhookSecret,
}: {
  domainId?: string;
  projectId: string;
  projectName?: string;
  webhookSecret?: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Vercel.");
  }

  const secret = webhookSecret?.trim() || randomBytes(24).toString("base64url");
  const configJson = encryptIntegrationConfig({
    connectedAt: new Date().toISOString(),
    projectId: projectId.trim(),
    projectName: projectName?.trim() || projectId.trim(),
    webhookSecret: secret,
  } satisfies Prisma.InputJsonObject);
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider: "VERCEL",
      configJson: { path: ["projectId"], equals: projectId.trim() },
    },
  });

  if (existingIntegration) {
    return getPrisma().integration.update({
      where: { id: existingIntegration.id },
      data: { configJson, domainId, status: "CONNECTED" },
    });
  }

  return getPrisma().integration.create({
    data: {
      workspaceId: workspace.id,
      domainId,
      provider: "VERCEL",
      status: "CONNECTED",
      configJson,
    },
  });
}

export async function upsertNetlifyIntegration({
  domainId,
  siteId,
  siteName,
  webhookSecret,
}: {
  domainId?: string;
  siteId: string;
  siteName?: string;
  webhookSecret?: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Netlify.");
  }

  const secret = webhookSecret?.trim() || randomBytes(24).toString("base64url");
  const configJson = encryptIntegrationConfig({
    connectedAt: new Date().toISOString(),
    siteId: siteId.trim(),
    siteName: siteName?.trim() || siteId.trim(),
    webhookSecret: secret,
  } satisfies Prisma.InputJsonObject);
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider: "NETLIFY",
      configJson: { path: ["siteId"], equals: siteId.trim() },
    },
  });

  if (existingIntegration) {
    return getPrisma().integration.update({
      where: { id: existingIntegration.id },
      data: { configJson, domainId, status: "CONNECTED" },
    });
  }

  return getPrisma().integration.create({
    data: {
      workspaceId: workspace.id,
      domainId,
      provider: "NETLIFY",
      status: "CONNECTED",
      configJson,
    },
  });
}

export async function ingestVercelDeploymentWebhook({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string | null;
}) {
  const payload = parseJsonObject(rawBody);
  const summary = parseVercelDeploymentPayload(payload);

  if (!summary.projectId) {
    throw new DeploymentWebhookError("Vercel project ID is missing.", 400);
  }

  const integration = await getPrisma().integration.findFirst({
    where: {
      provider: "VERCEL",
      configJson: { path: ["projectId"], equals: summary.projectId },
    },
    include: { domain: true },
  });

  if (!integration) {
    throw new DeploymentWebhookError("Vercel integration was not found.", 404);
  }

  const config = readDeploymentIntegrationConfig(integration.configJson);

  if (
    !config.webhookSecret ||
    !verifyVercelWebhookSignature({
      rawBody,
      secret: config.webhookSecret,
      signature,
    })
  ) {
    throw new DeploymentWebhookError(
      "Vercel webhook signature is invalid.",
      401,
    );
  }

  const check = await getPrisma().deploymentCheck.create({
    data: {
      workspaceId: integration.workspaceId,
      domainId: integration.domainId,
      provider: "VERCEL",
      eventType: summary.eventType,
      status: summary.status,
      projectId: summary.projectId,
      projectName: summary.projectName,
      deploymentId: summary.deploymentId,
      deploymentUrl: summary.deploymentUrl,
      target: summary.target,
      commitSha: summary.commitSha,
      payloadJson: payload as Prisma.InputJsonObject,
    },
  });

  if (
    integration.domainId &&
    summary.target === "production" &&
    isSuccessfulDeploymentStatus(summary.status)
  ) {
    await getPrisma().crawlRun.create({
      data: {
        domainId: integration.domainId,
        status: "QUEUED",
        trigger: "SYSTEM",
      },
    });
  }

  return check;
}

export async function ingestNetlifyDeploymentWebhook({
  rawBody,
  signature,
}: {
  rawBody: string;
  signature: string | null;
}) {
  const payload = parseJsonObject(rawBody);
  const summary = parseNetlifyDeploymentPayload(payload);

  if (!summary.projectId) {
    throw new DeploymentWebhookError("Netlify site ID is missing.", 400);
  }

  const integration = await getPrisma().integration.findFirst({
    where: {
      provider: "NETLIFY",
      configJson: { path: ["siteId"], equals: summary.projectId },
    },
    include: { domain: true },
  });

  if (!integration) {
    throw new DeploymentWebhookError("Netlify integration was not found.", 404);
  }

  const config = readDeploymentIntegrationConfig(integration.configJson);

  if (
    !config.webhookSecret ||
    !verifyNetlifyWebhookSignature({
      rawBody,
      secret: config.webhookSecret,
      signature,
    })
  ) {
    throw new DeploymentWebhookError(
      "Netlify webhook signature is invalid.",
      401,
    );
  }

  const check = await getPrisma().deploymentCheck.create({
    data: {
      workspaceId: integration.workspaceId,
      domainId: integration.domainId,
      provider: "NETLIFY",
      eventType: summary.eventType,
      status: summary.status,
      projectId: summary.projectId,
      projectName: summary.projectName,
      deploymentId: summary.deploymentId,
      deploymentUrl: summary.deploymentUrl,
      target: summary.target,
      commitSha: summary.commitSha,
      payloadJson: payload as Prisma.InputJsonObject,
    },
  });

  if (
    integration.domainId &&
    summary.target === "production" &&
    isSuccessfulDeploymentStatus(summary.status)
  ) {
    await getPrisma().crawlRun.create({
      data: {
        domainId: integration.domainId,
        status: "QUEUED",
        trigger: "SYSTEM",
      },
    });
  }

  return check;
}

export function parseVercelDeploymentPayload(
  payload: Record<string, unknown>,
): DeploymentCheckSummary {
  const nestedPayload = readObject(payload.payload) ?? payload;
  const deployment = readObject(nestedPayload.deployment);
  const project = readObject(nestedPayload.project);
  const links = readObject(nestedPayload.links);
  const meta = readObject(deployment?.meta);
  const eventType = readString(payload.type) || readString(payload.event) || "";

  return {
    commitSha:
      readString(meta?.githubCommitSha) ||
      readString(meta?.gitlabCommitSha) ||
      readString(meta?.bitbucketCommitSha),
    deploymentId: readString(deployment?.id),
    deploymentUrl: normalizeDeploymentUrl(readString(deployment?.url)),
    eventType,
    projectId: readString(project?.id) || readString(nestedPayload.projectId),
    projectName:
      readString(deployment?.name) ||
      readString(project?.name) ||
      readString(links?.project),
    status: statusFromVercelEvent(eventType),
    target: readString(nestedPayload.target),
  };
}

export function parseNetlifyDeploymentPayload(
  payload: Record<string, unknown>,
): DeploymentCheckSummary {
  const site = readObject(payload.site);
  const deploy = readObject(payload.deploy);
  const eventType =
    readString(payload.event) ||
    readString(payload.event_type) ||
    readString(payload.state) ||
    "deploy";
  const state = readString(payload.state) || readString(deploy?.state);
  const deployUrl =
    readString(payload.deploy_url) ||
    readString(payload.ssl_url) ||
    readString(payload.url) ||
    readString(deploy?.deploy_url) ||
    readString(deploy?.ssl_url) ||
    readString(deploy?.url);

  return {
    commitSha:
      readString(payload.commit_ref) ||
      readString(payload.commit_sha) ||
      readString(deploy?.commit_ref),
    deploymentId: readString(payload.deploy_id) || readString(payload.id),
    deploymentUrl: normalizeDeploymentUrl(deployUrl),
    eventType,
    projectId:
      readString(payload.site_id) ||
      readString(site?.id) ||
      readString(payload.site_name),
    projectName:
      readString(payload.name) ||
      readString(site?.name) ||
      readString(payload.site_name),
    status: statusFromNetlifyState(state || eventType),
    target:
      readString(payload.context) ||
      readString(payload.branch) ||
      readString(deploy?.context),
  };
}

export function verifyVercelWebhookSignature({
  rawBody,
  secret,
  signature,
}: {
  rawBody: string;
  secret: string;
  signature: string | null;
}) {
  if (!signature) {
    return false;
  }

  const normalizedSignature = signature.replace(/^sha1=/, "");
  const expected = createHmac("sha1", secret).update(rawBody).digest("hex");
  const receivedBuffer = Buffer.from(normalizedSignature, "hex");
  const expectedBuffer = Buffer.from(expected, "hex");

  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function verifyNetlifyWebhookSignature({
  rawBody,
  secret,
  signature,
}: {
  rawBody: string;
  secret: string;
  signature: string | null;
}) {
  if (!signature) {
    return false;
  }

  const parts = signature.split(".");

  if (parts.length !== 3) {
    return false;
  }

  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const header = parseBase64UrlJson(encodedHeader);
  const alg = readString(header.alg);
  const algorithm =
    alg === "HS512" ? "sha512" : alg === "HS384" ? "sha384" : "sha256";
  const signingInput = `${encodedHeader}.${encodedPayload}`;
  const expected = createHmac(algorithm, secret)
    .update(signingInput)
    .digest("base64url");
  const decodedPayload = Buffer.from(encodedPayload, "base64url").toString(
    "utf8",
  );
  const receivedBuffer = Buffer.from(encodedSignature);
  const expectedBuffer = Buffer.from(expected);

  return (
    decodedPayload === rawBody &&
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function readDeploymentIntegrationConfig(value: unknown) {
  const decryptedValue = decryptIntegrationConfig(value as Prisma.JsonValue);

  if (
    !decryptedValue ||
    typeof decryptedValue !== "object" ||
    Array.isArray(decryptedValue)
  ) {
    return { projectId: "", projectName: "", webhookSecret: "" };
  }

  const config = decryptedValue as Record<string, unknown>;

  return {
    projectId: readString(config.projectId),
    projectName: readString(config.projectName),
    siteId: readString(config.siteId),
    siteName: readString(config.siteName),
    webhookSecret: readString(config.webhookSecret),
  };
}

export function isSuccessfulDeploymentStatus(status: string) {
  return status === "READY" || status === "SUCCEEDED";
}

function parseJsonObject(value: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    throw new DeploymentWebhookError("Webhook payload must be JSON.", 400);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new DeploymentWebhookError("Webhook payload must be an object.", 400);
  }

  return parsed as Record<string, unknown>;
}

function statusFromVercelEvent(eventType: string) {
  const statusMap: Record<string, string> = {
    "deployment.canceled": "CANCELED",
    "deployment.created": "CREATED",
    "deployment.error": "FAILED",
    "deployment.ready": "READY",
    "deployment.succeeded": "SUCCEEDED",
    "deployment.rollback": "ROLLBACK",
    "deployment-canceled": "CANCELED",
    "deployment-created": "CREATED",
    "deployment-error": "FAILED",
    "deployment-ready": "READY",
  };

  return statusMap[eventType] ?? "RECEIVED";
}

function statusFromNetlifyState(state: string) {
  const normalized = state.toLowerCase();

  if (
    ["ready", "current", "published", "deploy-succeeded"].includes(normalized)
  ) {
    return "SUCCEEDED";
  }

  if (["error", "failed", "deploy-failed"].includes(normalized)) {
    return "FAILED";
  }

  if (["building", "enqueued", "processing"].includes(normalized)) {
    return "BUILDING";
  }

  return normalized ? normalized.toUpperCase() : "RECEIVED";
}

function parseBase64UrlJson(value: string) {
  try {
    const decoded = Buffer.from(value, "base64url").toString("utf8");
    const parsed = JSON.parse(decoded) as unknown;

    return readObject(parsed) ?? {};
  } catch {
    return {};
  }
}

function normalizeDeploymentUrl(value: string) {
  if (!value) {
    return "";
  }

  return value.startsWith("http") ? value : `https://${value}`;
}

function readObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export class DeploymentWebhookError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

import { createHash, randomBytes } from "node:crypto";
import { Prisma } from "@prisma/client";
import { assertCrawlUrlIsSafe } from "@/lib/crawler-security";
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
} from "@/lib/integration-secrets";
import { getPrisma } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

export async function upsertWordPressReceiver({
  domainId,
  receiverKey,
  receiverUrl,
}: {
  domainId: string;
  receiverKey?: string;
  receiverUrl: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting WordPress.");
  }

  const domain = await getPrisma().domain.findFirst({
    where: {
      id: domainId,
      platform: "WORDPRESS",
      workspaceId: workspace.id,
    },
  });

  if (!domain) {
    throw new Error("WordPress domain was not found.");
  }

  const normalizedReceiverUrl =
    await normalizeWordPressReceiverUrl(receiverUrl);
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      domainId,
      provider: "WORDPRESS_RECEIVER",
      workspaceId: workspace.id,
    },
  });
  const existingConfig = readWordPressReceiverConfig(
    existingIntegration?.configJson,
  );
  const nextReceiverKey =
    receiverKey || existingConfig.receiverKey || generateWordPressReceiverKey();

  const configJson = encryptIntegrationConfig({
    connectedAt: existingConfig.connectedAt || new Date().toISOString(),
    lastTestAt: existingConfig.lastTestAt,
    lastTestMessage: existingConfig.lastTestMessage,
    lastTestStatus: existingConfig.lastTestStatus,
    lastTestStatusCode: existingConfig.lastTestStatusCode,
    receiverKey: nextReceiverKey,
    receiverUrl: normalizedReceiverUrl,
    receiverUrlHash: hashValue(normalizedReceiverUrl),
    updatedAt: new Date().toISOString(),
  } satisfies Prisma.InputJsonObject);

  if (existingIntegration) {
    return getPrisma().integration.update({
      where: { id: existingIntegration.id },
      data: { configJson, status: "CONNECTED" },
    });
  }

  return getPrisma().integration.create({
    data: {
      configJson,
      domainId,
      provider: "WORDPRESS_RECEIVER",
      status: "CONNECTED",
      workspaceId: workspace.id,
    },
  });
}

export async function testWordPressReceiver(integrationId: string) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before testing WordPress.");
  }

  const integration = await getPrisma().integration.findFirst({
    where: {
      id: integrationId,
      provider: "WORDPRESS_RECEIVER",
      workspaceId: workspace.id,
    },
    include: { domain: true },
  });

  if (!integration) {
    throw new Error("WordPress receiver was not found.");
  }

  const config = readWordPressReceiverConfig(integration.configJson);

  if (!config.receiverUrl || !config.receiverKey) {
    throw new Error("Save the receiver endpoint and key before testing.");
  }

  const testedAt = new Date();
  let status = "FAILED";
  let statusCode = 0;
  let message = "Receiver test failed before the request completed.";

  try {
    const response = await fetch(config.receiverUrl, {
      body: JSON.stringify({
        domain: integration.domain?.domain ?? "",
        eventType: "wordpress.receiver.test",
        sentAt: testedAt.toISOString(),
        source: "all-in-one-seo",
      }),
      headers: {
        "Content-Type": "application/json",
        "X-All-In-One-SEO-Key": config.receiverKey,
      },
      method: "POST",
    });

    statusCode = response.status;
    status = response.ok ? "PASSED" : "FAILED";
    message = response.ok
      ? "WordPress receiver accepted the test payload."
      : `WordPress receiver returned HTTP ${response.status}.`;
  } catch (error) {
    message =
      error instanceof Error
        ? `Receiver test failed: ${error.message}`
        : "Receiver test failed with an unknown error.";
  }

  const configJson = encryptIntegrationConfig({
    connectedAt: config.connectedAt,
    lastTestAt: testedAt.toISOString(),
    lastTestMessage: message,
    lastTestStatus: status,
    lastTestStatusCode: statusCode,
    receiverKey: config.receiverKey,
    receiverUrl: config.receiverUrl,
    receiverUrlHash: hashValue(config.receiverUrl),
    updatedAt: new Date().toISOString(),
  } satisfies Prisma.InputJsonObject);

  await getPrisma().integration.update({
    where: { id: integration.id },
    data: {
      configJson,
      status: status === "PASSED" ? "CONNECTED" : "ERROR",
    },
  });

  return { message, status, statusCode };
}

export async function normalizeWordPressReceiverUrl(receiverUrl: string) {
  let url: URL;

  try {
    url = new URL(receiverUrl.trim());
  } catch {
    throw new Error("Enter a valid WordPress receiver URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("WordPress receiver URLs must use HTTPS.");
  }

  await assertCrawlUrlIsSafe(url.toString());

  url.hash = "";

  return url.toString();
}

export function readWordPressReceiverConfig(value: unknown) {
  const decryptedValue = decryptIntegrationConfig(value as Prisma.JsonValue);

  if (
    !decryptedValue ||
    typeof decryptedValue !== "object" ||
    Array.isArray(decryptedValue)
  ) {
    return {
      connectedAt: "",
      lastTestAt: "",
      lastTestMessage: "",
      lastTestStatus: "",
      lastTestStatusCode: 0,
      receiverKey: "",
      receiverUrl: "",
    };
  }

  const config = decryptedValue as Record<string, unknown>;

  return {
    connectedAt: readString(config.connectedAt),
    lastTestAt: readString(config.lastTestAt),
    lastTestMessage: readString(config.lastTestMessage),
    lastTestStatus: readString(config.lastTestStatus),
    lastTestStatusCode: readNumber(config.lastTestStatusCode),
    receiverKey: readString(config.receiverKey),
    receiverUrl: readString(config.receiverUrl),
  };
}

export function generateWordPressReceiverKey() {
  return `aioseo_wp_${randomBytes(24).toString("base64url")}`;
}

export type WordPressOnboardingStepStatus =
  | "COMPLETE"
  | "NEEDS_ACTION"
  | "READY"
  | "WARNING";

export function buildWordPressOnboardingSteps(input: {
  lastTestMessage?: string;
  lastTestStatus?: string;
  receiverKey?: string;
  receiverUrl?: string;
  scriptStatus: string;
}) {
  const hasReceiverEndpoint = Boolean(input.receiverUrl);
  const hasReceiverKey = Boolean(input.receiverKey);
  const receiverTestPassed = input.lastTestStatus === "PASSED";
  const receiverTestFailed = input.lastTestStatus === "FAILED";
  const scriptDetected = input.scriptStatus === "DETECTED";
  const fixesEnabled = hasReceiverEndpoint && hasReceiverKey && receiverTestPassed;

  return [
    {
      detail: "Download the ZIP from this panel and upload it in WordPress admin.",
      label: "Plugin package ready",
      status: "READY" as const,
    },
    {
      detail: scriptDetected
        ? "The monitoring script has reported from this WordPress site."
        : "Install and activate the plugin, then visit a public page.",
      label: "Monitoring script detected",
      status: scriptDetected ? ("COMPLETE" as const) : ("NEEDS_ACTION" as const),
    },
    {
      detail: hasReceiverEndpoint
        ? "A WordPress receiver endpoint is saved for this domain."
        : "Paste the plugin receiver endpoint and save it here.",
      label: "Receiver endpoint saved",
      status: hasReceiverEndpoint
        ? ("COMPLETE" as const)
        : ("NEEDS_ACTION" as const),
    },
    {
      detail: hasReceiverKey
        ? "A receiver API key is available for the WordPress plugin."
        : "Save the receiver endpoint to generate a key.",
      label: "Receiver key generated",
      status: hasReceiverKey ? ("COMPLETE" as const) : ("NEEDS_ACTION" as const),
    },
    {
      detail: receiverTestPassed
        ? "The WordPress site accepted a signed test event."
        : receiverTestFailed
          ? input.lastTestMessage || "The latest receiver test failed."
          : "Run Test receiver after saving endpoint and key.",
      label: "Receiver tested",
      status: receiverTestPassed
        ? ("COMPLETE" as const)
        : receiverTestFailed
          ? ("WARNING" as const)
          : ("NEEDS_ACTION" as const),
    },
    {
      detail: fixesEnabled
        ? "Fix Center can send approved link fixes to this WordPress site."
        : "Complete endpoint, key, and receiver test before sending fixes.",
      label: "Fix delivery enabled",
      status: fixesEnabled ? ("COMPLETE" as const) : ("NEEDS_ACTION" as const),
    },
  ];
}

export function isWordPressReceiverReady(config: {
  lastTestStatus?: string;
  receiverKey?: string;
  receiverUrl?: string;
}) {
  return Boolean(
    config.receiverUrl &&
      config.receiverKey &&
      config.lastTestStatus === "PASSED",
  );
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

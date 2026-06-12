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
    throw new Error(
      "Save the WordPress update link and connection key before testing.",
    );
  }

  const testedAt = new Date();
  let status = "FAILED";
  let statusCode = 0;
  let message = "Connection test needs another try before sending fixes.";

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
      ? "WordPress connection accepted the test message."
      : `WordPress connection needs another try. HTTP ${response.status}.`;
  } catch (error) {
    message =
      error instanceof Error
        ? `Connection test needs another try: ${error.message}`
        : "Connection test needs another try.";
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
        ? "A WordPress update link is saved for this website."
        : "Paste the plugin update link and save it here.",
      label: "Update link saved",
      status: hasReceiverEndpoint
        ? ("COMPLETE" as const)
        : ("NEEDS_ACTION" as const),
    },
    {
      detail: hasReceiverKey
        ? "A connection key is available for the WordPress plugin."
        : "Save the update link to generate a connection key.",
      label: "Connection key generated",
      status: hasReceiverKey ? ("COMPLETE" as const) : ("NEEDS_ACTION" as const),
    },
    {
      detail: receiverTestPassed
        ? "The WordPress site accepted a signed test event."
        : receiverTestFailed
          ? formatWordPressConnectionMessage(input.lastTestMessage)
          : "Run Test connection after saving the update link and connection key.",
      label: "Connection tested",
      status: receiverTestPassed
        ? ("COMPLETE" as const)
        : receiverTestFailed
          ? ("WARNING" as const)
          : ("NEEDS_ACTION" as const),
    },
    {
      detail: fixesEnabled
        ? "Fixes can send approved link updates to this WordPress site."
        : "Complete the update link, connection key, and connection test before sending fixes.",
      label: "Fix delivery enabled",
      status: fixesEnabled ? ("COMPLETE" as const) : ("NEEDS_ACTION" as const),
    },
  ];
}

export function buildWordPressInstallValues(input: {
  appUrl: string;
  domain: string;
  receiverKey?: string;
  receiverUrl?: string;
  siteId: string;
}) {
  const normalizedAppUrl = input.appUrl.replace(/\/+$/, "");
  const suggestedReceiverUrl = `https://${input.domain}/wp-json/all-in-one-seo/v1/link-fixes`;

  return [
    {
      help: "Paste this into the App URL field in the WordPress plugin settings.",
      label: "App URL",
      value: normalizedAppUrl,
    },
    {
      help: "Paste this into the Site ID field so the plugin reports data for the correct portal domain.",
      label: "Site ID",
      value: input.siteId,
    },
    {
      help: "Paste this into the connection key field in WordPress. Save the update link first if no key exists yet.",
      label: "Connection key",
      value: input.receiverKey || "Generated after update link is saved",
    },
    {
      help: "Save this WordPress update link in the portal, then test it before sending fixes.",
      label: "WordPress update link",
      value: input.receiverUrl || suggestedReceiverUrl,
    },
    {
      help: "The WordPress plugin uses this return link after a fix is applied or reviewed.",
      label: "Return link",
      value: `${normalizedAppUrl}/api/integrations/wordpress/link-fix-status`,
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

export function getWordPressReceiverReadinessMessage(config: {
  lastTestMessage?: string;
  lastTestStatus?: string;
  receiverKey?: string;
  receiverUrl?: string;
}) {
  if (!config.receiverUrl) {
    return "Save the WordPress update link in Connections.";
  }

  if (!config.receiverKey) {
    return "Generate or save the WordPress connection key in Connections.";
  }

  if (config.lastTestStatus === "FAILED") {
    return formatWordPressConnectionMessage(config.lastTestMessage);
  }

  if (config.lastTestStatus !== "PASSED") {
    return "Run Test connection in Connections before sending fixes to WordPress.";
  }

  return "WordPress connection is ready.";
}

export function formatWordPressConnectionMessage(message?: string) {
  if (!message) {
    return "The latest WordPress connection needs another try. Check the update link or connection key, then test again.";
  }

  return message
    .replaceAll("Receiver test failed", "Connection test needs another try")
    .replaceAll("receiver test failed", "connection test needs another try")
    .replaceAll(
      "The latest WordPress receiver test failed. Fix the endpoint or key, then test again.",
      "The latest WordPress connection needs another try. Check the update link or connection key, then test again.",
    )
    .replaceAll("WordPress receiver returned", "WordPress connection returned")
    .replaceAll("WordPress receiver accepted", "WordPress connection accepted")
    .replaceAll("receiver endpoint", "WordPress update link")
    .replaceAll("Receiver endpoint", "WordPress update link")
    .replaceAll("receiver API key", "connection key")
    .replaceAll("Receiver API key", "Connection key")
    .replaceAll("receiver", "connection")
    .replaceAll("endpoint", "update link")
    .replaceAll("failed", "needs another try")
    .replaceAll("Failed", "Needs another try");
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

import { Prisma } from "@prisma/client";
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
} from "@/lib/integration-secrets";
import { getPrisma } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

export type SlackIntegrationConfig = {
  channelName: string;
  connectedAt: string;
  webhookUrl: string;
};

export async function upsertSlackIntegration({
  channelName,
  webhookUrl,
}: {
  channelName?: string;
  webhookUrl: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Slack.");
  }

  const normalizedWebhookUrl = normalizeSlackWebhookUrl(webhookUrl);
  const configJson = encryptIntegrationConfig({
    channelName: channelName?.trim() || "Slack alerts",
    connectedAt: new Date().toISOString(),
    webhookUrl: normalizedWebhookUrl,
  } satisfies Prisma.InputJsonObject);
  const existingIntegration = await getPrisma().integration.findFirst({
    where: { workspaceId: workspace.id, provider: "SLACK", domainId: null },
  });

  if (existingIntegration) {
    return getPrisma().integration.update({
      where: { id: existingIntegration.id },
      data: { configJson, status: "CONNECTED" },
    });
  }

  return getPrisma().integration.create({
    data: {
      workspaceId: workspace.id,
      provider: "SLACK",
      status: "CONNECTED",
      configJson,
    },
  });
}

export async function getWorkspaceSlackWebhookUrl(workspaceId: string) {
  const integration = await getPrisma().integration.findFirst({
    where: { workspaceId, provider: "SLACK", status: "CONNECTED" },
  });

  return readSlackIntegrationConfig(integration?.configJson).webhookUrl || null;
}

export function normalizeSlackWebhookUrl(value: string) {
  let url: URL;

  try {
    url = new URL(value.trim());
  } catch {
    throw new Error("Enter a valid Slack incoming webhook URL.");
  }

  const allowedHosts = new Set(["hooks.slack.com", "hooks.slack-gov.com"]);

  if (
    url.protocol !== "https:" ||
    !allowedHosts.has(url.hostname.toLowerCase()) ||
    !url.pathname.startsWith("/services/")
  ) {
    throw new Error("Enter a valid Slack incoming webhook URL.");
  }

  url.search = "";
  url.hash = "";

  return url.toString();
}

export function readSlackIntegrationConfig(
  value: unknown,
): SlackIntegrationConfig {
  const decryptedValue = decryptIntegrationConfig(value as Prisma.JsonValue);

  if (
    !decryptedValue ||
    typeof decryptedValue !== "object" ||
    Array.isArray(decryptedValue)
  ) {
    return { channelName: "", connectedAt: "", webhookUrl: "" };
  }

  const config = decryptedValue as Record<string, unknown>;

  return {
    channelName: readString(config.channelName),
    connectedAt: readString(config.connectedAt),
    webhookUrl: readString(config.webhookUrl),
  };
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

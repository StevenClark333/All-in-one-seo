import { createHash } from "crypto";
import { Prisma } from "@prisma/client";
import { assertCrawlUrlIsSafe } from "@/lib/crawler-security";
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
} from "@/lib/integration-secrets";
import { getPrisma } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

export type AutomationProvider = "MAKE" | "ZAPIER";

export async function upsertAutomationIntegration({
  label,
  provider,
  webhookUrl,
}: {
  label?: string;
  provider: AutomationProvider;
  webhookUrl: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting automation.");
  }

  const normalizedWebhookUrl = await normalizeAutomationWebhookUrl({
    provider,
    webhookUrl,
  });
  const configJson = encryptIntegrationConfig({
    connectedAt: new Date().toISOString(),
    label: label?.trim() || `${provider} workflow`,
    webhookUrlHash: hashValue(normalizedWebhookUrl),
    webhookUrl: normalizedWebhookUrl,
  } satisfies Prisma.InputJsonObject);
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider,
      configJson: {
        path: ["webhookUrlHash"],
        equals: hashValue(normalizedWebhookUrl),
      },
    },
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
      provider,
      status: "CONNECTED",
      configJson,
    },
  });
}

export async function normalizeAutomationWebhookUrl({
  provider,
  webhookUrl,
}: {
  provider: AutomationProvider;
  webhookUrl: string;
}) {
  let url: URL;

  try {
    url = new URL(webhookUrl.trim());
  } catch {
    throw new Error("Enter a valid automation webhook URL.");
  }

  if (url.protocol !== "https:") {
    throw new Error("Automation webhooks must use HTTPS.");
  }

  const hostname = url.hostname.toLowerCase();
  const isZapier = hostname === "hooks.zapier.com" || hostname === "zapier.com";
  const isMake = hostname === "make.com" || hostname.endsWith(".make.com");

  if (provider === "ZAPIER" && !isZapier) {
    throw new Error("Enter a Zapier Catch Hook URL.");
  }

  if (provider === "MAKE" && !isMake) {
    throw new Error("Enter a Make custom webhook URL.");
  }

  await assertCrawlUrlIsSafe(url.toString());

  url.hash = "";

  return url.toString();
}

export function readAutomationIntegrationConfig(value: unknown) {
  const decryptedValue = decryptIntegrationConfig(value as Prisma.JsonValue);

  if (
    !decryptedValue ||
    typeof decryptedValue !== "object" ||
    Array.isArray(decryptedValue)
  ) {
    return { label: "", webhookUrl: "" };
  }

  const config = decryptedValue as Record<string, unknown>;

  return {
    label: readString(config.label),
    webhookUrl: readString(config.webhookUrl),
  };
}

export function buildAutomationWebhookPayload({
  eventType,
  provider,
  resourceId,
  summary,
}: {
  eventType: string;
  provider: AutomationProvider;
  resourceId: string;
  summary: string;
}) {
  return {
    eventType,
    provider,
    resourceId,
    source: "all-in-one-seo",
    summary,
  };
}

export function buildLinkFixAutomationPayload({
  anchorText,
  brokenUrl,
  domain,
  fixId,
  manualInstructions,
  provider,
  sourceUrl,
  status,
  suggestedUrl,
}: {
  anchorText?: string | null;
  brokenUrl?: string | null;
  domain: string;
  fixId: string;
  manualInstructions: string;
  provider: AutomationProvider;
  sourceUrl: string;
  status: string;
  suggestedUrl: string;
}) {
  return {
    eventType: "link_fix.ready",
    provider,
    resourceId: fixId,
    source: "all-in-one-seo",
    summary: brokenUrl
      ? `Replace broken internal link on ${domain}`
      : `Add internal link on ${domain}`,
    linkFix: {
      anchorText: anchorText ?? "",
      brokenUrl: brokenUrl ?? "",
      domain,
      manualInstructions,
      sourceUrl,
      status,
      suggestedUrl,
    },
  };
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

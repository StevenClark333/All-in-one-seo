import { createHash } from "node:crypto";
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
  const nextReceiverKey = receiverKey || existingConfig.receiverKey;

  if (!nextReceiverKey) {
    throw new Error("Receiver API key is required.");
  }

  const configJson = encryptIntegrationConfig({
    connectedAt: existingConfig.connectedAt || new Date().toISOString(),
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
    return { connectedAt: "", receiverKey: "", receiverUrl: "" };
  }

  const config = decryptedValue as Record<string, unknown>;

  return {
    connectedAt: readString(config.connectedAt),
    receiverKey: readString(config.receiverKey),
    receiverUrl: readString(config.receiverUrl),
  };
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
} from "@/lib/integration-secrets";
import { getPrisma } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

const stateCookieName = "shopify_oauth_state";
const domainCookieName = "shopify_domain_id";
const defaultScopes = "read_content,read_products";

type ShopifyTokenResponse = {
  access_token: string;
  scope: string;
};

export function normalizeShopifyShop(value: string) {
  const trimmed = value.trim().toLowerCase();
  const withoutProtocol = trimmed.replace(/^https?:\/\//, "");
  const hostname = withoutProtocol.split("/")[0];

  if (!/^[a-z0-9][a-z0-9-]*\.myshopify\.com$/.test(hostname)) {
    throw new Error("Enter a valid myshopify.com store domain.");
  }

  return hostname;
}

export async function createShopifyAuthUrl({
  domainId,
  origin,
  shop,
}: {
  domainId?: string | null;
  origin: string;
  shop: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Shopify.");
  }

  const normalizedShop = normalizeShopifyShop(shop);
  const state = randomBytes(18).toString("base64url");
  const cookieStore = await cookies();

  cookieStore.set(stateCookieName, state, {
    httpOnly: true,
    maxAge: 600,
    path: "/",
    sameSite: "lax",
    secure: origin.startsWith("https://"),
  });

  if (domainId) {
    cookieStore.set(domainCookieName, domainId, {
      httpOnly: true,
      maxAge: 600,
      path: "/",
      sameSite: "lax",
      secure: origin.startsWith("https://"),
    });
  } else {
    cookieStore.delete(domainCookieName);
  }

  const url = new URL(`https://${normalizedShop}/admin/oauth/authorize`);
  url.searchParams.set("client_id", getShopifyApiKey());
  url.searchParams.set("scope", getShopifyScopes());
  url.searchParams.set("redirect_uri", getShopifyRedirectUri(origin));
  url.searchParams.set("state", state);

  return url.toString();
}

export async function completeShopifyOAuth({
  code,
  origin,
  query,
  shop,
  state,
}: {
  code: string;
  origin: string;
  query: URLSearchParams;
  shop: string;
  state: string;
}) {
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(stateCookieName)?.value;
  const domainId = cookieStore.get(domainCookieName)?.value ?? null;

  cookieStore.delete(stateCookieName);
  cookieStore.delete(domainCookieName);

  if (!expectedState || expectedState !== state) {
    throw new Error("Shopify OAuth state did not match.");
  }

  const normalizedShop = normalizeShopifyShop(shop);

  if (!verifyShopifyHmac(query, getShopifyApiSecret())) {
    throw new Error("Shopify OAuth HMAC did not match.");
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Shopify.");
  }

  const token = await exchangeShopifyOAuthCode({
    code,
    origin,
    shop: normalizedShop,
  });
  const configJson = encryptIntegrationConfig({
    connectedAt: new Date().toISOString(),
    scope: token.scope,
    shop: normalizedShop,
    token,
  } satisfies Prisma.InputJsonObject);
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider: "SHOPIFY",
      configJson: {
        path: ["shop"],
        equals: normalizedShop,
      },
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
      provider: "SHOPIFY",
      status: "CONNECTED",
      configJson,
    },
  });
}

export function verifyShopifyHmac(
  query: URLSearchParams,
  secret: string,
): boolean {
  const receivedHmac = query.get("hmac");

  if (!receivedHmac) {
    return false;
  }

  const message = Array.from(query.entries())
    .filter(([key]) => key !== "hmac" && key !== "signature")
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const digest = createHmac("sha256", secret).update(message).digest("hex");
  const received = Buffer.from(receivedHmac, "hex");
  const expected = Buffer.from(digest, "hex");

  return (
    received.length === expected.length && timingSafeEqual(received, expected)
  );
}

export function readShopifyShop(value: unknown) {
  const decryptedValue = decryptIntegrationConfig(value as Prisma.JsonValue);

  if (
    !decryptedValue ||
    typeof decryptedValue !== "object" ||
    Array.isArray(decryptedValue)
  ) {
    return "";
  }

  const shop = (decryptedValue as Record<string, unknown>).shop;

  return typeof shop === "string" ? shop : "";
}

async function exchangeShopifyOAuthCode({
  code,
  origin,
  shop,
}: {
  code: string;
  origin: string;
  shop: string;
}) {
  const response = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: getShopifyApiKey(),
      client_secret: getShopifyApiSecret(),
      code,
      redirect_uri: getShopifyRedirectUri(origin),
    }),
  });

  if (!response.ok) {
    throw new Error("Shopify token exchange failed.");
  }

  return (await response.json()) as ShopifyTokenResponse;
}

function getShopifyRedirectUri(origin: string) {
  return `${origin}/api/integrations/shopify/callback`;
}

function getShopifyApiKey() {
  const value = process.env.SHOPIFY_API_KEY;

  if (!value) {
    throw new Error("SHOPIFY_API_KEY is required to connect Shopify.");
  }

  return value;
}

function getShopifyApiSecret() {
  const value = process.env.SHOPIFY_API_SECRET;

  if (!value) {
    throw new Error("SHOPIFY_API_SECRET is required to connect Shopify.");
  }

  return value;
}

function getShopifyScopes() {
  return process.env.SHOPIFY_SCOPES || defaultScopes;
}

import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { Prisma } from "@prisma/client";
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
} from "@/lib/integration-secrets";
import { getPrisma } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

const webflowAuthorizeUrl = "https://webflow.com/oauth/authorize";
const webflowTokenUrl = "https://api.webflow.com/oauth/access_token";
const webflowApiBaseUrl = "https://api.webflow.com/v2";
const stateCookieName = "webflow_oauth_state";
const defaultScopes = "sites:read pages:read cms:read";

export type WebflowSite = {
  customDomains: Array<{ id: string; url: string }>;
  displayName: string;
  id: string;
  lastPublished: string | null;
  shortName: string;
  workspaceId: string;
};

type WebflowTokenResponse = {
  access_token: string;
  scope?: string;
  token_type?: string;
};

export async function createWebflowAuthUrl(origin: string) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Webflow.");
  }

  const state = randomBytes(18).toString("base64url");
  const cookieStore = await cookies();

  cookieStore.set(stateCookieName, state, {
    httpOnly: true,
    maxAge: 600,
    path: "/",
    sameSite: "lax",
    secure: origin.startsWith("https://"),
  });

  const url = new URL(webflowAuthorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", getWebflowClientId());
  url.searchParams.set("redirect_uri", getWebflowRedirectUri(origin));
  url.searchParams.set("scope", getWebflowScopes());
  url.searchParams.set("state", state);

  return url.toString();
}

export async function completeWebflowOAuth({
  code,
  origin,
  state,
}: {
  code: string;
  origin: string;
  state: string;
}) {
  const cookieStore = await cookies();
  const expectedState = cookieStore.get(stateCookieName)?.value;

  cookieStore.delete(stateCookieName);

  if (!expectedState || expectedState !== state) {
    throw new Error("Webflow OAuth state did not match.");
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Webflow.");
  }

  const token = await exchangeWebflowOAuthCode({ code, origin });
  const sites = await fetchWebflowSites(token.access_token);
  const configJson = encryptIntegrationConfig({
    connectedAt: new Date().toISOString(),
    scope: token.scope ?? getWebflowScopes(),
    sites,
    token,
  } satisfies Prisma.InputJsonObject);
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider: "WEBFLOW",
      domainId: null,
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
      provider: "WEBFLOW",
      status: "CONNECTED",
      configJson,
    },
  });
}

export async function mapWebflowSite({
  domainId,
  siteId,
}: {
  domainId: string;
  siteId: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before mapping Webflow.");
  }

  const connection = await getPrisma().integration.findFirst({
    where: { workspaceId: workspace.id, provider: "WEBFLOW", domainId: null },
  });

  if (!connection) {
    throw new Error("Connect Webflow before mapping a site.");
  }

  const site = readWebflowSites(connection.configJson).find(
    (item) => item.id === siteId,
  );

  if (!site) {
    throw new Error("Webflow site was not found on this connection.");
  }

  const configJson = {
    mappedAt: new Date().toISOString(),
    site,
    siteId,
  } satisfies Prisma.InputJsonObject;
  const existingIntegration = await getPrisma().integration.findFirst({
    where: { workspaceId: workspace.id, provider: "WEBFLOW_SITE", domainId },
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
      domainId,
      provider: "WEBFLOW_SITE",
      status: "CONNECTED",
      configJson,
    },
  });
}

export function readWebflowSites(value: unknown): WebflowSite[] {
  const decryptedValue = decryptIntegrationConfig(value as Prisma.JsonValue);

  if (
    !decryptedValue ||
    typeof decryptedValue !== "object" ||
    Array.isArray(decryptedValue)
  ) {
    return [];
  }

  const sites = (decryptedValue as Record<string, unknown>).sites;

  if (!Array.isArray(sites)) {
    return [];
  }

  return sites
    .map(parseWebflowSite)
    .filter((site): site is WebflowSite => site !== null);
}

export function parseWebflowSitesResponse(value: unknown): WebflowSite[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return [];
  }

  const sites = (value as Record<string, unknown>).sites;

  if (!Array.isArray(sites)) {
    return [];
  }

  return sites
    .map(parseWebflowSite)
    .filter((site): site is WebflowSite => site !== null);
}

export function findMatchingWebflowSite(domain: string, sites: WebflowSite[]) {
  const normalizedDomain = domain.toLowerCase();

  return sites.find((site) =>
    site.customDomains.some(
      (customDomain) => customDomain.url.toLowerCase() === normalizedDomain,
    ),
  );
}

async function exchangeWebflowOAuthCode({
  code,
  origin,
}: {
  code: string;
  origin: string;
}) {
  const response = await fetch(webflowTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: getWebflowClientId(),
      client_secret: getWebflowClientSecret(),
      code,
      redirect_uri: getWebflowRedirectUri(origin),
    }),
  });

  if (!response.ok) {
    throw new Error("Webflow token exchange failed.");
  }

  return (await response.json()) as WebflowTokenResponse;
}

async function fetchWebflowSites(accessToken: string) {
  const response = await fetch(`${webflowApiBaseUrl}/sites`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Webflow sites import failed.");
  }

  return parseWebflowSitesResponse(await response.json());
}

function parseWebflowSite(value: unknown): WebflowSite | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const item = value as Record<string, unknown>;
  const id = readString(item.id);
  const displayName = readString(item.displayName);

  if (!id || !displayName) {
    return null;
  }

  return {
    customDomains: readCustomDomains(item.customDomains),
    displayName,
    id,
    lastPublished: readString(item.lastPublished) || null,
    shortName: readString(item.shortName),
    workspaceId: readString(item.workspaceId),
  };
}

function readCustomDomains(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => {
      if (!item || typeof item !== "object" || Array.isArray(item)) {
        return null;
      }

      const domain = item as Record<string, unknown>;
      const id = readString(domain.id);
      const url = readString(domain.url);

      return id && url ? { id, url } : null;
    })
    .filter((item): item is { id: string; url: string } => item !== null);
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function getWebflowRedirectUri(origin: string) {
  return `${origin}/api/integrations/webflow/callback`;
}

function getWebflowClientId() {
  const value = process.env.WEBFLOW_CLIENT_ID;

  if (!value) {
    throw new Error("WEBFLOW_CLIENT_ID is required to connect Webflow.");
  }

  return value;
}

function getWebflowClientSecret() {
  const value = process.env.WEBFLOW_CLIENT_SECRET;

  if (!value) {
    throw new Error("WEBFLOW_CLIENT_SECRET is required to connect Webflow.");
  }

  return value;
}

function getWebflowScopes() {
  return process.env.WEBFLOW_SCOPES || defaultScopes;
}

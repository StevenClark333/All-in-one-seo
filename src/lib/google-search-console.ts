import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { Prisma, type Integration } from "@prisma/client";
import {
  decryptIntegrationConfig,
  encryptIntegrationConfig,
} from "@/lib/integration-secrets";
import { getPrisma } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

const googleOAuthBaseUrl = "https://accounts.google.com/o/oauth2/v2/auth";
const googleTokenUrl = "https://oauth2.googleapis.com/token";
const searchConsoleSitesUrl = "https://www.googleapis.com/webmasters/v3/sites";
const searchAnalyticsBaseUrl = "https://www.googleapis.com/webmasters/v3/sites";
const stateCookieName = "gsc_oauth_state";
const scope = "https://www.googleapis.com/auth/webmasters.readonly";

export type GscSite = {
  permissionLevel: string;
  siteUrl: string;
};

export type GscTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

export async function createGoogleSearchConsoleAuthUrl(origin: string) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Search Console.");
  }

  const clientId = getGoogleClientId();
  const state = randomBytes(18).toString("base64url");
  const cookieStore = await cookies();

  cookieStore.set(stateCookieName, state, {
    httpOnly: true,
    maxAge: 600,
    path: "/",
    sameSite: "lax",
    secure: origin.startsWith("https://"),
  });

  const url = new URL(googleOAuthBaseUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", getGoogleRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);

  return url.toString();
}

export async function completeGoogleSearchConsoleOAuth({
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
    throw new Error("Google Search Console OAuth state did not match.");
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Search Console.");
  }

  const token = await exchangeGoogleOAuthCode({
    code,
    origin,
  });
  const sites = await fetchGoogleSearchConsoleSites(token.access_token);
  const expiresAt = new Date(Date.now() + token.expires_in * 1000);

  const configJson = encryptIntegrationConfig({
    connectedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    scope: token.scope,
    sites,
    token,
  } satisfies Prisma.InputJsonObject);
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider: "GOOGLE_SEARCH_CONSOLE",
      domainId: null,
    },
  });

  if (existingIntegration) {
    return getPrisma().integration.update({
      where: { id: existingIntegration.id },
      data: {
        status: "CONNECTED",
        configJson,
      },
    });
  }

  return getPrisma().integration.create({
    data: {
      workspaceId: workspace.id,
      provider: "GOOGLE_SEARCH_CONSOLE",
      status: "CONNECTED",
      configJson,
    },
  });
}

export async function mapGoogleSearchConsoleProperty({
  domainId,
  propertyUrl,
}: {
  domainId: string;
  propertyUrl: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before mapping Search Console.");
  }

  const domain = await getPrisma().domain.findFirst({
    where: { id: domainId, workspaceId: workspace.id },
  });

  if (!domain) {
    throw new Error("Domain not found.");
  }

  const configJson = {
    propertyUrl,
    mappedAt: new Date().toISOString(),
  } satisfies Prisma.InputJsonObject;
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider: "GOOGLE_SEARCH_CONSOLE_PROPERTY",
      domainId,
    },
  });

  if (existingIntegration) {
    return getPrisma().integration.update({
      where: { id: existingIntegration.id },
      data: {
        status: "MAPPED",
        configJson,
      },
    });
  }

  return getPrisma().integration.create({
    data: {
      workspaceId: workspace.id,
      domainId,
      provider: "GOOGLE_SEARCH_CONSOLE_PROPERTY",
      status: "MAPPED",
      configJson,
    },
  });
}

export async function importGoogleSearchConsoleMetrics(domainId: string) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before importing Search Console data.");
  }

  const [connection, mapping] = await Promise.all([
    getPrisma().integration.findFirst({
      where: {
        workspaceId: workspace.id,
        provider: "GOOGLE_SEARCH_CONSOLE",
        domainId: null,
      },
    }),
    getPrisma().integration.findFirst({
      where: {
        workspaceId: workspace.id,
        provider: "GOOGLE_SEARCH_CONSOLE_PROPERTY",
        domainId,
      },
    }),
  ]);

  if (!connection) {
    throw new Error("Connect Google Search Console before importing metrics.");
  }

  if (!mapping) {
    throw new Error("Map a Google Search Console property before importing.");
  }

  const propertyUrl = readConfigString(mapping.configJson, "propertyUrl");
  const token = await getValidAccessToken(connection);
  const rows = await fetchGoogleSearchAnalyticsRows({
    accessToken: token,
    propertyUrl,
  });

  for (const row of rows) {
    await getPrisma().gscSearchMetric.upsert({
      where: {
        domainId_date_query_pageUrl_country_device: {
          domainId,
          date: row.date,
          query: row.query,
          pageUrl: row.pageUrl,
          country: row.country,
          device: row.device,
        },
      },
      create: {
        domainId,
        date: row.date,
        query: row.query,
        pageUrl: row.pageUrl,
        country: row.country,
        device: row.device,
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      },
      update: {
        clicks: row.clicks,
        impressions: row.impressions,
        ctr: row.ctr,
        position: row.position,
      },
    });
  }

  await getPrisma().integration.update({
    where: { id: mapping.id },
    data: {
      status: "IMPORTED",
      configJson: {
        propertyUrl,
        lastImportedAt: new Date().toISOString(),
        lastImportedRows: rows.length,
      } satisfies Prisma.InputJsonObject,
    },
  });
  await updatePageImportanceFromGscRows(domainId, rows);

  return { imported: rows.length };
}

export function readGscSites(configJson: Prisma.JsonValue): GscSite[] {
  if (
    !configJson ||
    typeof configJson !== "object" ||
    Array.isArray(configJson)
  ) {
    return [];
  }

  const sites = (configJson as Record<string, Prisma.JsonValue>).sites;

  if (!Array.isArray(sites)) {
    return [];
  }

  return sites
    .filter(
      (site): site is Record<string, Prisma.JsonValue> =>
        !!site && typeof site === "object" && !Array.isArray(site),
    )
    .map((site) => ({
      permissionLevel:
        typeof site.permissionLevel === "string" ? site.permissionLevel : "",
      siteUrl: typeof site.siteUrl === "string" ? site.siteUrl : "",
    }))
    .filter((site) => site.siteUrl);
}

export function findMatchingGscSite(domain: string, sites: GscSite[]) {
  const normalizedDomain = domain.toLowerCase();

  return sites.find((site) => {
    if (site.siteUrl.startsWith("sc-domain:")) {
      return (
        site.siteUrl.replace("sc-domain:", "").toLowerCase() ===
        normalizedDomain
      );
    }

    try {
      const url = new URL(site.siteUrl);
      const hostname = url.hostname.replace(/^www\./, "").toLowerCase();
      return hostname === normalizedDomain;
    } catch {
      return false;
    }
  });
}

export function parseSearchAnalyticsRows(body: {
  rows?: Array<{
    clicks?: number;
    ctr?: number;
    impressions?: number;
    keys?: string[];
    position?: number;
  }>;
}) {
  return (body.rows ?? [])
    .map((row) => {
      const [date = "", pageUrl = "", query = "", country = "", device = ""] =
        row.keys ?? [];
      const parsedDate = new Date(`${date}T00:00:00.000Z`);

      if (!date || Number.isNaN(parsedDate.getTime()) || !pageUrl) {
        return null;
      }

      return {
        date: parsedDate,
        pageUrl,
        query,
        country,
        device,
        clicks: Math.max(0, Math.round(row.clicks ?? 0)),
        impressions: Math.max(0, Math.round(row.impressions ?? 0)),
        ctr: row.ctr ?? 0,
        position: row.position ?? 0,
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
}

export function calculateGscPageImportance(input: {
  clicks: number;
  impressions: number;
}) {
  if (input.clicks >= 50 || input.impressions >= 1000) {
    return "CRITICAL" as const;
  }

  if (input.clicks >= 10 || input.impressions >= 100) {
    return "IMPORTANT" as const;
  }

  return "NORMAL" as const;
}

async function exchangeGoogleOAuthCode({
  code,
  origin,
}: {
  code: string;
  origin: string;
}) {
  const response = await fetch(googleTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      code,
      grant_type: "authorization_code",
      redirect_uri: getGoogleRedirectUri(origin),
    }),
  });

  if (!response.ok) {
    throw new Error("Google OAuth token exchange failed.");
  }

  return (await response.json()) as GscTokenResponse;
}

async function fetchGoogleSearchConsoleSites(accessToken: string) {
  const response = await fetch(searchConsoleSitesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Google Search Console site import failed.");
  }

  const body = (await response.json()) as {
    siteEntry?: Array<{ permissionLevel?: string; siteUrl?: string }>;
  };

  return (body.siteEntry ?? [])
    .map((site) => ({
      permissionLevel: site.permissionLevel ?? "",
      siteUrl: site.siteUrl ?? "",
    }))
    .filter((site) => site.siteUrl);
}

async function fetchGoogleSearchAnalyticsRows({
  accessToken,
  propertyUrl,
}: {
  accessToken: string;
  propertyUrl: string;
}) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 2);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 28);
  const endpoint = `${searchAnalyticsBaseUrl}/${encodeURIComponent(
    propertyUrl,
  )}/searchAnalytics/query`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
      dimensions: ["date", "page", "query", "country", "device"],
      rowLimit: 250,
    }),
  });

  if (!response.ok) {
    throw new Error("Google Search Console metrics import failed.");
  }

  return parseSearchAnalyticsRows(await response.json());
}

async function updatePageImportanceFromGscRows(
  domainId: string,
  rows: ReturnType<typeof parseSearchAnalyticsRows>,
) {
  const totalsByUrl = new Map<
    string,
    { clicks: number; impressions: number }
  >();

  for (const row of rows) {
    const totals = totalsByUrl.get(row.pageUrl) ?? {
      clicks: 0,
      impressions: 0,
    };

    totals.clicks += row.clicks;
    totals.impressions += row.impressions;
    totalsByUrl.set(row.pageUrl, totals);
  }

  for (const [pageUrl, totals] of totalsByUrl) {
    const importance = calculateGscPageImportance(totals);

    if (importance === "NORMAL") {
      continue;
    }

    await getPrisma().page.updateMany({
      where: {
        domainId,
        normalizedUrl: pageUrl,
        importance: importance === "CRITICAL" ? { not: "IGNORED" } : "NORMAL",
      },
      data: { importance },
    });
  }
}

async function getValidAccessToken(connection: Integration) {
  const token = readTokenConfig(connection.configJson);
  const expiresAtValue = readConfigString(connection.configJson, "expiresAt");
  const expiresAt = expiresAtValue ? new Date(expiresAtValue) : null;

  if (
    token.access_token &&
    expiresAt &&
    expiresAt.getTime() > Date.now() + 60_000
  ) {
    return token.access_token;
  }

  if (!token.refresh_token) {
    throw new Error("Google Search Console refresh token is missing.");
  }

  const refreshedToken = await refreshGoogleOAuthToken(token.refresh_token);
  const nextToken = { ...token, ...refreshedToken };
  const nextExpiresAt = new Date(Date.now() + refreshedToken.expires_in * 1000);

  await getPrisma().integration.update({
    where: { id: connection.id },
    data: {
      configJson: encryptIntegrationConfig({
        ...readDecryptedConfigObject(connection.configJson),
        expiresAt: nextExpiresAt.toISOString(),
        token: nextToken,
      } satisfies Prisma.InputJsonObject),
    },
  });

  return nextToken.access_token;
}

async function refreshGoogleOAuthToken(refreshToken: string) {
  const response = await fetch(googleTokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getGoogleClientId(),
      client_secret: getGoogleClientSecret(),
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("Google OAuth token refresh failed.");
  }

  return (await response.json()) as Omit<GscTokenResponse, "refresh_token">;
}

function readTokenConfig(value: Prisma.JsonValue) {
  const token = readConfigObject(readDecryptedConfigObject(value).token);

  return {
    access_token:
      typeof token.access_token === "string" ? token.access_token : "",
    refresh_token:
      typeof token.refresh_token === "string" ? token.refresh_token : "",
  };
}

function readConfigString(value: Prisma.JsonValue, key: string) {
  const object = readDecryptedConfigObject(value);
  const item = object[key];

  return typeof item === "string" ? item : "";
}

function readConfigObject(value: Prisma.JsonValue) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, Prisma.JsonValue>;
}

function readDecryptedConfigObject(value: Prisma.JsonValue) {
  return readConfigObject(decryptIntegrationConfig(value));
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getGoogleRedirectUri(origin: string) {
  return `${origin}/api/integrations/google-search-console/callback`;
}

function getGoogleClientId() {
  const value = process.env.GOOGLE_CLIENT_ID;

  if (!value) {
    throw new Error("GOOGLE_CLIENT_ID is required for Search Console OAuth.");
  }

  return value;
}

function getGoogleClientSecret() {
  const value = process.env.GOOGLE_CLIENT_SECRET;

  if (!value) {
    throw new Error(
      "GOOGLE_CLIENT_SECRET is required for Search Console OAuth.",
    );
  }

  return value;
}

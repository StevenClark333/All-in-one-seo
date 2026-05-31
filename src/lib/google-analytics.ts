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
const analyticsAccountSummariesUrl =
  "https://analyticsadmin.googleapis.com/v1alpha/accountSummaries";
const analyticsDataBaseUrl = "https://analyticsdata.googleapis.com/v1beta";
const stateCookieName = "ga_oauth_state";
const scope = "https://www.googleapis.com/auth/analytics.readonly";

export type GaProperty = {
  account: string;
  accountDisplayName: string;
  displayName: string;
  property: string;
};

type GaTokenResponse = {
  access_token: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  token_type: string;
};

export async function createGoogleAnalyticsAuthUrl(origin: string) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Google Analytics.");
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

  const url = new URL(googleOAuthBaseUrl);
  url.searchParams.set("client_id", getGoogleClientId());
  url.searchParams.set("redirect_uri", getGoogleRedirectUri(origin));
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", scope);
  url.searchParams.set("access_type", "offline");
  url.searchParams.set("prompt", "consent");
  url.searchParams.set("state", state);

  return url.toString();
}

export async function completeGoogleAnalyticsOAuth({
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
    throw new Error("Google Analytics OAuth state did not match.");
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before connecting Google Analytics.");
  }

  const token = await exchangeGoogleOAuthCode({ code, origin });
  const properties = await fetchGoogleAnalyticsProperties(token.access_token);
  const expiresAt = new Date(Date.now() + token.expires_in * 1000);
  const configJson = encryptIntegrationConfig({
    connectedAt: new Date().toISOString(),
    expiresAt: expiresAt.toISOString(),
    properties,
    scope: token.scope,
    token,
  } satisfies Prisma.InputJsonObject);
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider: "GOOGLE_ANALYTICS",
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
      provider: "GOOGLE_ANALYTICS",
      status: "CONNECTED",
      configJson,
    },
  });
}

export async function mapGoogleAnalyticsProperty({
  domainId,
  property,
}: {
  domainId: string;
  property: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before mapping Google Analytics.");
  }

  const domain = await getPrisma().domain.findFirst({
    where: { id: domainId, workspaceId: workspace.id },
  });

  if (!domain) {
    throw new Error("Domain not found.");
  }

  const configJson = {
    mappedAt: new Date().toISOString(),
    property,
  } satisfies Prisma.InputJsonObject;
  const existingIntegration = await getPrisma().integration.findFirst({
    where: {
      workspaceId: workspace.id,
      provider: "GOOGLE_ANALYTICS_PROPERTY",
      domainId,
    },
  });

  if (existingIntegration) {
    return getPrisma().integration.update({
      where: { id: existingIntegration.id },
      data: { configJson, status: "MAPPED" },
    });
  }

  return getPrisma().integration.create({
    data: {
      workspaceId: workspace.id,
      domainId,
      provider: "GOOGLE_ANALYTICS_PROPERTY",
      status: "MAPPED",
      configJson,
    },
  });
}

export async function importGoogleAnalyticsMetrics(domainId: string) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before importing Google Analytics.");
  }

  const [connection, mapping] = await Promise.all([
    getPrisma().integration.findFirst({
      where: { workspaceId: workspace.id, provider: "GOOGLE_ANALYTICS" },
    }),
    getPrisma().integration.findFirst({
      where: {
        workspaceId: workspace.id,
        provider: "GOOGLE_ANALYTICS_PROPERTY",
        domainId,
      },
    }),
  ]);

  if (!connection) {
    throw new Error("Connect Google Analytics before importing metrics.");
  }

  if (!mapping) {
    throw new Error("Map a Google Analytics property before importing.");
  }

  const property = readConfigString(mapping.configJson, "property");
  const accessToken = await getValidAccessToken(connection);
  const rows = await fetchGoogleAnalyticsRows({ accessToken, property });

  for (const row of rows) {
    await getPrisma().gaTrafficMetric.upsert({
      where: {
        domainId_date_pagePath: {
          domainId,
          date: row.date,
          pagePath: row.pagePath,
        },
      },
      create: {
        domainId,
        date: row.date,
        pagePath: row.pagePath,
        sessions: row.sessions,
        activeUsers: row.activeUsers,
        screenPageViews: row.screenPageViews,
        conversions: row.conversions,
      },
      update: {
        sessions: row.sessions,
        activeUsers: row.activeUsers,
        screenPageViews: row.screenPageViews,
        conversions: row.conversions,
      },
    });
  }

  await getPrisma().integration.update({
    where: { id: mapping.id },
    data: {
      status: "IMPORTED",
      configJson: {
        property,
        lastImportedAt: new Date().toISOString(),
        lastImportedRows: rows.length,
      } satisfies Prisma.InputJsonObject,
    },
  });

  return { imported: rows.length };
}

export function readGaProperties(configJson: Prisma.JsonValue): GaProperty[] {
  const properties = readConfigObject(configJson).properties;

  if (!Array.isArray(properties)) {
    return [];
  }

  return properties
    .filter(
      (property): property is Record<string, Prisma.JsonValue> =>
        !!property && typeof property === "object" && !Array.isArray(property),
    )
    .map((property) => ({
      account: readString(property.account),
      accountDisplayName: readString(property.accountDisplayName),
      displayName: readString(property.displayName),
      property: readString(property.property),
    }))
    .filter((property) => property.property);
}

export function parseAnalyticsReportRows(body: {
  rows?: Array<{
    dimensionValues?: Array<{ value?: string }>;
    metricValues?: Array<{ value?: string }>;
  }>;
}) {
  return (body.rows ?? [])
    .map((row) => {
      const date = row.dimensionValues?.[0]?.value ?? "";
      const pagePath = row.dimensionValues?.[1]?.value ?? "";
      const parsedDate = new Date(
        `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T00:00:00.000Z`,
      );

      if (!date || !pagePath || Number.isNaN(parsedDate.getTime())) {
        return null;
      }

      return {
        date: parsedDate,
        pagePath,
        sessions: readNumberString(row.metricValues?.[0]?.value),
        activeUsers: readNumberString(row.metricValues?.[1]?.value),
        screenPageViews: readNumberString(row.metricValues?.[2]?.value),
        conversions: readNumberString(row.metricValues?.[3]?.value),
      };
    })
    .filter((row): row is NonNullable<typeof row> => Boolean(row));
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
    throw new Error("Google Analytics OAuth token exchange failed.");
  }

  return (await response.json()) as GaTokenResponse;
}

async function fetchGoogleAnalyticsProperties(accessToken: string) {
  const response = await fetch(analyticsAccountSummariesUrl, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!response.ok) {
    throw new Error("Google Analytics property import failed.");
  }

  const body = (await response.json()) as {
    accountSummaries?: Array<{
      account?: string;
      displayName?: string;
      propertySummaries?: Array<{ displayName?: string; property?: string }>;
    }>;
  };

  return (body.accountSummaries ?? []).flatMap((account) =>
    (account.propertySummaries ?? []).map((property) => ({
      account: account.account ?? "",
      accountDisplayName: account.displayName ?? "",
      displayName: property.displayName ?? "",
      property: property.property ?? "",
    })),
  );
}

async function fetchGoogleAnalyticsRows({
  accessToken,
  property,
}: {
  accessToken: string;
  property: string;
}) {
  const endDate = new Date();
  endDate.setDate(endDate.getDate() - 1);
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 28);
  const response = await fetch(
    `${analyticsDataBaseUrl}/${property}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [
          { startDate: formatDate(startDate), endDate: formatDate(endDate) },
        ],
        dimensions: [{ name: "date" }, { name: "pagePath" }],
        metrics: [
          { name: "sessions" },
          { name: "activeUsers" },
          { name: "screenPageViews" },
          { name: "conversions" },
        ],
        limit: "250",
      }),
    },
  );

  if (!response.ok) {
    throw new Error("Google Analytics metrics import failed.");
  }

  return parseAnalyticsReportRows(await response.json());
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
    throw new Error("Google Analytics refresh token is missing.");
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
    throw new Error("Google Analytics OAuth token refresh failed.");
  }

  return (await response.json()) as Omit<GaTokenResponse, "refresh_token">;
}

function getGoogleRedirectUri(origin: string) {
  return `${origin}/api/integrations/google-analytics/callback`;
}

function getGoogleClientId() {
  const value = process.env.GOOGLE_CLIENT_ID;

  if (!value) {
    throw new Error("GOOGLE_CLIENT_ID is required for Google Analytics OAuth.");
  }

  return value;
}

function getGoogleClientSecret() {
  const value = process.env.GOOGLE_CLIENT_SECRET;

  if (!value) {
    throw new Error(
      "GOOGLE_CLIENT_SECRET is required for Google Analytics OAuth.",
    );
  }

  return value;
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
  const item = readDecryptedConfigObject(value)[key];

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

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

function readNumberString(value: string | undefined) {
  const parsed = Number(value ?? 0);

  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

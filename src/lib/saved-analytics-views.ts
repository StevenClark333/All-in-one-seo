import { Prisma } from "@prisma/client";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

export const savedAnalyticsRoutes = [
  "/competitive-analysis",
  "/keyword-research",
  "/rank-tracking",
  "/search-performance",
] as const;

export type SavedAnalyticsRoute = (typeof savedAnalyticsRoutes)[number];

export type SavedAnalyticsFilters = Record<string, string>;

export function isSavedAnalyticsRoute(
  route: string,
): route is SavedAnalyticsRoute {
  return savedAnalyticsRoutes.includes(route as SavedAnalyticsRoute);
}

export async function getSavedAnalyticsViews(route: SavedAnalyticsRoute) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return [];
  }

  try {
    return await getPrisma().savedAnalyticsView.findMany({
      where: { route, workspaceId: workspace.id },
      orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
      take: 8,
    });
  } catch (error) {
    if (isMissingSavedViewsTableError(error)) {
      return [];
    }

    throw error;
  }
}

export function buildSavedViewHref({
  filters,
  route,
}: {
  filters: Prisma.JsonValue;
  route: SavedAnalyticsRoute;
}) {
  const params = new URLSearchParams();

  if (isFilterRecord(filters)) {
    for (const [key, value] of Object.entries(filters)) {
      if (value) {
        params.set(key, value);
      }
    }
  }

  const queryString = params.toString();

  return queryString ? `${route}?${queryString}` : route;
}

export function normalizeSavedViewFilters(
  filters: SavedAnalyticsFilters,
): SavedAnalyticsFilters {
  return Object.fromEntries(
    Object.entries(filters)
      .map(([key, value]) => [key, value.trim()])
      .filter(([, value]) => value),
  );
}

function isFilterRecord(value: Prisma.JsonValue): value is SavedAnalyticsFilters {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    Object.values(value).every((item) => typeof item === "string")
  );
}

export function isMissingSavedViewsTableError(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2021" &&
    error.meta?.table === "public.saved_analytics_views"
  );
}

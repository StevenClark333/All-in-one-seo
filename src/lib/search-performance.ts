import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

const dayMs = 24 * 60 * 60 * 1000;
const defaultRangeDays = 28;

export type SearchPerformanceFilters = {
  country?: string;
  device?: string;
  domainId?: string;
  endDate?: string;
  page?: string;
  query?: string;
  startDate?: string;
};

export type SearchMetricRow = {
  clicks: number;
  country: string | null;
  date: Date;
  device: string | null;
  impressions: number;
  pageUrl: string;
  position: number;
  query: string;
};

export type SearchPerformanceSummary = {
  avgPosition: number;
  clicks: number;
  ctr: number;
  impressions: number;
  visibility: number;
};

export type SearchPerformanceGroup = SearchPerformanceSummary & {
  key: string;
  previousPosition: number | null;
  positionChange: number | null;
};

export type SearchPerformanceData = {
  countries: string[];
  dateRange: { end: Date; start: Date };
  declinedQueries: SearchPerformanceGroup[];
  devices: string[];
  domains: Array<{
    client: { name: string } | null;
    domain: string;
    id: string;
  }>;
  improvedQueries: SearchPerformanceGroup[];
  latestImportedAt: Date | null;
  previousSummary: SearchPerformanceSummary;
  selectedDomain:
    | {
        client: { name: string } | null;
        domain: string;
        id: string;
      }
    | null;
  summary: SearchPerformanceSummary;
  topPages: SearchPerformanceGroup[];
  topQueries: SearchPerformanceGroup[];
  workspace: Awaited<ReturnType<typeof getPrimaryWorkspace>>;
};

export async function getSearchPerformanceData(
  filters: SearchPerformanceFilters = {},
): Promise<SearchPerformanceData> {
  const emptyRange = normalizeDateRange(filters);

  if (!hasDatabaseUrl()) {
    return {
      countries: [],
      dateRange: emptyRange,
      declinedQueries: [],
      devices: [],
      domains: [],
      improvedQueries: [],
      latestImportedAt: null,
      previousSummary: summarizeSearchMetrics([]),
      selectedDomain: null,
      summary: summarizeSearchMetrics([]),
      topPages: [],
      topQueries: [],
      workspace: null,
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      countries: [],
      dateRange: emptyRange,
      declinedQueries: [],
      devices: [],
      domains: [],
      improvedQueries: [],
      latestImportedAt: null,
      previousSummary: summarizeSearchMetrics([]),
      selectedDomain: null,
      summary: summarizeSearchMetrics([]),
      topPages: [],
      topQueries: [],
      workspace: null,
    };
  }

  const prisma = getPrisma();
  const dateRange = normalizeDateRange(filters);
  const rangeLengthDays =
    Math.max(1, Math.round((dateRange.end.getTime() - dateRange.start.getTime()) / dayMs)) + 1;
  const previousEnd = new Date(dateRange.start.getTime() - dayMs);
  const previousStart = new Date(previousEnd.getTime() - (rangeLengthDays - 1) * dayMs);
  const baseDomainWhere = {
    archivedAt: null,
    workspaceId: workspace.id,
    ...(filters.domainId ? { id: filters.domainId } : {}),
  };
  const metricFilters = {
    ...(filters.country ? { country: filters.country } : {}),
    ...(filters.device ? { device: filters.device } : {}),
    ...(filters.page
      ? { pageUrl: { contains: filters.page, mode: "insensitive" as const } }
      : {}),
    ...(filters.query
      ? { query: { contains: filters.query, mode: "insensitive" as const } }
      : {}),
  };

  const [domains, currentRows, previousRows, optionRows, latestMetric] =
    await Promise.all([
      prisma.domain.findMany({
        where: { archivedAt: null, workspaceId: workspace.id },
        select: {
          client: { select: { name: true } },
          domain: true,
          id: true,
        },
        orderBy: [{ client: { name: "asc" } }, { domain: "asc" }],
      }),
      prisma.gscSearchMetric.findMany({
        where: {
          ...metricFilters,
          date: { gte: dateRange.start, lte: dateRange.end },
          domain: baseDomainWhere,
        },
        orderBy: [{ impressions: "desc" }, { clicks: "desc" }],
        take: 2000,
      }),
      prisma.gscSearchMetric.findMany({
        where: {
          ...metricFilters,
          date: { gte: previousStart, lte: previousEnd },
          domain: baseDomainWhere,
        },
        take: 2000,
      }),
      prisma.gscSearchMetric.findMany({
        where: { domain: baseDomainWhere },
        select: { country: true, device: true },
        distinct: ["country", "device"],
      }),
      prisma.gscSearchMetric.findFirst({
        where: { domain: baseDomainWhere },
        orderBy: { updatedAt: "desc" },
        select: { updatedAt: true },
      }),
    ]);

  const previousQueries = groupSearchMetrics(previousRows, "query", []);

  return {
    countries: uniqueOptions(optionRows.map((row) => row.country)),
    dateRange,
    declinedQueries: groupSearchMetrics(
      currentRows,
      "query",
      previousQueries,
    )
      .filter((group) => (group.positionChange ?? 0) < -0.1)
      .sort((a, b) => (a.positionChange ?? 0) - (b.positionChange ?? 0))
      .slice(0, 6),
    devices: uniqueOptions(optionRows.map((row) => row.device)),
    domains,
    improvedQueries: groupSearchMetrics(
      currentRows,
      "query",
      previousQueries,
    )
      .filter((group) => (group.positionChange ?? 0) > 0.1)
      .sort((a, b) => (b.positionChange ?? 0) - (a.positionChange ?? 0))
      .slice(0, 6),
    latestImportedAt: latestMetric?.updatedAt ?? null,
    previousSummary: summarizeSearchMetrics(previousRows),
    selectedDomain:
      domains.find((domain) => domain.id === filters.domainId) ?? null,
    summary: summarizeSearchMetrics(currentRows),
    topPages: groupSearchMetrics(
      currentRows,
      "pageUrl",
      groupSearchMetrics(previousRows, "pageUrl", []),
    ).slice(0, 10),
    topQueries: groupSearchMetrics(currentRows, "query", previousQueries).slice(
      0,
      10,
    ),
    workspace,
  };
}

export function summarizeSearchMetrics(
  rows: SearchMetricRow[],
): SearchPerformanceSummary {
  const clicks = rows.reduce((total, row) => total + row.clicks, 0);
  const impressions = rows.reduce((total, row) => total + row.impressions, 0);
  const weightedPosition = rows.reduce(
    (total, row) => total + row.position * Math.max(1, row.impressions),
    0,
  );
  const positionWeight = rows.reduce(
    (total, row) => total + Math.max(1, row.impressions),
    0,
  );

  return {
    avgPosition: roundMetric(
      positionWeight ? weightedPosition / positionWeight : 0,
      1,
    ),
    clicks,
    ctr: impressions ? roundMetric(clicks / impressions, 4) : 0,
    impressions,
    visibility: calculateVisibility(rows),
  };
}

export function groupSearchMetrics(
  rows: SearchMetricRow[],
  key: "pageUrl" | "query",
  previousGroups: SearchPerformanceGroup[],
): SearchPerformanceGroup[] {
  const previousByKey = new Map(
    previousGroups.map((group) => [group.key, group.avgPosition]),
  );
  const groups = new Map<string, SearchMetricRow[]>();

  for (const row of rows) {
    const groupKey = row[key] || "(not provided)";
    const existing = groups.get(groupKey) ?? [];

    existing.push(row);
    groups.set(groupKey, existing);
  }

  return Array.from(groups.entries())
    .map(([groupKey, groupRows]) => {
      const summary = summarizeSearchMetrics(groupRows);
      const previousPosition = previousByKey.get(groupKey) ?? null;

      return {
        ...summary,
        key: groupKey,
        positionChange:
          previousPosition === null
            ? null
            : roundMetric(previousPosition - summary.avgPosition, 1),
        previousPosition,
      };
    })
    .sort((a, b) => b.impressions - a.impressions || b.clicks - a.clicks);
}

export function calculateVisibility(rows: SearchMetricRow[]) {
  const impressions = rows.reduce((total, row) => total + row.impressions, 0);

  if (!impressions) {
    return 0;
  }

  const visibleWeight = rows.reduce((total, row) => {
    const positionScore = Math.max(0, 101 - row.position) / 100;

    return total + row.impressions * positionScore;
  }, 0);

  return roundMetric((visibleWeight / impressions) * 100, 1);
}

function normalizeDateRange(filters: SearchPerformanceFilters) {
  const fallbackEnd = startOfDay(new Date());
  fallbackEnd.setDate(fallbackEnd.getDate() - 2);
  const fallbackStart = new Date(fallbackEnd);

  fallbackStart.setDate(fallbackStart.getDate() - (defaultRangeDays - 1));

  const start = parseDate(filters.startDate) ?? fallbackStart;
  const end = parseDate(filters.endDate) ?? fallbackEnd;

  if (start.getTime() > end.getTime()) {
    return { end: startOfDay(start), start: startOfDay(end) };
  }

  return { end: startOfDay(end), start: startOfDay(start) };
}

function parseDate(value?: string) {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00.000Z`);

  return Number.isNaN(date.getTime()) ? null : date;
}

function startOfDay(value: Date) {
  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

function uniqueOptions(values: Array<string | null>) {
  return Array.from(
    new Set(values.filter((value): value is string => Boolean(value))),
  ).sort((a, b) => a.localeCompare(b));
}

function roundMetric(value: number, decimals: number) {
  const multiplier = 10 ** decimals;

  return Math.round(value * multiplier) / multiplier;
}

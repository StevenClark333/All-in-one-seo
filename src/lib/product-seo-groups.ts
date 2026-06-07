import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import {
  getSearchPerformanceData,
  groupSearchMetrics,
  summarizeSearchMetrics,
  type SearchPerformanceFilters,
  type SearchPerformanceGroup,
  type SearchMetricRow,
} from "@/lib/search-performance";
import { getPrimaryWorkspace } from "@/lib/workspace";

export type ProductSeoFilters = SearchPerformanceFilters;

export type CompetitiveDomainRow = {
  avgPosition: number;
  clicks: number;
  clientName: string | null;
  domain: string;
  healthScore: number | null;
  id: string;
  impressions: number;
  issueCount: number;
  pageCount: number;
  visibility: number;
};

export type CompetitorVisibilityRow = {
  avgPosition: number | null;
  bestKeyword: string | null;
  domain: string;
  keywordWins: number;
  label: string | null;
};

export type KeywordOpportunity = SearchPerformanceGroup & {
  intent: KeywordIntent;
  opportunityScore: number;
  reason: string;
};

export type KeywordContentGap = SearchPerformanceGroup & {
  actionHref: string;
  reason: string;
};

export type RankTrackingSummary = {
  averagePosition: number | null;
  improved: number;
  keywords: number;
  topThree: number;
  topTen: number;
  worsened: number;
};

export type CompetitorContentGap = {
  competitorDomain: string;
  competitorPosition: number;
  keyword: string;
  ownedPosition: number | null;
  priority: number;
  reason: string;
  volume: number | null;
};

export type KeywordIntent =
  | "brand"
  | "commercial"
  | "comparison"
  | "informational"
  | "local"
  | "transactional";

export async function getCompetitiveAnalysisData(
  filters: ProductSeoFilters = {},
) {
  const searchData = await getSearchPerformanceData(filters);

  if (!hasDatabaseUrl()) {
    return {
      ...searchData,
      competitorRows: [],
      domainRows: [],
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      ...searchData,
      competitorRows: [],
      domainRows: [],
    };
  }

  const dateRange = searchData.dateRange;
  const domains = await getPrisma().domain.findMany({
    where: {
      archivedAt: null,
      workspaceId: workspace.id,
      ...(filters.domainId ? { id: filters.domainId } : {}),
    },
    include: {
      client: { select: { name: true } },
      gscMetrics: {
        where: {
          date: { gte: dateRange.start, lte: dateRange.end },
          ...(filters.country ? { country: filters.country } : {}),
          ...(filters.device ? { device: filters.device } : {}),
          ...(filters.page
            ? {
                pageUrl: {
                  contains: filters.page,
                  mode: "insensitive" as const,
                },
              }
            : {}),
          ...(filters.query
            ? {
                query: {
                  contains: filters.query,
                  mode: "insensitive" as const,
                },
              }
            : {}),
        },
        orderBy: [{ impressions: "desc" }, { clicks: "desc" }],
        take: 1000,
      },
      issues: {
        where: { status: { not: "FIXED" } },
        select: { id: true },
      },
      pages: { select: { id: true } },
    },
    orderBy: [{ client: { name: "asc" } }, { domain: "asc" }],
  });

  const competitorRows = await getCompetitorVisibilityRows({
    domainId: filters.domainId,
    workspaceId: workspace.id,
  });

  return {
    ...searchData,
    competitorRows,
    domainRows: domains
      .map((domain): CompetitiveDomainRow => {
        const summary = summarizeSearchMetrics(domain.gscMetrics);

        return {
          avgPosition: summary.avgPosition,
          clicks: summary.clicks,
          clientName: domain.client?.name ?? null,
          domain: domain.domain,
          healthScore: domain.healthScore,
          id: domain.id,
          impressions: summary.impressions,
          issueCount: domain.issues.length,
          pageCount: domain.pages.length,
          visibility: summary.visibility,
        };
      })
      .sort(
        (a, b) =>
          b.visibility - a.visibility ||
          b.impressions - a.impressions ||
          (b.healthScore ?? 0) - (a.healthScore ?? 0),
      ),
  };
}

export async function getKeywordResearchData(
  filters: ProductSeoFilters = {},
) {
  const searchData = await getSearchPerformanceData(filters);
  const opportunitySource = searchData.topQueries.concat(
    searchData.declinedQueries,
  );
  const opportunities = buildKeywordOpportunities(opportunitySource);
  const contentGaps = buildKeywordContentGaps(searchData.topQueries);
  const competitorContentGaps = await getCompetitorContentGaps(filters);

  return {
    ...searchData,
    competitorContentGaps,
    contentGaps,
    intentGroups: groupKeywordIntents(searchData.topQueries),
    opportunities,
  };
}

export async function getRankTrackingData(filters: ProductSeoFilters = {}) {
  if (!hasDatabaseUrl()) {
    return {
      competitorContentGaps: [],
      competitors: [],
      domains: [],
      keywords: [],
      selectedDomain: null,
      summary: summarizeRankTracking([]),
      workspace: null,
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      competitorContentGaps: [],
      competitors: [],
      domains: [],
      keywords: [],
      selectedDomain: null,
      summary: summarizeRankTracking([]),
      workspace: null,
    };
  }

  const domainWhere = {
    archivedAt: null,
    workspaceId: workspace.id,
    ...(filters.domainId ? { id: filters.domainId } : {}),
  };
  const [domains, keywords, competitors] = await Promise.all([
    getPrisma().domain.findMany({
      where: { archivedAt: null, workspaceId: workspace.id },
      select: {
        client: { select: { name: true } },
        domain: true,
        id: true,
      },
      orderBy: [{ client: { name: "asc" } }, { domain: "asc" }],
    }),
    getPrisma().trackedKeyword.findMany({
      where: {
        domain: domainWhere,
        ...(filters.query
          ? { keyword: { contains: filters.query, mode: "insensitive" } }
          : {}),
      },
      include: {
        domain: { include: { client: { select: { name: true } } } },
        metrics: { orderBy: { importedAt: "desc" }, take: 1 },
        rankings: { orderBy: { date: "desc" }, take: 20 },
      },
      orderBy: [{ status: "asc" }, { updatedAt: "desc" }],
      take: 200,
    }),
    getPrisma().competitorDomain.findMany({
      where: { baseDomain: domainWhere },
      include: { baseDomain: true },
      orderBy: [{ domain: "asc" }],
    }),
  ]);

  return {
    competitorContentGaps: buildCompetitorContentGaps(keywords),
    competitors,
    domains,
    keywords,
    selectedDomain:
      domains.find((domain) => domain.id === filters.domainId) ?? null,
    summary: summarizeRankTracking(keywords),
    workspace,
  };
}

export function buildKeywordOpportunities(
  groups: SearchPerformanceGroup[],
): KeywordOpportunity[] {
  return dedupeGroups(groups)
    .map((group) => {
      const intent = classifyKeywordIntent(group.key);
      const ctrPercent = group.ctr * 100;
      const lowCtrMultiplier = ctrPercent < 2 ? 2 : ctrPercent < 5 ? 1.35 : 1;
      const positionMultiplier =
        group.avgPosition >= 4 && group.avgPosition <= 20
          ? 1.6
          : group.avgPosition > 20
            ? 1.2
            : 0.7;
      const declineMultiplier = (group.positionChange ?? 0) < 0 ? 1.35 : 1;

      return {
        ...group,
        intent,
        opportunityScore: Math.round(
          Math.log10(Math.max(10, group.impressions)) *
            20 *
            lowCtrMultiplier *
            positionMultiplier *
            declineMultiplier,
        ),
        reason: buildOpportunityReason(group),
      };
    })
    .filter((group) => group.impressions > 0 && group.opportunityScore >= 20)
    .sort(
      (a, b) =>
        b.opportunityScore - a.opportunityScore ||
        b.impressions - a.impressions,
    )
    .slice(0, 12);
}

export function buildKeywordContentGaps(
  groups: SearchPerformanceGroup[],
): KeywordContentGap[] {
  return dedupeGroups(groups)
    .filter(
      (group) =>
        group.impressions >= 20 &&
        (group.clicks === 0 || group.ctr < 0.02 || group.avgPosition > 12),
    )
    .map((group) => ({
      ...group,
      actionHref: `/recommendations?query=${encodeURIComponent(group.key)}`,
      reason:
        group.clicks === 0
          ? "Visible query has no clicks yet."
          : group.avgPosition > 12
            ? "Ranking below page one for meaningful demand."
            : "CTR trails the demand already visible in Search Console.",
    }))
    .slice(0, 10);
}

export function summarizeRankTracking(
  keywords: Array<{
    rankings: Array<{ competitorDomain: string | null; position: number | null }>;
  }>,
): RankTrackingSummary {
  const ownedRankingsByKeyword = keywords.map((keyword) =>
    keyword.rankings.filter((ranking) => !ranking.competitorDomain),
  );
  const ownedRankings = ownedRankingsByKeyword
    .map((rankings) => rankings.at(0))
    .filter(
      (ranking): ranking is { competitorDomain: string | null; position: number } =>
        typeof ranking?.position === "number",
    );
  const averagePosition = ownedRankings.length
    ? roundValue(
        ownedRankings.reduce((total, ranking) => total + ranking.position, 0) /
          ownedRankings.length,
        1,
      )
    : null;

  return {
    averagePosition,
    improved: ownedRankingsByKeyword.filter((rankings) =>
      movedBetweenLatestRanks(rankings, "improved"),
    ).length,
    keywords: keywords.length,
    topThree: ownedRankings.filter((ranking) => ranking.position <= 3).length,
    topTen: ownedRankings.filter((ranking) => ranking.position <= 10).length,
    worsened: ownedRankingsByKeyword.filter((rankings) =>
      movedBetweenLatestRanks(rankings, "worsened"),
    ).length,
  };
}

export function buildCompetitorContentGaps(
  keywords: Array<{
    keyword: string;
    metrics: Array<{ searchVolume: number | null }>;
    rankings: Array<{
      competitorDomain: string | null;
      position: number | null;
    }>;
  }>,
): CompetitorContentGap[] {
  return keywords
    .flatMap((keyword) => {
      const owned = keyword.rankings.find(
        (ranking) => !ranking.competitorDomain,
      );
      const ownedPosition = owned?.position ?? null;
      const competitorRankings = keyword.rankings.filter(
        (
          ranking,
        ): ranking is {
          competitorDomain: string;
          position: number;
        } =>
          Boolean(ranking.competitorDomain) &&
          typeof ranking.position === "number",
      );

      return competitorRankings
        .filter(
          (ranking) =>
            ownedPosition === null || ranking.position < ownedPosition,
        )
        .map((ranking) => {
          const volume = keyword.metrics.at(0)?.searchVolume ?? null;
          const gapSize =
            ownedPosition === null
              ? 25
              : Math.max(1, ownedPosition - ranking.position);

          return {
            competitorDomain: ranking.competitorDomain,
            competitorPosition: ranking.position,
            keyword: keyword.keyword,
            ownedPosition,
            priority: Math.round(
              gapSize * 4 + Math.log10(Math.max(10, volume ?? 10)) * 10,
            ),
            reason:
              ownedPosition === null
                ? "Competitor ranks and this project has no tracked position yet."
                : "Competitor outranks this project for a tracked keyword.",
            volume,
          };
        });
    })
    .sort(
      (a, b) =>
        b.priority - a.priority ||
        (b.volume ?? 0) - (a.volume ?? 0) ||
        a.competitorPosition - b.competitorPosition,
    )
    .slice(0, 12);
}

export function groupKeywordIntents(groups: SearchPerformanceGroup[]) {
  const rows = new Map<
    KeywordIntent,
    { clicks: number; impressions: number; intent: KeywordIntent; queries: number }
  >();

  for (const group of dedupeGroups(groups)) {
    const intent = classifyKeywordIntent(group.key);
    const existing =
      rows.get(intent) ?? { clicks: 0, impressions: 0, intent, queries: 0 };

    existing.clicks += group.clicks;
    existing.impressions += group.impressions;
    existing.queries += 1;
    rows.set(intent, existing);
  }

  return Array.from(rows.values()).sort(
    (a, b) => b.impressions - a.impressions || b.clicks - a.clicks,
  );
}

export function classifyKeywordIntent(query: string): KeywordIntent {
  const normalized = query.toLowerCase();

  if (
    /\b(near me|nearby|local)\b/.test(normalized) ||
    /\bin (new york|los angeles|chicago|houston|phoenix|philadelphia|san antonio|san diego|dallas|austin|london|toronto|karachi|lahore|islamabad)\b/.test(
      normalized,
    )
  ) {
    return "local";
  }

  if (/\b(vs|versus|alternative|alternatives|compare|comparison)\b/.test(normalized)) {
    return "comparison";
  }

  if (/\b(price|pricing|cost|buy|discount|coupon|deal|order)\b/.test(normalized)) {
    return "transactional";
  }

  if (/\b(best|top|review|reviews|service|services|software|tool|tools)\b/.test(normalized)) {
    return "commercial";
  }

  if (/\b(how|what|why|guide|tutorial|example|examples|template|checklist)\b/.test(normalized)) {
    return "informational";
  }

  return "brand";
}

export function rowsToSearchGroups(
  rows: SearchMetricRow[],
): SearchPerformanceGroup[] {
  return groupSearchMetrics(rows, "query", []);
}

function buildOpportunityReason(group: SearchPerformanceGroup) {
  if ((group.positionChange ?? 0) < 0) {
    return "Declining query with recoverable demand.";
  }

  if (group.avgPosition >= 4 && group.avgPosition <= 20) {
    return "Close enough to improve with focused content and internal links.";
  }

  if (group.ctr < 0.02) {
    return "Search result is visible but under-clicked.";
  }

  return "Meaningful demand worth monitoring.";
}

async function getCompetitorVisibilityRows({
  domainId,
  workspaceId,
}: {
  domainId?: string;
  workspaceId: string;
}): Promise<CompetitorVisibilityRow[]> {
  const competitors = await getPrisma().competitorDomain.findMany({
    where: {
      workspaceId,
      ...(domainId ? { domainId } : {}),
    },
    orderBy: { domain: "asc" },
  });

  if (!competitors.length) {
    return [];
  }

  const observations = await getPrisma().rankObservation.findMany({
    where: {
      competitorDomain: {
        in: competitors.map((competitor) => competitor.domain),
      },
      trackedKeyword: {
        workspaceId,
        ...(domainId ? { domainId } : {}),
      },
    },
    include: { trackedKeyword: true },
    orderBy: { date: "desc" },
    take: 1000,
  });

  return competitors.map((competitor) => {
    const competitorObservations = observations.filter(
      (observation) => observation.competitorDomain === competitor.domain,
    );
    const positions = competitorObservations
      .map((observation) => observation.position)
      .filter((position): position is number => typeof position === "number");
    const bestObservation = competitorObservations
      .filter(
        (
          observation,
        ): observation is typeof observation & { position: number } =>
          typeof observation.position === "number",
      )
      .sort((a, b) => a.position - b.position)
      .at(0);

    return {
      avgPosition: positions.length
        ? roundValue(
            positions.reduce((total, position) => total + position, 0) /
              positions.length,
            1,
          )
        : null,
      bestKeyword: bestObservation?.trackedKeyword.keyword ?? null,
      domain: competitor.domain,
      keywordWins: positions.filter((position) => position <= 10).length,
      label: competitor.label,
    };
  });
}

async function getCompetitorContentGaps(filters: ProductSeoFilters) {
  if (!hasDatabaseUrl()) {
    return [];
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return [];
  }

  const keywords = await getPrisma().trackedKeyword.findMany({
    where: {
      workspaceId: workspace.id,
      ...(filters.domainId ? { domainId: filters.domainId } : {}),
      ...(filters.query
        ? { keyword: { contains: filters.query, mode: "insensitive" } }
        : {}),
    },
    include: {
      metrics: { orderBy: { importedAt: "desc" }, take: 1 },
      rankings: { orderBy: { date: "desc" }, take: 20 },
    },
    take: 200,
  });

  return buildCompetitorContentGaps(keywords);
}

function dedupeGroups(groups: SearchPerformanceGroup[]) {
  const seen = new Map<string, SearchPerformanceGroup>();

  for (const group of groups) {
    const existing = seen.get(group.key);

    if (!existing || group.impressions > existing.impressions) {
      seen.set(group.key, group);
    }
  }

  return Array.from(seen.values());
}

function roundValue(value: number, decimals: number) {
  const multiplier = 10 ** decimals;

  return Math.round(value * multiplier) / multiplier;
}

function movedBetweenLatestRanks(
  rankings: Array<{ position: number | null }>,
  direction: "improved" | "worsened",
) {
  const latest = rankings.at(0)?.position;
  const previous = rankings.at(1)?.position;

  if (typeof latest !== "number" || typeof previous !== "number") {
    return false;
  }

  return direction === "improved" ? latest < previous : latest > previous;
}

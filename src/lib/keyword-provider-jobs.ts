import { Prisma, RankTrackingFrequency, SearchEngine } from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import {
  claimNextWorkerJob,
  completeWorkerJob,
  enqueueWorkerJob,
  failWorkerJob,
} from "@/lib/worker-queue";

type KeywordImportPayload = {
  country?: string | null;
  device?: string | null;
  domainId: string;
  engine?: SearchEngine;
  keyword: string;
  trackedKeywordId: string;
};

export type ProviderKeywordMetric = {
  competition?: number;
  cpcCents?: number;
  difficulty?: number;
  language?: string;
  searchVolume?: number;
  trendJson?: Prisma.InputJsonValue;
};

export type ProviderRankObservation = {
  competitorDomain?: string;
  featuredSnippet?: boolean;
  localPack?: boolean;
  peopleAlsoAsk?: boolean;
  position?: number;
  url?: string;
};

export type KeywordProviderImportPayload = {
  country?: string | null;
  device?: string | null;
  domain?: string;
  domainId?: string;
  engine?: SearchEngine;
  keyword: string;
  metric?: ProviderKeywordMetric;
  provider?: string;
  rank?: ProviderRankObservation;
  trackedKeywordId?: string;
  workspaceId?: string;
};

export async function enqueueDueKeywordImportJobs(now = new Date()) {
  const keywords = await getPrisma().trackedKeyword.findMany({
    where: { status: "ACTIVE" },
    include: {
      metrics: { orderBy: { importedAt: "desc" }, take: 1 },
      rankings: {
        orderBy: { date: "desc" },
        take: 1,
        where: { competitorDomain: null },
      },
    },
    take: 500,
  });
  let enqueued = 0;

  for (const keyword of keywords) {
    const latestImportAt =
      keyword.metrics.at(0)?.importedAt ??
      keyword.rankings.at(0)?.date ??
      keyword.updatedAt;

    if (!isKeywordImportDue(keyword.frequency, latestImportAt, now)) {
      continue;
    }

    const existingJob = await getPrisma().workerJob.findFirst({
      where: {
        resourceId: keyword.id,
        status: { in: ["QUEUED", "RUNNING", "FAILED"] },
        type: "KEYWORD_IMPORT",
      },
      select: { id: true },
    });

    if (existingJob) {
      continue;
    }

    await enqueueWorkerJob({
      payloadJson: {
        country: keyword.country,
        device: keyword.device,
        domainId: keyword.domainId,
        engine: keyword.engine,
        keyword: keyword.keyword,
        trackedKeywordId: keyword.id,
      },
      resourceId: keyword.id,
      type: "KEYWORD_IMPORT",
      workspaceId: keyword.workspaceId,
    });
    enqueued += 1;
  }

  return { enqueued };
}

export async function processNextKeywordImportJob(workerId: string) {
  const job = await claimNextWorkerJob({
    type: "KEYWORD_IMPORT",
    workerId,
  });

  if (!job) {
    return { processed: false };
  }

  try {
    const payload = readKeywordImportPayload(job.payloadJson);
    const providerData = readProviderData(job.payloadJson);
    const fallbackData = process.env.KEYWORD_IMPORT_DEMO_MODE === "true"
      ? buildDemoProviderData(payload)
      : null;
    const result = await importProviderKeywordData({
      metric: providerData.metric ?? fallbackData?.metric,
      payload,
      rank: providerData.rank ?? fallbackData?.rank,
      workspaceId: job.workspaceId,
    });

    await completeWorkerJob(job.id);
    return { jobId: job.id, processed: true, ...result };
  } catch (error) {
    await failWorkerJob({
      error: error instanceof Error ? error : "Unknown keyword import error.",
      jobId: job.id,
    });
    throw error;
  }
}

export async function ingestKeywordProviderImport(
  payload: KeywordProviderImportPayload,
) {
  const trackedKeyword = await resolveTrackedKeyword(payload);
  const result = await importProviderKeywordData({
    metric: payload.metric,
    payload: {
      country: payload.country ?? trackedKeyword.country,
      device: payload.device ?? trackedKeyword.device,
      domainId: trackedKeyword.domainId,
      engine: payload.engine ?? trackedKeyword.engine,
      keyword: trackedKeyword.keyword,
      trackedKeywordId: trackedKeyword.id,
    },
    provider: payload.provider,
    rank: payload.rank,
    workspaceId: trackedKeyword.workspaceId,
  });

  return {
    ...result,
    trackedKeywordId: trackedKeyword.id,
  };
}

export function isKeywordImportDue(
  frequency: RankTrackingFrequency,
  latestImportAt: Date | null,
  now = new Date(),
) {
  if (!latestImportAt) {
    return true;
  }

  const elapsedDays =
    (now.getTime() - latestImportAt.getTime()) / (1000 * 60 * 60 * 24);

  if (frequency === "DAILY") {
    return elapsedDays >= 1;
  }

  if (frequency === "MONTHLY") {
    return elapsedDays >= 28;
  }

  return elapsedDays >= 7;
}

async function importProviderKeywordData({
  metric,
  payload,
  provider,
  rank,
  workspaceId,
}: {
  metric?: ProviderKeywordMetric;
  payload: KeywordImportPayload;
  provider?: string;
  rank?: ProviderRankObservation;
  workspaceId: string;
}) {
  let importedMetrics = 0;
  let importedRanks = 0;

  if (metric) {
    await getPrisma().keywordMetric.create({
      data: {
        competition: metric.competition,
        country: payload.country,
        cpcCents: metric.cpcCents,
        difficulty: metric.difficulty,
        keyword: payload.keyword,
        language: metric.language,
        provider:
          provider ?? process.env.KEYWORD_PROVIDER_NAME ?? "PROVIDER_IMPORT",
        searchVolume: metric.searchVolume,
        trackedKeywordId: payload.trackedKeywordId,
        trendJson: metric.trendJson,
        workspaceId,
      },
    });
    importedMetrics = 1;
  }

  if (rank) {
    await getPrisma().rankObservation.create({
      data: {
        competitorDomain: rank.competitorDomain,
        country: payload.country,
        date: new Date(),
        device: payload.device,
        engine: payload.engine ?? "GOOGLE",
        featuredSnippet: Boolean(rank.featuredSnippet),
        localPack: Boolean(rank.localPack),
        peopleAlsoAsk: Boolean(rank.peopleAlsoAsk),
        position: rank.position,
        trackedKeywordId: payload.trackedKeywordId,
        url: rank.url,
      },
    });
    importedRanks = 1;
  }

  return {
    importedMetrics,
    importedRanks,
    providerReady: importedMetrics + importedRanks === 0,
  };
}

async function resolveTrackedKeyword(payload: KeywordProviderImportPayload) {
  if (payload.trackedKeywordId) {
    const keyword = await getPrisma().trackedKeyword.findFirst({
      where: {
        id: payload.trackedKeywordId,
        ...(payload.workspaceId ? { workspaceId: payload.workspaceId } : {}),
      },
    });

    if (keyword) {
      return keyword;
    }
  }

  if (!payload.domainId && !payload.domain) {
    throw new Error(
      "Keyword provider payload must include trackedKeywordId, domainId, or domain.",
    );
  }

  const keyword = await getPrisma().trackedKeyword.findFirst({
    where: {
      keyword: payload.keyword.toLowerCase(),
      ...(payload.workspaceId ? { workspaceId: payload.workspaceId } : {}),
      ...(payload.domainId
        ? { domainId: payload.domainId }
        : {
            domain: {
              domain: payload.domain,
              ...(payload.workspaceId ? { workspaceId: payload.workspaceId } : {}),
            },
          }),
      ...(payload.country ? { country: payload.country } : {}),
      ...(payload.device ? { device: payload.device } : {}),
      ...(payload.engine ? { engine: payload.engine } : {}),
    },
  });

  if (!keyword) {
    throw new Error("Tracked keyword was not found for provider import.");
  }

  return keyword;
}

function readKeywordImportPayload(value: unknown): KeywordImportPayload {
  if (
    value &&
    typeof value === "object" &&
    "domainId" in value &&
    "keyword" in value &&
    "trackedKeywordId" in value &&
    typeof value.domainId === "string" &&
    typeof value.keyword === "string" &&
    typeof value.trackedKeywordId === "string"
  ) {
    return {
      country:
        "country" in value && typeof value.country === "string"
          ? value.country
          : null,
      device:
        "device" in value && typeof value.device === "string"
          ? value.device
          : null,
      domainId: value.domainId,
      engine:
        "engine" in value && isSearchEngine(value.engine)
          ? value.engine
          : "GOOGLE",
      keyword: value.keyword,
      trackedKeywordId: value.trackedKeywordId,
    };
  }

  throw new Error("Keyword import worker job payload is invalid.");
}

function readProviderData(value: unknown) {
  if (!value || typeof value !== "object") {
    return {};
  }

  return {
    metric:
      "metric" in value && isProviderKeywordMetric(value.metric)
        ? value.metric
        : undefined,
    rank:
      "rank" in value && isProviderRankObservation(value.rank)
        ? value.rank
        : undefined,
  };
}

function isProviderKeywordMetric(value: unknown): value is ProviderKeywordMetric {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isProviderRankObservation(
  value: unknown,
): value is ProviderRankObservation {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isSearchEngine(value: unknown): value is SearchEngine {
  return value === SearchEngine.BING || value === SearchEngine.GOOGLE;
}

function buildDemoProviderData(payload: KeywordImportPayload) {
  const seed = Array.from(payload.keyword).reduce(
    (total, character) => total + character.charCodeAt(0),
    0,
  );

  return {
    metric: {
      cpcCents: 120 + (seed % 600),
      difficulty: 20 + (seed % 55),
      searchVolume: 90 + (seed % 6200),
    },
    rank: {
      position: 1 + (seed % 24),
      url: `https://example.com/search/${encodeURIComponent(payload.keyword)}`,
    },
  };
}

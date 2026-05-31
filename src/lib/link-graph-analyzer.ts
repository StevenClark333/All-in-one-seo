import { createHash } from "node:crypto";
import { Prisma, type IssueSeverity } from "@prisma/client";
import { buildDetectedIssueStatus } from "@/lib/issue-workflow";
import { getPrisma } from "@/lib/prisma";

type LinkGraphPage = {
  id: string;
  url: string;
  normalizedUrl: string;
  importance: string;
  pageType: string | null;
};

type LinkGraphLink = {
  sourcePageId: string;
  targetPageId: string | null;
  normalizedUrl: string;
};

type LinkGraphIssue = {
  issueType: string;
  severity: IssueSeverity;
  priorityScore: number;
  title: string;
  description: string;
  recommendation: string;
  pageId?: string | null;
};

export type InternalLinkOpportunity = {
  sourcePageId: string;
  sourceUrl: string;
  targetPageId: string;
  targetUrl: string;
  priorityScore: number;
  anchorText: string;
  reason: string;
};

const LINK_GRAPH_ISSUE_PREFIXES = [
  "deep_page:",
  "sitemap_url_not_internally_linked:",
  "internally_linked_url_missing_from_sitemap:",
];

export async function analyzeInternalLinkGraph(crawlRunId: string) {
  const prisma = getPrisma();
  const crawlRun = await prisma.crawlRun.findUnique({
    where: { id: crawlRunId },
    include: {
      domain: true,
      artifacts: true,
      links: true,
    },
  });

  if (!crawlRun) {
    throw new Error("Crawl run not found.");
  }

  const pages = await prisma.page.findMany({
    where: { domainId: crawlRun.domainId },
    select: {
      id: true,
      url: true,
      normalizedUrl: true,
      importance: true,
      pageType: true,
    },
  });
  const sitemapUrls = crawlRun.artifacts
    .filter(
      (artifact) => artifact.type === "SITEMAP" && artifact.statusCode === 200,
    )
    .flatMap((artifact) =>
      getStringList(getMetadata(artifact.metadataJson).urls),
    );
  const issues = analyzeLinkGraph({
    pages,
    links: crawlRun.links,
    sitemapUrls,
  });
  const opportunities = generateInternalLinkOpportunities({
    pages,
    links: crawlRun.links,
  });

  await replaceLinkGraphIssues({
    workspaceId: crawlRun.domain.workspaceId,
    clientId: crawlRun.domain.clientId,
    domainId: crawlRun.domainId,
    issues,
  });
  await replaceInternalLinkRecommendations(opportunities);

  return issues;
}

export function analyzeLinkGraph(input: {
  pages: LinkGraphPage[];
  links: LinkGraphLink[];
  sitemapUrls: string[];
}): LinkGraphIssue[] {
  const issues: LinkGraphIssue[] = [];
  const pagesById = new Map(input.pages.map((page) => [page.id, page]));
  const pagesByUrl = new Map(
    input.pages.map((page) => [normalizeUrl(page.normalizedUrl), page]),
  );
  const sitemapSet = new Set(input.sitemapUrls.map(normalizeUrl));
  const linkedUrlSet = new Set(
    input.links.map((link) => normalizeUrl(link.normalizedUrl)),
  );
  const depths = calculatePageDepths(input.pages, input.links);

  for (const [pageId, depth] of depths.entries()) {
    if (depth <= 3) {
      continue;
    }

    const page = pagesById.get(pageId);

    if (!page) {
      continue;
    }

    issues.push({
      issueType: `deep_page:${page.normalizedUrl}`,
      severity: depth >= 5 ? "WARNING" : "SUGGESTION",
      priorityScore: Math.min(80, 38 + depth * 6),
      title: "Deep page in internal link graph",
      description: `${page.url} is ${depth} clicks from a primary entry page.`,
      recommendation:
        "Add contextual internal links from higher-authority pages, navigation, hubs, or relevant templates to reduce crawl depth.",
      pageId: page.id,
    });
  }

  for (const sitemapUrl of sitemapSet) {
    if (!sitemapUrl || linkedUrlSet.has(sitemapUrl)) {
      continue;
    }

    const page = pagesByUrl.get(sitemapUrl);

    issues.push({
      issueType: `sitemap_url_not_internally_linked:${sitemapUrl}`,
      severity: "WARNING",
      priorityScore: 66,
      title: "Sitemap URL is not internally linked",
      description: `${sitemapUrl} appears in the sitemap but was not found in the internal link graph.`,
      recommendation:
        "Add at least one relevant internal link to this URL or remove it from the sitemap if it should not be discoverable.",
      pageId: page?.id,
    });
  }

  for (const linkedUrl of linkedUrlSet) {
    if (!linkedUrl || sitemapSet.size === 0 || sitemapSet.has(linkedUrl)) {
      continue;
    }

    const page = pagesByUrl.get(linkedUrl);

    issues.push({
      issueType: `internally_linked_url_missing_from_sitemap:${linkedUrl}`,
      severity: "SUGGESTION",
      priorityScore: 42,
      title: "Internally linked URL missing from sitemap",
      description: `${linkedUrl} is internally linked but was not found in the sitemap.`,
      recommendation:
        "Add canonical, indexable URLs to the XML sitemap or remove internal links if the page should not be discoverable.",
      pageId: page?.id,
    });
  }

  return issues.sort((a, b) => b.priorityScore - a.priorityScore);
}

export function generateInternalLinkOpportunities(input: {
  pages: LinkGraphPage[];
  links: LinkGraphLink[];
}): InternalLinkOpportunity[] {
  const incomingCounts = new Map<string, number>();
  const outgoingCounts = new Map<string, number>();
  const existingEdges = new Set<string>();

  for (const page of input.pages) {
    incomingCounts.set(page.id, 0);
    outgoingCounts.set(page.id, 0);
  }

  for (const link of input.links) {
    outgoingCounts.set(
      link.sourcePageId,
      (outgoingCounts.get(link.sourcePageId) ?? 0) + 1,
    );

    if (link.targetPageId) {
      incomingCounts.set(
        link.targetPageId,
        (incomingCounts.get(link.targetPageId) ?? 0) + 1,
      );
      existingEdges.add(`${link.sourcePageId}:${link.targetPageId}`);
    }
  }

  const candidates: InternalLinkOpportunity[] = [];
  const sourcePages = input.pages
    .filter((page) => (outgoingCounts.get(page.id) ?? 0) > 0)
    .sort(
      (a, b) =>
        pageAuthorityScore(b, incomingCounts) -
        pageAuthorityScore(a, incomingCounts),
    );
  const targetPages = input.pages
    .filter(
      (page) =>
        page.importance !== "IGNORED" &&
        page.pageType !== "homepage" &&
        (incomingCounts.get(page.id) ?? 0) < 2,
    )
    .sort(
      (a, b) =>
        targetNeedScore(b, incomingCounts) - targetNeedScore(a, incomingCounts),
    );

  for (const target of targetPages) {
    const sourceCandidates = sourcePages
      .filter(
        (source) =>
          source.id !== target.id &&
          !existingEdges.has(`${source.id}:${target.id}`),
      )
      .map((source) => ({
        source,
        score:
          pageAuthorityScore(source, incomingCounts) +
          topicalSimilarityScore(source, target),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);

    for (const candidate of sourceCandidates) {
      candidates.push({
        sourcePageId: candidate.source.id,
        sourceUrl: candidate.source.url,
        targetPageId: target.id,
        targetUrl: target.url,
        priorityScore: Math.min(
          100,
          targetNeedScore(target, incomingCounts) + candidate.score,
        ),
        anchorText: buildAnchorText(target.url),
        reason: buildOpportunityReason(candidate.source, target),
      });
    }
  }

  return candidates
    .sort((a, b) => b.priorityScore - a.priorityScore)
    .slice(0, 50);
}

function calculatePageDepths(pages: LinkGraphPage[], links: LinkGraphLink[]) {
  const depths = new Map<string, number>();
  const adjacency = new Map<string, string[]>();
  const queue: Array<{ pageId: string; depth: number }> = [];

  for (const link of links) {
    if (!link.targetPageId) {
      continue;
    }

    const existing = adjacency.get(link.sourcePageId) ?? [];
    existing.push(link.targetPageId);
    adjacency.set(link.sourcePageId, existing);
  }

  for (const page of pages) {
    if (page.importance === "CRITICAL" || page.pageType === "homepage") {
      depths.set(page.id, 0);
      queue.push({ pageId: page.id, depth: 0 });
    }
  }

  while (queue.length) {
    const current = queue.shift();

    if (!current) {
      break;
    }

    for (const targetPageId of adjacency.get(current.pageId) ?? []) {
      const nextDepth = current.depth + 1;
      const existingDepth = depths.get(targetPageId);

      if (existingDepth !== undefined && existingDepth <= nextDepth) {
        continue;
      }

      depths.set(targetPageId, nextDepth);
      queue.push({ pageId: targetPageId, depth: nextDepth });
    }
  }

  return depths;
}

async function replaceInternalLinkRecommendations(
  opportunities: InternalLinkOpportunity[],
) {
  const prisma = getPrisma();

  for (const opportunity of opportunities) {
    const inputHash = hashInput(opportunity);
    const existing = await prisma.seoRecommendation.findFirst({
      where: {
        pageId: opportunity.targetPageId,
        inputHash,
        type: "INTERNAL_LINKING",
      },
    });
    const recommendationJson = {
      title: "Internal link opportunity",
      summary: `Add a contextual link from ${opportunity.sourceUrl} to ${opportunity.targetUrl}.`,
      suggestedValue: opportunity.anchorText,
      implementation:
        "Place the link where it naturally supports the surrounding content, then rerun the crawl to confirm the graph updated.",
      rationale: opportunity.reason,
      sourcePageId: opportunity.sourcePageId,
      sourceUrl: opportunity.sourceUrl,
      targetPageId: opportunity.targetPageId,
      targetUrl: opportunity.targetUrl,
      priorityScore: opportunity.priorityScore,
    } satisfies Prisma.InputJsonObject;

    if (existing) {
      await prisma.seoRecommendation.update({
        where: { id: existing.id },
        data: { recommendationJson },
      });
    } else {
      await prisma.seoRecommendation.create({
        data: {
          pageId: opportunity.targetPageId,
          inputHash,
          type: "INTERNAL_LINKING",
          recommendationJson,
        },
      });
    }
  }
}

async function replaceLinkGraphIssues(input: {
  workspaceId: string;
  clientId: string | null;
  domainId: string;
  issues: LinkGraphIssue[];
}) {
  const prisma = getPrisma();
  const detectedTypes = input.issues.map((issue) => issue.issueType);

  await prisma.seoIssue.updateMany({
    where: {
      domainId: input.domainId,
      issueType: {
        notIn: detectedTypes,
      },
      OR: LINK_GRAPH_ISSUE_PREFIXES.map((prefix) => ({
        issueType: { startsWith: prefix },
      })),
      status: { in: ["OPEN", "IN_PROGRESS", "REAPPEARED"] },
    },
    data: {
      status: "FIXED",
      resolvedAt: new Date(),
    },
  });

  for (const issue of input.issues) {
    const existing = await prisma.seoIssue.findFirst({
      where: {
        domainId: input.domainId,
        issueType: issue.issueType,
      },
    });
    const data = {
      severity: issue.severity,
      priorityScore: issue.priorityScore,
      title: issue.title,
      description: issue.description,
      recommendation: issue.recommendation,
      pageId: issue.pageId,
      status: buildDetectedIssueStatus(existing?.status),
      lastDetectedAt: new Date(),
      resolvedAt: null,
    };

    if (existing) {
      await prisma.seoIssue.update({
        where: { id: existing.id },
        data,
      });
    } else {
      await prisma.seoIssue.create({
        data: {
          ...data,
          workspaceId: input.workspaceId,
          clientId: input.clientId,
          domainId: input.domainId,
          issueType: issue.issueType,
        },
      });
    }
  }
}

function pageAuthorityScore(
  page: LinkGraphPage,
  incomingCounts: Map<string, number>,
) {
  const importanceBoost =
    page.importance === "CRITICAL"
      ? 35
      : page.importance === "IMPORTANT"
        ? 20
        : 5;

  return importanceBoost + Math.min(incomingCounts.get(page.id) ?? 0, 10) * 4;
}

function targetNeedScore(
  page: LinkGraphPage,
  incomingCounts: Map<string, number>,
) {
  const incoming = incomingCounts.get(page.id) ?? 0;
  const importanceBoost =
    page.importance === "CRITICAL"
      ? 30
      : page.importance === "IMPORTANT"
        ? 20
        : 10;

  return importanceBoost + (2 - incoming) * 15;
}

function topicalSimilarityScore(source: LinkGraphPage, target: LinkGraphPage) {
  if (source.pageType && source.pageType === target.pageType) {
    return 25;
  }

  const sourceSegments = getPathSegments(source.url);
  const targetSegments = getPathSegments(target.url);
  const sharedSegments = sourceSegments.filter((segment) =>
    targetSegments.includes(segment),
  );

  return Math.min(sharedSegments.length * 8, 20);
}

function buildOpportunityReason(source: LinkGraphPage, target: LinkGraphPage) {
  if (source.pageType && source.pageType === target.pageType) {
    return `Both pages are in the ${source.pageType} template group, and ${target.url} has low internal link coverage.`;
  }

  return `${target.url} has low internal link coverage, and ${source.url} is a stronger source page in the current graph.`;
}

function buildAnchorText(url: string) {
  try {
    const segment = new URL(url).pathname.split("/").filter(Boolean).at(-1);

    if (!segment) {
      return "Learn more";
    }

    return segment
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  } catch {
    return "Learn more";
  }
}

function getPathSegments(url: string) {
  try {
    return new URL(url).pathname
      .split("/")
      .filter(Boolean)
      .map((segment) => segment.toLowerCase());
  } catch {
    return [];
  }
}

function hashInput(input: unknown) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function getMetadata(value: unknown) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return {};
}

function getStringList(value: unknown) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeUrl(value: string) {
  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.trim().replace(/\/$/, "");
  }
}

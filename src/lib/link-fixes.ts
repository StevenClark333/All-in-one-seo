import { createHash } from "node:crypto";
import type { LinkFixStatus, Prisma } from "@prisma/client";
import {
  buildLinkFixAutomationPayload,
  readAutomationIntegrationConfig,
  type AutomationProvider,
} from "@/lib/automation-integrations";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

const FIXABLE_LINK_ISSUE_PREFIXES = [
  "broken_internal_link:",
  "sitemap_url_not_internally_linked:",
  "deep_page:",
];

export type LinkFixFilters = {
  domainId?: string;
  status?: LinkFixStatus;
};

export async function getLinkFixCenterData(filters: LinkFixFilters = {}) {
  if (!hasDatabaseUrl()) {
    return {
      automationIntegrations: [],
      workspace: null,
      domains: [],
      suggestions: [],
      counts: buildEmptyCounts(),
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      automationIntegrations: [],
      workspace: null,
      domains: [],
      suggestions: [],
      counts: buildEmptyCounts(),
    };
  }

  const where = {
    workspaceId: workspace.id,
    ...(filters.domainId ? { domainId: filters.domainId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  } satisfies Prisma.LinkFixSuggestionWhereInput;

  const [domains, suggestions, groupedCounts, automationIntegrations] =
    await Promise.all([
      getPrisma().domain.findMany({
        where: { archivedAt: null, workspaceId: workspace.id },
        include: { client: { select: { name: true } } },
        orderBy: [{ client: { name: "asc" } }, { domain: "asc" }],
      }),
      getPrisma().linkFixSuggestion.findMany({
        where,
        include: {
          domain: { include: { client: { select: { name: true } } } },
          issue: true,
          sourcePage: true,
          targetPage: true,
        },
        orderBy: [
          { status: "asc" },
          { confidenceScore: "desc" },
          { updatedAt: "desc" },
        ],
        take: 100,
      }),
      getPrisma().linkFixSuggestion.groupBy({
        by: ["status"],
        where: { workspaceId: workspace.id },
        _count: { _all: true },
      }),
      getPrisma().integration.findMany({
        where: {
          provider: { in: ["MAKE", "ZAPIER"] },
          status: "CONNECTED",
          workspaceId: workspace.id,
        },
        orderBy: [{ provider: "asc" }, { createdAt: "desc" }],
      }),
    ]);

  return {
    automationIntegrations: automationIntegrations.map((integration) => {
      const config = readAutomationIntegrationConfig(integration.configJson);

      return {
        id: integration.id,
        label: config.label || `${integration.provider} workflow`,
        provider: integration.provider as AutomationProvider,
      };
    }),
    workspace,
    domains,
    suggestions,
    counts: groupedCounts.reduce(buildCountsFromGroup, buildEmptyCounts()),
  };
}

export async function generateLinkFixSuggestions(
  filters: {
    domainId?: string;
  } = {},
) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before generating fixes.");
  }

  const domainWhere = {
    workspaceId: workspace.id,
    archivedAt: null,
    ...(filters.domainId ? { id: filters.domainId } : {}),
  } satisfies Prisma.DomainWhereInput;

  const domains = await getPrisma().domain.findMany({
    where: domainWhere,
    include: {
      issues: {
        where: {
          OR: FIXABLE_LINK_ISSUE_PREFIXES.map((prefix) => ({
            issueType: { startsWith: prefix },
          })),
          status: { in: ["OPEN", "IN_PROGRESS", "REAPPEARED"] },
        },
        include: { page: true },
        orderBy: [{ priorityScore: "desc" }, { lastDetectedAt: "desc" }],
      },
      pages: {
        include: {
          snapshots: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: [{ importance: "asc" }, { updatedAt: "desc" }],
      },
    },
  });

  let created = 0;
  let updated = 0;

  for (const domain of domains) {
    const activePages = domain.pages.filter((page) => {
      const latestSnapshot = page.snapshots[0];

      return !latestSnapshot || latestSnapshot.statusCode < 400;
    });

    for (const issue of domain.issues) {
      const suggestion = buildSuggestionForIssue({
        activePages,
        domain,
        issue,
        workspaceId: workspace.id,
      });

      if (!suggestion) {
        continue;
      }

      const existing = await getPrisma().linkFixSuggestion.findUnique({
        where: {
          workspaceId_inputHash: {
            workspaceId: workspace.id,
            inputHash: suggestion.inputHash,
          },
        },
      });

      if (existing) {
        await getPrisma().linkFixSuggestion.update({
          where: { id: existing.id },
          data: {
            anchorText: suggestion.anchorText,
            brokenUrl: suggestion.brokenUrl,
            confidenceScore: suggestion.confidenceScore,
            manualInstructions: suggestion.manualInstructions,
            reason: suggestion.reason,
            sourcePageId: suggestion.sourcePageId,
            sourceUrl: suggestion.sourceUrl,
            suggestedUrl: suggestion.suggestedUrl,
            targetPageId: suggestion.targetPageId,
          },
        });
        updated += 1;
      } else {
        await getPrisma().linkFixSuggestion.create({ data: suggestion });
        created += 1;
      }
    }
  }

  return { created, updated };
}

export async function updateLinkFixSuggestion(input: {
  id: string;
  status?: LinkFixStatus;
  suggestedUrl?: string;
  anchorText?: string | null;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before updating fixes.");
  }

  const existing = await getPrisma().linkFixSuggestion.findFirst({
    where: { id: input.id, workspaceId: workspace.id },
  });

  if (!existing) {
    throw new Error("Fix suggestion not found.");
  }

  const nextSuggestedUrl = input.suggestedUrl?.trim() || existing.suggestedUrl;
  const nextAnchorText =
    input.anchorText === undefined ? existing.anchorText : input.anchorText;
  const manualInstructions = buildManualInstructions({
    anchorText: nextAnchorText,
    brokenUrl: existing.brokenUrl,
    sourceUrl: existing.sourceUrl,
    suggestedUrl: nextSuggestedUrl,
  });
  const statusDates = buildStatusDates(input.status);

  await getPrisma().linkFixSuggestion.update({
    where: { id: existing.id },
    data: {
      ...(input.status ? { status: input.status } : {}),
      ...(input.suggestedUrl ? { suggestedUrl: nextSuggestedUrl } : {}),
      ...(input.anchorText !== undefined ? { anchorText: nextAnchorText } : {}),
      manualInstructions,
      ...statusDates,
    },
  });
}

export async function sendLinkFixToAutomation(input: {
  fixId: string;
  integrationId: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before sending fixes.");
  }

  const [fix, integration] = await Promise.all([
    getPrisma().linkFixSuggestion.findFirst({
      where: { id: input.fixId, workspaceId: workspace.id },
      include: { domain: true },
    }),
    getPrisma().integration.findFirst({
      where: {
        id: input.integrationId,
        provider: { in: ["MAKE", "ZAPIER"] },
        status: "CONNECTED",
        workspaceId: workspace.id,
      },
    }),
  ]);

  if (!fix) {
    throw new Error("Fix suggestion not found.");
  }

  if (!integration) {
    throw new Error("Connect a Zapier or Make automation first.");
  }

  const config = readAutomationIntegrationConfig(integration.configJson);

  if (!config.webhookUrl) {
    throw new Error("Automation webhook URL was not found.");
  }

  const provider = integration.provider as AutomationProvider;
  const payload = buildLinkFixAutomationPayload({
    anchorText: fix.anchorText,
    brokenUrl: fix.brokenUrl,
    domain: fix.domain.domain,
    fixId: fix.id,
    manualInstructions: fix.manualInstructions,
    provider,
    sourceUrl: fix.sourceUrl,
    status: fix.status,
    suggestedUrl: fix.suggestedUrl,
  });
  const response = await fetch(config.webhookUrl, {
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Automation webhook did not accept the fix payload.");
  }

  await getPrisma().linkFixSuggestion.update({
    where: { id: fix.id },
    data: {
      exportedAt: new Date(),
      status: "EXPORTED",
    },
  });
}

function buildSuggestionForIssue(input: {
  workspaceId: string;
  domain: {
    id: string;
    workspaceId: string;
    domain: string;
  };
  issue: {
    id: string;
    issueType: string;
    pageId: string | null;
    page: { id: string; url: string; normalizedUrl: string } | null;
  };
  activePages: Array<{
    id: string;
    url: string;
    normalizedUrl: string;
    pageType: string | null;
    importance: string;
    snapshots: Array<{ title: string | null; h1: string | null }>;
  }>;
}) {
  if (input.issue.issueType.startsWith("broken_internal_link:")) {
    const brokenUrl = input.issue.issueType.replace(
      "broken_internal_link:",
      "",
    );
    const replacement = findBestReplacementPage(brokenUrl, input.activePages);
    const sourceUrl = input.issue.page?.url ?? `https://${input.domain.domain}`;

    if (!replacement) {
      return null;
    }

    return buildSuggestionData({
      anchorText: buildAnchorText(replacement),
      brokenUrl,
      confidenceScore: calculateConfidence(brokenUrl, replacement.url),
      domainId: input.domain.id,
      issueId: input.issue.id,
      reason:
        "The crawler found a broken internal destination. This replacement is the closest live URL by path, slug, and page title.",
      sourcePageId: input.issue.pageId,
      sourceUrl,
      suggestedUrl: replacement.url,
      targetPageId: replacement.id,
      workspaceId: input.workspaceId,
    });
  }

  if (
    input.issue.issueType.startsWith("sitemap_url_not_internally_linked:") ||
    input.issue.issueType.startsWith("deep_page:")
  ) {
    const targetUrl = input.issue.issueType.includes(":")
      ? input.issue.issueType.split(":").slice(1).join(":")
      : input.issue.page?.url;
    const target =
      input.issue.page ??
      input.activePages.find(
        (page) => normalizeUrl(page.normalizedUrl) === normalizeUrl(targetUrl),
      );
    const source = findBestSourcePage(target?.id, input.activePages);

    if (!target || !source) {
      return null;
    }

    return buildSuggestionData({
      anchorText: buildAnchorText(target),
      confidenceScore: source.importance === "CRITICAL" ? 82 : 70,
      domainId: input.domain.id,
      issueId: input.issue.id,
      reason:
        "This target page needs stronger discovery. Add a contextual internal link from a stronger source page to reduce crawl depth and improve discoverability.",
      sourcePageId: source.id,
      sourceUrl: source.url,
      suggestedUrl: target.url,
      targetPageId: target.id,
      workspaceId: input.workspaceId,
    });
  }

  return null;
}

function buildSuggestionData(input: {
  workspaceId: string;
  domainId: string;
  issueId: string;
  sourcePageId?: string | null;
  targetPageId?: string | null;
  sourceUrl: string;
  brokenUrl?: string;
  suggestedUrl: string;
  anchorText: string;
  confidenceScore: number;
  reason: string;
}) {
  const inputHash = hashInput({
    brokenUrl: input.brokenUrl,
    issueId: input.issueId,
    sourcePageId: input.sourcePageId,
    sourceUrl: input.sourceUrl,
    suggestedUrl: input.suggestedUrl,
  });

  return {
    anchorText: input.anchorText,
    brokenUrl: input.brokenUrl,
    confidenceScore: input.confidenceScore,
    domainId: input.domainId,
    inputHash,
    issueId: input.issueId,
    manualInstructions: buildManualInstructions(input),
    reason: input.reason,
    sourcePageId: input.sourcePageId,
    sourceUrl: input.sourceUrl,
    suggestedUrl: input.suggestedUrl,
    targetPageId: input.targetPageId,
    workspaceId: input.workspaceId,
  } satisfies Prisma.LinkFixSuggestionUncheckedCreateInput;
}

function findBestReplacementPage(
  brokenUrl: string,
  pages: Array<{
    id: string;
    url: string;
    normalizedUrl: string;
    pageType: string | null;
    snapshots: Array<{ title: string | null; h1: string | null }>;
  }>,
) {
  const brokenTokens = tokenizeUrl(brokenUrl);

  return pages
    .map((page) => {
      const title = page.snapshots[0]?.title ?? page.snapshots[0]?.h1 ?? "";
      const pageTokens = new Set([
        ...tokenizeUrl(page.url),
        ...tokenize(title),
      ]);
      const overlap = brokenTokens.filter((token) => pageTokens.has(token));
      const pathScore = scorePathSimilarity(brokenUrl, page.url);

      return {
        page,
        score: overlap.length * 18 + pathScore + (page.pageType ? 8 : 0),
      };
    })
    .sort((a, b) => b.score - a.score)
    .at(0)?.page;
}

function findBestSourcePage(
  targetPageId: string | undefined,
  pages: Array<{
    id: string;
    url: string;
    pageType: string | null;
    importance: string;
  }>,
) {
  return pages
    .filter((page) => page.id !== targetPageId)
    .sort((a, b) => sourceScore(b) - sourceScore(a))
    .at(0);
}

function sourceScore(page: { importance: string; pageType: string | null }) {
  const importance =
    page.importance === "CRITICAL"
      ? 100
      : page.importance === "IMPORTANT"
        ? 70
        : 35;

  return importance + (page.pageType === "homepage" ? 25 : 0);
}

function buildManualInstructions(input: {
  sourceUrl: string;
  brokenUrl?: string | null;
  suggestedUrl: string;
  anchorText?: string | null;
}) {
  if (input.brokenUrl) {
    return `On ${input.sourceUrl}, replace the internal link ${input.brokenUrl} with ${input.suggestedUrl}. Use anchor text "${input.anchorText ?? "Learn more"}" if it fits naturally. Recrawl the site after publishing to confirm the issue is fixed.`;
  }

  return `On ${input.sourceUrl}, add a contextual internal link to ${input.suggestedUrl}. Use anchor text "${input.anchorText ?? "Learn more"}" if it fits naturally. Recrawl the site after publishing to confirm the link graph updated.`;
}

function buildStatusDates(status?: LinkFixStatus) {
  const now = new Date();

  if (status === "APPROVED") {
    return { approvedAt: now };
  }

  if (status === "EXPORTED") {
    return { exportedAt: now };
  }

  if (status === "APPLIED") {
    return { appliedAt: now };
  }

  if (status === "DISMISSED") {
    return { dismissedAt: now };
  }

  return {};
}

function calculateConfidence(brokenUrl: string, suggestedUrl: string) {
  const brokenTokens = tokenizeUrl(brokenUrl);
  const suggestedTokens = tokenizeUrl(suggestedUrl);
  const suggestedSet = new Set(suggestedTokens);
  const overlap = brokenTokens.filter((token) => suggestedSet.has(token));

  return Math.min(95, Math.max(45, 50 + overlap.length * 14));
}

function buildAnchorText(page: {
  url: string;
  snapshots?: Array<{ title: string | null; h1: string | null }>;
}) {
  const heading = page.snapshots?.[0]?.h1 ?? page.snapshots?.[0]?.title;

  if (heading) {
    return heading.trim().slice(0, 80);
  }

  try {
    const segment = new URL(page.url).pathname
      .split("/")
      .filter(Boolean)
      .at(-1);

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

function scorePathSimilarity(left: string, right: string) {
  const leftPath = getPath(left);
  const rightPath = getPath(right);

  if (leftPath === rightPath) {
    return 80;
  }

  if (rightPath.includes(leftPath) || leftPath.includes(rightPath)) {
    return 35;
  }

  return 0;
}

function tokenizeUrl(value: string | undefined) {
  return tokenize(getPath(value ?? ""));
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 2);
}

function getPath(value: string) {
  try {
    return new URL(value).pathname;
  } catch {
    return value;
  }
}

function normalizeUrl(value: string | undefined) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);
    url.hash = "";
    url.search = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.trim().replace(/\/$/, "");
  }
}

function hashInput(input: unknown) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function buildEmptyCounts() {
  return {
    APPLIED: 0,
    APPROVED: 0,
    DISMISSED: 0,
    DRAFT: 0,
    EXPORTED: 0,
  } satisfies Record<LinkFixStatus, number>;
}

function buildCountsFromGroup(
  counts: Record<LinkFixStatus, number>,
  group: { status: LinkFixStatus; _count: { _all: number } },
) {
  counts[group.status] = group._count._all;
  return counts;
}

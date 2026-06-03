import { createHash } from "node:crypto";
import type {
  LinkFixStatus,
  LinkFixVerificationStatus,
  Prisma,
} from "@prisma/client";
import {
  buildLinkFixAutomationPayload,
  readAutomationIntegrationConfig,
  type AutomationProvider,
} from "@/lib/automation-integrations";
import { enqueueCrawlRunJob } from "@/lib/crawler-scheduling";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import {
  getWordPressReceiverReadinessMessage,
  isWordPressReceiverReady,
  readWordPressReceiverConfig,
} from "@/lib/wordpress";
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

export type LinkFixLifecycleStepStatus = "COMPLETE" | "CURRENT" | "PENDING";

export function buildLinkFixLifecycleSteps(input: {
  appliedAt?: Date | null;
  approvedAt?: Date | null;
  dismissedAt?: Date | null;
  exportedAt?: Date | null;
  status: LinkFixStatus;
  verificationCheckedAt?: Date | null;
  verificationMessage?: string | null;
  verificationStatus: LinkFixVerificationStatus;
}) {
  if (input.status === "DISMISSED") {
    return [
      {
        detail: "This suggestion was dismissed and is no longer active.",
        label: "Dismissed",
        status: "COMPLETE" as const,
        timestamp: input.dismissedAt ?? null,
      },
    ];
  }

  const approvedComplete = Boolean(input.approvedAt);
  const exportedComplete = Boolean(input.exportedAt);
  const appliedComplete = Boolean(input.appliedAt);
  const verificationComplete = Boolean(input.verificationCheckedAt);

  return [
    {
      detail: approvedComplete
        ? "This fix has been approved for delivery."
        : "Review the suggestion and approve it before sending.",
      label: "Approved",
      status: approvedComplete
        ? ("COMPLETE" as const)
        : input.status === "DRAFT"
          ? ("CURRENT" as const)
          : ("PENDING" as const),
      timestamp: input.approvedAt ?? null,
    },
    {
      detail: exportedComplete
        ? "The fix payload has been sent or exported."
        : "Send this fix to WordPress or another delivery workflow.",
      label: "Sent to workflow",
      status: exportedComplete
        ? ("COMPLETE" as const)
        : approvedComplete
          ? ("CURRENT" as const)
          : ("PENDING" as const),
      timestamp: input.exportedAt ?? null,
    },
    {
      detail: appliedComplete
        ? "The fix has been marked applied in the portal or by WordPress."
        : "Apply the change on the website, then mark it applied.",
      label: "Applied on site",
      status: appliedComplete
        ? ("COMPLETE" as const)
        : exportedComplete
          ? ("CURRENT" as const)
          : ("PENDING" as const),
      timestamp: input.appliedAt ?? null,
    },
    {
      detail:
        input.verificationMessage ||
        (verificationComplete
          ? "The latest crawl checked this fix."
          : appliedComplete
            ? "Waiting for a crawl to verify the website change."
            : "Verification starts after the fix is applied."),
      label:
        input.verificationStatus === "VERIFIED_FIXED"
          ? "Verified fixed"
          : input.verificationStatus === "STILL_FAILING"
            ? "Still failing"
            : "Crawl verification",
      status: verificationComplete
        ? ("COMPLETE" as const)
        : appliedComplete
          ? ("CURRENT" as const)
          : ("PENDING" as const),
      timestamp: input.verificationCheckedAt ?? null,
    },
  ];
}

export async function getLinkFixCenterData(filters: LinkFixFilters = {}) {
  if (!hasDatabaseUrl()) {
    return {
      automationIntegrations: [],
      unavailableWordPressReceivers: [],
      workspace: null,
      domains: [],
      suggestions: [],
      counts: buildEmptyCounts(),
      verificationCounts: buildEmptyVerificationCounts(),
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      automationIntegrations: [],
      unavailableWordPressReceivers: [],
      workspace: null,
      domains: [],
      suggestions: [],
      counts: buildEmptyCounts(),
      verificationCounts: buildEmptyVerificationCounts(),
    };
  }

  const where = {
    workspaceId: workspace.id,
    ...(filters.domainId ? { domainId: filters.domainId } : {}),
    ...(filters.status ? { status: filters.status } : {}),
  } satisfies Prisma.LinkFixSuggestionWhereInput;

  const [
    domains,
    suggestions,
    groupedCounts,
    groupedVerificationCounts,
    automationIntegrations,
  ] = await Promise.all([
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
    getPrisma().linkFixSuggestion.groupBy({
      by: ["verificationStatus"],
      where: { workspaceId: workspace.id },
      _count: { _all: true },
    }),
    getPrisma().integration.findMany({
      where: {
        provider: { in: ["MAKE", "ZAPIER", "WORDPRESS_RECEIVER"] },
        status: "CONNECTED",
        workspaceId: workspace.id,
      },
      include: { domain: true },
      orderBy: [{ provider: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  const deliveryIntegrations = automationIntegrations.map((integration) => {
    const config = readAutomationIntegrationConfig(integration.configJson);
    const wordpressConfig =
      integration.provider === "WORDPRESS_RECEIVER"
        ? readWordPressReceiverConfig(integration.configJson)
        : null;
    const isReady =
      integration.provider !== "WORDPRESS_RECEIVER" ||
      Boolean(wordpressConfig && isWordPressReceiverReady(wordpressConfig));

    return {
      domainId: integration.domainId,
      id: integration.id,
      isReady,
      label:
        wordpressConfig?.receiverUrl ||
        config.label ||
        integration.domain?.domain ||
        `${integration.provider} workflow`,
      provider: integration.provider,
      readinessMessage: wordpressConfig
        ? getWordPressReceiverReadinessMessage(wordpressConfig)
        : "",
    };
  });

  return {
    automationIntegrations: deliveryIntegrations.filter(
      (integration) => integration.isReady,
    ),
    unavailableWordPressReceivers: deliveryIntegrations.filter(
      (integration) =>
        integration.provider === "WORDPRESS_RECEIVER" && !integration.isReady,
    ),
    workspace,
    domains,
    suggestions,
    counts: groupedCounts.reduce(buildCountsFromGroup, buildEmptyCounts()),
    verificationCounts: groupedVerificationCounts.reduce(
      buildVerificationCountsFromGroup,
      buildEmptyVerificationCounts(),
    ),
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
      ...(input.status === "APPLIED"
        ? {
            verificationCheckedAt: null,
            verificationCrawlRunId: null,
            verificationMessage:
              "Waiting for the next crawl to verify this fix.",
            verificationStatus: "PENDING" as const,
          }
        : {}),
      ...(input.suggestedUrl ? { suggestedUrl: nextSuggestedUrl } : {}),
      ...(input.anchorText !== undefined ? { anchorText: nextAnchorText } : {}),
      manualInstructions,
      ...statusDates,
    },
  });
}

export async function sendLinkFixToAutomation(input: {
  callbackOrigin?: string;
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
        provider: { in: ["MAKE", "ZAPIER", "WORDPRESS_RECEIVER"] },
        status: "CONNECTED",
        workspaceId: workspace.id,
      },
    }),
  ]);

  if (!fix) {
    throw new Error("Fix suggestion not found.");
  }

  if (!integration) {
    throw new Error("Connect a Zapier, Make, or WordPress receiver first.");
  }

  if (
    integration.provider === "WORDPRESS_RECEIVER" &&
    integration.domainId !== fix.domainId
  ) {
    throw new Error("WordPress receiver does not belong to this fix domain.");
  }

  const automationConfig = readAutomationIntegrationConfig(
    integration.configJson,
  );
  const wordpressConfig =
    integration.provider === "WORDPRESS_RECEIVER"
      ? readWordPressReceiverConfig(integration.configJson)
      : null;
  const webhookUrl =
    wordpressConfig?.receiverUrl || automationConfig.webhookUrl;

  if (!webhookUrl) {
    throw new Error("Fix delivery URL was not found.");
  }

  if (
    integration.provider === "WORDPRESS_RECEIVER" &&
    (!wordpressConfig || !isWordPressReceiverReady(wordpressConfig))
  ) {
    throw new Error("Test this WordPress receiver before sending fixes.");
  }

  const provider = integration.provider as AutomationProvider | string;
  const payload = buildLinkFixAutomationPayload({
    anchorText: fix.anchorText,
    brokenUrl: fix.brokenUrl,
    callbackUrl:
      integration.provider === "WORDPRESS_RECEIVER"
        ? buildWordPressStatusCallbackUrl(input.callbackOrigin)
        : undefined,
    domain: fix.domain.domain,
    fixId: fix.id,
    manualInstructions: fix.manualInstructions,
    provider,
    sourceUrl: fix.sourceUrl,
    status: fix.status,
    suggestedUrl: fix.suggestedUrl,
  });
  const response = await fetch(webhookUrl, {
    body: JSON.stringify(payload),
    headers: buildDeliveryHeaders({
      provider: integration.provider,
      receiverKey: wordpressConfig?.receiverKey,
    }),
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

export async function confirmWordPressLinkFixStatus(input: {
  fixId: string;
  postId?: string;
  receiverKey: string;
  status: string;
}) {
  const fix = await getPrisma().linkFixSuggestion.findUnique({
    where: { id: input.fixId },
    include: {
      domain: {
        include: {
          integrations: {
            where: { provider: "WORDPRESS_RECEIVER", status: "CONNECTED" },
          },
        },
      },
    },
  });

  if (!fix) {
    throw new Error("Fix suggestion not found.");
  }

  const receiver = fix.domain.integrations.find(
    (integration) => integration.domainId === fix.domainId,
  );
  const receiverConfig = readWordPressReceiverConfig(receiver?.configJson);

  if (
    !receiver ||
    !receiverConfig.receiverKey ||
    receiverConfig.receiverKey !== input.receiverKey
  ) {
    throw new Error("WordPress callback was not authorized.");
  }

  const normalizedStatus = input.status.toUpperCase();

  if (normalizedStatus !== "APPLIED") {
    return { crawlRunId: null, updated: false };
  }

  await getPrisma().linkFixSuggestion.update({
    where: { id: fix.id },
    data: {
      appliedAt: new Date(),
      status: "APPLIED",
      verificationCheckedAt: null,
      verificationCrawlRunId: null,
      verificationMessage: "Waiting for the next crawl to verify this fix.",
      verificationStatus: "PENDING",
    },
  });

  const existingPendingRun = await getPrisma().crawlRun.findFirst({
    where: {
      domainId: fix.domainId,
      status: { in: ["QUEUED", "RUNNING"] },
    },
    select: { id: true },
  });

  if (existingPendingRun) {
    return { crawlRunId: existingPendingRun.id, updated: true };
  }

  const crawlRun = await getPrisma().crawlRun.create({
    data: {
      domainId: fix.domainId,
      status: "QUEUED",
      trigger: "SYSTEM",
    },
    select: { id: true },
  });

  await enqueueCrawlRunJob({
    crawlRunId: crawlRun.id,
    workspaceId: fix.workspaceId,
  });

  return { crawlRunId: crawlRun.id, updated: true };
}

export async function reconcileLinkFixVerificationForCrawlRun(
  crawlRunId: string,
) {
  const crawlRun = await getPrisma().crawlRun.findUnique({
    where: { id: crawlRunId },
    select: { domainId: true, id: true, status: true },
  });

  if (!crawlRun || crawlRun.status !== "COMPLETED") {
    return { checked: 0 };
  }

  const fixes = await getPrisma().linkFixSuggestion.findMany({
    where: {
      domainId: crawlRun.domainId,
      status: "APPLIED",
      verificationStatus: "PENDING",
    },
  });
  let checked = 0;

  for (const fix of fixes) {
    const result = await verifyAppliedLinkFix({
      brokenUrl: fix.brokenUrl,
      crawlRunId: crawlRun.id,
      sourcePageId: fix.sourcePageId,
      suggestedUrl: fix.suggestedUrl,
    });

    if (!result) {
      continue;
    }

    await getPrisma().linkFixSuggestion.update({
      where: { id: fix.id },
      data: {
        verificationCheckedAt: new Date(),
        verificationCrawlRunId: crawlRun.id,
        verificationMessage: result.message,
        verificationStatus: result.status,
      },
    });
    checked += 1;
  }

  return { checked };
}

function buildDeliveryHeaders({
  provider,
  receiverKey,
}: {
  provider: string;
  receiverKey?: string;
}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (provider === "WORDPRESS_RECEIVER" && receiverKey) {
    headers["X-All-In-One-SEO-Key"] = receiverKey;
  }

  return headers;
}

async function verifyAppliedLinkFix({
  brokenUrl,
  crawlRunId,
  sourcePageId,
  suggestedUrl,
}: {
  brokenUrl: string | null;
  crawlRunId: string;
  sourcePageId: string | null;
  suggestedUrl: string;
}): Promise<{
  message: string;
  status: LinkFixVerificationStatus;
} | null> {
  if (!sourcePageId) {
    return {
      message: "Source page is no longer mapped, so verification needs review.",
      status: "STILL_FAILING",
    };
  }

  const crawledSource = await getPrisma().pageLink.findFirst({
    where: { crawlRunId, sourcePageId },
    select: { id: true },
  });

  if (!crawledSource) {
    return null;
  }

  if (brokenUrl) {
    const brokenLink = await getPrisma().pageLink.findFirst({
      where: {
        crawlRunId,
        normalizedUrl: brokenUrl,
        sourcePageId,
      },
      select: { statusCode: true },
    });

    if (!brokenLink) {
      return {
        message:
          "The previous broken URL was not found on the crawled source page.",
        status: "VERIFIED_FIXED",
      };
    }

    if (brokenLink.statusCode && brokenLink.statusCode < 400) {
      return {
        message: "The previous URL is now returning a healthy status.",
        status: "VERIFIED_FIXED",
      };
    }

    return {
      message: `The broken URL still appears on the source page${
        brokenLink.statusCode ? ` with HTTP ${brokenLink.statusCode}` : ""
      }.`,
      status: "STILL_FAILING",
    };
  }

  const suggestedLink = await getPrisma().pageLink.findFirst({
    where: {
      crawlRunId,
      normalizedUrl: suggestedUrl,
      sourcePageId,
    },
    select: { id: true, statusCode: true },
  });

  if (
    suggestedLink &&
    (!suggestedLink.statusCode || suggestedLink.statusCode < 400)
  ) {
    return {
      message:
        "The suggested internal link was found on the crawled source page.",
      status: "VERIFIED_FIXED",
    };
  }

  return {
    message:
      "The suggested internal link was not found on the crawled source page.",
    status: "STILL_FAILING",
  };
}

function buildWordPressStatusCallbackUrl(origin?: string) {
  const appOrigin =
    origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`);

  if (!appOrigin) {
    return "";
  }

  return `${appOrigin.replace(/\/$/, "")}/api/integrations/wordpress/link-fix-status`;
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

function buildEmptyVerificationCounts() {
  return {
    NOT_CHECKED: 0,
    PENDING: 0,
    STILL_FAILING: 0,
    VERIFIED_FIXED: 0,
  } satisfies Record<LinkFixVerificationStatus, number>;
}

function buildCountsFromGroup(
  counts: Record<LinkFixStatus, number>,
  group: { status: LinkFixStatus; _count: { _all: number } },
) {
  counts[group.status] = group._count._all;
  return counts;
}

function buildVerificationCountsFromGroup(
  counts: Record<LinkFixVerificationStatus, number>,
  group: {
    verificationStatus: LinkFixVerificationStatus;
    _count: { _all: number };
  },
) {
  counts[group.verificationStatus] = group._count._all;
  return counts;
}

import { createHash } from "node:crypto";
import { Prisma, RecommendationType } from "@prisma/client";
import { assertCanUseAi, getAiUsageLimit } from "@/lib/billing";
import { getPrisma } from "@/lib/prisma";
import {
  calculateTemplatePriority,
  getTemplateLabel,
  inferPageTemplate,
} from "@/lib/template-detection";
import { getPrimaryWorkspace } from "@/lib/workspace";

const defaultModel = process.env.AI_MODEL ?? "gpt-4.1-mini";
const fallbackMonthlyQuota = Number(process.env.AI_MONTHLY_QUOTA ?? 250);

type RecommendationPayload = {
  title: string;
  summary: string;
  suggestedValue?: string;
  rationale: string;
  implementation?: string;
  cmsInstructions?: Record<string, string>;
};

type TemplateFixBriefGroup = {
  domainId: string;
  domain: string;
  clientName: string | null;
  templateKey: string;
  label: string;
  issueCount: number;
  pageCount: number;
  criticalCount: number;
  warningCount: number;
  priorityScore: number;
  representativeIssueId: string;
  recommendations: Array<{
    id: string;
    type: RecommendationType;
    createdAt: Date;
  }>;
};

export async function getAiRecommendationCenterData() {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      workspace: null,
      pages: [],
      issues: [],
      templateIssueGroups: [],
      recommendations: [],
      usage: { used: 0, quota: fallbackMonthlyQuota },
    };
  }

  const monthStart = getMonthStart();
  const [pages, issues, templateIssues, recommendations, used, quota] =
    await Promise.all([
      getPrisma().page.findMany({
        where: { domain: { workspaceId: workspace.id } },
        include: {
          domain: { include: { client: true } },
          snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
          recommendations: { orderBy: { createdAt: "desc" }, take: 3 },
        },
        orderBy: [{ lastCrawledAt: "desc" }, { updatedAt: "desc" }],
        take: 25,
      }),
      getPrisma().seoIssue.findMany({
        where: { workspaceId: workspace.id, status: { not: "FIXED" } },
        include: {
          domain: true,
          page: true,
          recommendations: { orderBy: { createdAt: "desc" }, take: 3 },
        },
        orderBy: [
          { severity: "asc" },
          { priorityScore: "desc" },
          { lastDetectedAt: "desc" },
        ],
        take: 25,
      }),
      getPrisma().seoIssue.findMany({
        where: {
          workspaceId: workspace.id,
          pageId: { not: null },
          status: { not: "FIXED" },
        },
        include: {
          domain: { include: { client: true } },
          page: true,
          recommendations: {
            where: { type: { in: ["FIX_BRIEF", "CMS_FIX_BRIEF"] } },
            orderBy: { createdAt: "desc" },
            take: 3,
          },
        },
        orderBy: [
          { severity: "asc" },
          { priorityScore: "desc" },
          { lastDetectedAt: "desc" },
        ],
      }),
      getPrisma().seoRecommendation.findMany({
        where: {
          OR: [
            { page: { domain: { workspaceId: workspace.id } } },
            { issue: { workspaceId: workspace.id } },
          ],
        },
        include: {
          page: { include: { domain: true } },
          issue: { include: { domain: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 30,
      }),
      getPrisma().aiUsageEvent.count({
        where: { workspaceId: workspace.id, createdAt: { gte: monthStart } },
      }),
      getAiUsageLimit(workspace.id),
    ]);

  return {
    workspace,
    pages,
    issues,
    templateIssueGroups: buildTemplateFixBriefGroups(templateIssues).slice(
      0,
      12,
    ),
    recommendations,
    usage: { used, quota },
  };
}

export async function generatePageSeoRecommendations(pageId: string) {
  const page = await getPrisma().page.findUnique({
    where: { id: pageId },
    include: {
      domain: true,
      snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  if (!page) {
    throw new Error("Page not found.");
  }

  await assertAiQuota(page.domain.workspaceId);

  const snapshot = page.snapshots.at(0);
  const input = {
    url: page.url,
    domain: page.domain.domain,
    title: snapshot?.title,
    metaDescription: snapshot?.metaDescription,
    h1: snapshot?.h1,
    wordCount: snapshot?.wordCount,
    metadata: snapshot?.metadataJson,
  };
  const inputHash = hashInput(input);
  const existing = await getCachedRecommendations({
    pageId,
    inputHash,
    types: [
      "TITLE",
      "META_DESCRIPTION",
      "H1",
      "SCHEMA",
      "INTERNAL_LINKING",
      "CONTENT_GAP",
    ],
  });

  if (existing.length === 6) {
    return existing;
  }

  const payload = await completeJson({
    workspaceId: page.domain.workspaceId,
    feature: "page_seo_recommendations",
    inputHash,
    system:
      "You are an expert technical SEO strategist. Return concise JSON only.",
    prompt: `Suggest an improved title, meta description, and H1 for this page. Input: ${JSON.stringify(input)}`,
    fallback: buildLocalPageRecommendations(input),
  });

  return Promise.all([
    upsertRecommendation({
      pageId,
      inputHash,
      type: "TITLE",
      payload: payload.title,
    }),
    upsertRecommendation({
      pageId,
      inputHash,
      type: "META_DESCRIPTION",
      payload: payload.metaDescription,
    }),
    upsertRecommendation({
      pageId,
      inputHash,
      type: "H1",
      payload: payload.h1,
    }),
    upsertRecommendation({
      pageId,
      inputHash,
      type: "SCHEMA",
      payload: payload.schema,
    }),
    upsertRecommendation({
      pageId,
      inputHash,
      type: "INTERNAL_LINKING",
      payload: payload.internalLinking,
    }),
    upsertRecommendation({
      pageId,
      inputHash,
      type: "CONTENT_GAP",
      payload: payload.contentGap,
    }),
  ]);
}

export async function generateIssueAiRecommendations(issueId: string) {
  const issue = await getPrisma().seoIssue.findUnique({
    where: { id: issueId },
    include: { domain: true, page: true },
  });

  if (!issue) {
    throw new Error("Issue not found.");
  }

  await assertAiQuota(issue.workspaceId);

  const input = {
    title: issue.title,
    issueType: issue.issueType,
    severity: issue.severity,
    description: issue.description,
    recommendation: issue.recommendation,
    domain: issue.domain.domain,
    pageUrl: issue.page?.url,
    platform: issue.domain.platform,
  };
  const inputHash = hashInput(input);
  const existing = await getCachedRecommendations({
    issueId,
    inputHash,
    types: ["ISSUE_EXPLANATION", "FIX_BRIEF", "CMS_FIX_BRIEF"],
  });

  if (existing.length === 3) {
    return existing;
  }

  const payload = await completeJson({
    workspaceId: issue.workspaceId,
    feature: "issue_fix_recommendations",
    inputHash,
    system: "You are an expert SEO operations lead. Return concise JSON only.",
    prompt: `Explain this SEO issue, create a developer fix brief, and provide CMS-specific instructions for WordPress, Shopify, Webflow, and custom sites. Input: ${JSON.stringify(input)}`,
    fallback: buildLocalIssueRecommendations(input),
  });

  return Promise.all([
    upsertRecommendation({
      issueId,
      inputHash,
      type: "ISSUE_EXPLANATION",
      payload: payload.explanation,
    }),
    upsertRecommendation({
      issueId,
      inputHash,
      type: "FIX_BRIEF",
      payload: payload.developerBrief,
    }),
    upsertRecommendation({
      issueId,
      inputHash,
      type: "CMS_FIX_BRIEF",
      payload: payload.cmsBrief,
    }),
  ]);
}

export async function generateTemplateAiFixBrief(input: {
  domainId: string;
  templateKey: string;
}) {
  const domain = await getPrisma().domain.findUnique({
    where: { id: input.domainId },
    include: {
      client: true,
      issues: {
        where: {
          pageId: { not: null },
          status: { not: "FIXED" },
        },
        include: {
          page: {
            include: {
              snapshots: { orderBy: { createdAt: "desc" }, take: 1 },
            },
          },
        },
        orderBy: [
          { severity: "asc" },
          { priorityScore: "desc" },
          { lastDetectedAt: "desc" },
        ],
      },
    },
  });

  if (!domain) {
    throw new Error("Domain not found.");
  }

  await assertAiQuota(domain.workspaceId);

  const templateIssues = domain.issues.filter(
    (issue) =>
      issue.page && inferPageTemplate(issue.page) === input.templateKey,
  );

  if (!templateIssues.length) {
    throw new Error("No active issues found for this template.");
  }

  const representativeIssue = templateIssues[0];
  const affectedPages = Array.from(
    new Map(
      templateIssues
        .filter((issue) => issue.page)
        .map((issue) => [issue.pageId, issue.page]),
    ).values(),
  );
  const groupedIssueTypes = summarizeIssueTypes(templateIssues);
  const briefInput = {
    domain: domain.domain,
    client: domain.client?.name ?? null,
    platform: domain.platform,
    templateKey: input.templateKey,
    templateLabel: getTemplateLabel(input.templateKey),
    pageCount: affectedPages.length,
    issueCount: templateIssues.length,
    criticalCount: templateIssues.filter(
      (issue) => issue.severity === "CRITICAL",
    ).length,
    warningCount: templateIssues.filter((issue) => issue.severity === "WARNING")
      .length,
    issueTypes: groupedIssueTypes,
    samplePages: affectedPages.slice(0, 5).map((page) => ({
      url: page?.url,
      title: page?.snapshots.at(0)?.title,
      h1: page?.snapshots.at(0)?.h1,
    })),
  };
  const inputHash = hashInput(briefInput);
  const existing = await getCachedRecommendations({
    issueId: representativeIssue.id,
    inputHash,
    types: ["FIX_BRIEF", "CMS_FIX_BRIEF"],
  });

  if (existing.length === 2) {
    return existing;
  }

  const payload = await completeJson({
    workspaceId: domain.workspaceId,
    feature: "template_fix_brief",
    inputHash,
    system: "You are an expert SEO operations lead. Return concise JSON only.",
    prompt: `Create one template-level developer fix brief and one CMS-specific fix brief for this grouped SEO pattern. Focus on fixing the underlying route, CMS collection template, or theme component, not individual pages. Input: ${JSON.stringify(briefInput)}`,
    fallback: buildLocalTemplateFixBriefs(briefInput),
  });

  return Promise.all([
    upsertRecommendation({
      issueId: representativeIssue.id,
      inputHash,
      type: "FIX_BRIEF",
      payload: payload.developerBrief,
    }),
    upsertRecommendation({
      issueId: representativeIssue.id,
      inputHash,
      type: "CMS_FIX_BRIEF",
      payload: payload.cmsBrief,
    }),
  ]);
}

async function completeJson({
  fallback,
  feature,
  inputHash,
  prompt,
  system,
  workspaceId,
}: {
  fallback: Record<string, RecommendationPayload>;
  feature: string;
  inputHash: string;
  prompt: string;
  system: string;
  workspaceId: string;
}) {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    await recordAiUsage({
      workspaceId,
      provider: "LOCAL_RULES",
      model: "deterministic-seo-v1",
      feature,
      inputHash,
      prompt,
      completion: JSON.stringify(fallback),
    });
    return fallback;
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: defaultModel,
      input: [
        { role: "system", content: system },
        { role: "user", content: prompt },
      ],
      text: { format: { type: "json_object" } },
    }),
  });

  if (!response.ok) {
    await recordAiUsage({
      workspaceId,
      provider: "OPENAI",
      model: defaultModel,
      feature,
      inputHash,
      prompt,
      completion: JSON.stringify(fallback),
    });
    return fallback;
  }

  const data = await response.json();
  const content = extractResponseText(data);
  const parsed = validateRecommendationPayloads(
    parseJsonObject(content),
    fallback,
  );

  await recordAiUsage({
    workspaceId,
    provider: "OPENAI",
    model: defaultModel,
    feature,
    inputHash,
    prompt,
    completion: content,
  });

  return parsed as Record<string, RecommendationPayload>;
}

async function assertAiQuota(workspaceId: string) {
  await assertCanUseAi(workspaceId);
}

async function recordAiUsage(input: {
  workspaceId: string;
  provider: string;
  model: string;
  feature: string;
  inputHash: string;
  prompt: string;
  completion: string;
}) {
  await getPrisma().aiUsageEvent.create({
    data: {
      workspaceId: input.workspaceId,
      provider: input.provider,
      model: input.model,
      feature: input.feature,
      inputHash: input.inputHash,
      promptTokens: estimateTokens(input.prompt),
      completionTokens: estimateTokens(input.completion),
    },
  });
}

async function getCachedRecommendations(input: {
  pageId?: string;
  issueId?: string;
  inputHash: string;
  types: RecommendationType[];
}) {
  return getPrisma().seoRecommendation.findMany({
    where: {
      pageId: input.pageId,
      issueId: input.issueId,
      inputHash: input.inputHash,
      type: { in: input.types },
    },
    orderBy: { createdAt: "desc" },
  });
}

async function upsertRecommendation(input: {
  pageId?: string;
  issueId?: string;
  inputHash: string;
  type: RecommendationType;
  payload: RecommendationPayload;
}) {
  const existing = await getPrisma().seoRecommendation.findFirst({
    where: {
      pageId: input.pageId,
      issueId: input.issueId,
      inputHash: input.inputHash,
      type: input.type,
    },
  });

  const data = {
    pageId: input.pageId,
    issueId: input.issueId,
    inputHash: input.inputHash,
    type: input.type,
    recommendationJson: input.payload as unknown as Prisma.InputJsonValue,
  };

  if (existing) {
    return getPrisma().seoRecommendation.update({
      where: { id: existing.id },
      data,
    });
  }

  return getPrisma().seoRecommendation.create({ data });
}

export function buildLocalPageRecommendations(input: {
  url: string;
  domain: string;
  title?: string | null;
  metaDescription?: string | null;
  h1?: string | null;
  metadata?: unknown;
}) {
  const topic = inferTopic(input.url, input.domain);

  return {
    title: {
      title: "SEO title suggestion",
      summary:
        "Use a specific, search-friendly title with the primary topic and brand.",
      suggestedValue: `${topic} | ${input.domain}`,
      rationale:
        "Clear page titles improve relevance and click-through from search results.",
    },
    metaDescription: {
      title: "Meta description suggestion",
      summary:
        "Add a concise description that states the page value and next action.",
      suggestedValue: `Explore ${topic.toLowerCase()} from ${input.domain}. Clear details, helpful context, and a simple next step for visitors.`,
      rationale:
        "Descriptions do not directly rank pages, but they influence search snippets and clicks.",
    },
    h1: {
      title: "H1 suggestion",
      summary:
        "Use one plain-language H1 aligned with the page's search intent.",
      suggestedValue: topic,
      rationale:
        "A clear H1 helps users and crawlers understand the page topic quickly.",
    },
    schema: {
      title: "Schema recommendation",
      summary: `Add structured data that matches the ${topic.toLowerCase()} page intent.`,
      suggestedValue: chooseSchemaType(input.url),
      implementation:
        "Add JSON-LD in the rendered HTML and validate it with a structured data testing tool before recrawling.",
      rationale:
        "Relevant structured data helps search engines understand entities, breadcrumbs, products, articles, and organization details.",
    },
    internalLinking: {
      title: "Internal linking recommendation",
      summary: `Link to this page from relevant hub, navigation, or related content pages using descriptive anchor text for ${topic.toLowerCase()}.`,
      implementation:
        "Add contextual links from high-authority pages and ensure the target URL is crawlable, canonical, and present in sitemap where appropriate.",
      rationale:
        "Internal links improve discovery, distribute authority, and clarify topical relationships across the site.",
    },
    contentGap: {
      title: "Content gap recommendation",
      summary: `Expand the page with missing proof points, FAQs, comparisons, examples, or next-step content around ${topic.toLowerCase()}.`,
      implementation:
        "Review competing search results, add sections that answer unresolved user questions, and refresh metadata after the copy changes.",
      rationale:
        "Closing content gaps improves usefulness and gives the page more complete coverage of its search intent.",
    },
  };
}

export function buildLocalIssueRecommendations(input: {
  title: string;
  description: string;
  recommendation: string | null;
  platform: string;
}) {
  const baseRecommendation =
    input.recommendation ??
    "Review the affected page and update the SEO configuration.";

  return {
    explanation: {
      title: "Plain-language issue explanation",
      summary: input.description,
      rationale:
        "This issue can reduce crawlability, indexability, relevance, or search result click-through depending on the affected page.",
    },
    developerBrief: {
      title: "Developer fix brief",
      summary: baseRecommendation,
      implementation:
        "Locate the affected template or route, update the SEO fields, verify rendered HTML, and rerun the crawl to confirm the issue is fixed.",
      rationale:
        "Fixing the rendered output ensures both crawlers and users see the corrected page state.",
    },
    cmsBrief: {
      title: "CMS-specific fix brief",
      summary: `Recommended workflow for ${input.platform.toLowerCase()} and common CMS setups.`,
      cmsInstructions: {
        WordPress:
          "Edit the page SEO panel in the SEO plugin, update the affected field, clear cache, and preview the rendered page.",
        Shopify:
          "Update the product, collection, page, or theme SEO fields, then confirm the storefront HTML renders the change.",
        Webflow:
          "Edit page settings or collection template SEO fields, publish, and verify the live page source.",
        Custom:
          "Update the route metadata or template component, deploy, and verify with a fresh crawl.",
      },
      rationale:
        "CMS-specific instructions make fixes easier to delegate without losing technical accuracy.",
    },
  };
}

export function buildLocalTemplateFixBriefs(input: {
  domain: string;
  platform: string;
  templateKey: string;
  templateLabel: string;
  pageCount: number;
  issueCount: number;
  criticalCount: number;
  warningCount: number;
  issueTypes: Array<{ issueType: string; count: number }>;
}) {
  const issueSummary = input.issueTypes
    .slice(0, 4)
    .map((issue) => `${formatIssueType(issue.issueType)} (${issue.count})`)
    .join(", ");
  const scope = `${input.templateLabel} template on ${input.domain}`;

  return {
    developerBrief: {
      title: `${input.templateLabel} template fix brief`,
      summary: `${scope} has ${input.issueCount} active issues across ${input.pageCount} pages. Main patterns: ${issueSummary || "mixed SEO issues"}.`,
      implementation:
        "Fix the shared route, layout, CMS collection template, or theme component that renders this page group. Update metadata, headings, schema, canonicals, robots directives, and shared internal links at the template level, then recrawl representative pages before closing individual issues.",
      rationale:
        "A template-level fix resolves repeated SEO defects once and prevents the same issue from returning on newly published pages using this pattern.",
    },
    cmsBrief: {
      title: `${input.templateLabel} CMS workflow`,
      summary: `Recommended workflow for ${input.platform.toLowerCase()} and shared template-driven pages.`,
      cmsInstructions: {
        WordPress:
          "Review the theme template, page builder layout, archive template, or SEO plugin defaults for this content type. Update shared SEO fields and schema settings, clear cache, then verify several affected URLs.",
        Shopify:
          "Update the product, collection, article, or theme Liquid template responsible for this group. Publish the theme change and verify rendered storefront HTML on sample URLs.",
        Webflow:
          "Edit the CMS Collection Template settings, dynamic SEO fields, schema embed, and heading structure. Publish and verify sample collection items.",
        Custom:
          "Update the route metadata factory, shared page component, layout, or serializer for this template. Deploy and verify sample rendered HTML before recrawling.",
      },
      rationale:
        "Template-aware CMS instructions let teams fix the source pattern instead of touching pages one at a time.",
    },
  };
}

function buildTemplateFixBriefGroups(
  issues: Array<{
    id: string;
    severity: string;
    priorityScore: number;
    issueType: string;
    domain: {
      id: string;
      domain: string;
      client: { name: string } | null;
    };
    page: { id: string; url: string; pageType: string | null } | null;
    recommendations: Array<{
      id: string;
      type: RecommendationType;
      createdAt: Date;
    }>;
  }>,
): TemplateFixBriefGroup[] {
  const groups = new Map<string, TemplateFixBriefGroup>();

  for (const issue of issues) {
    if (!issue.page) {
      continue;
    }

    const templateKey = inferPageTemplate(issue.page);
    const groupKey = `${issue.domain.id}:${templateKey}`;
    const existing =
      groups.get(groupKey) ??
      ({
        domainId: issue.domain.id,
        domain: issue.domain.domain,
        clientName: issue.domain.client?.name ?? null,
        templateKey,
        label: getTemplateLabel(templateKey),
        issueCount: 0,
        pageCount: 0,
        criticalCount: 0,
        warningCount: 0,
        priorityScore: 0,
        representativeIssueId: issue.id,
        recommendations: [],
      } satisfies TemplateFixBriefGroup);

    existing.issueCount += 1;
    existing.criticalCount += issue.severity === "CRITICAL" ? 1 : 0;
    existing.warningCount += issue.severity === "WARNING" ? 1 : 0;
    existing.priorityScore = Math.max(
      existing.priorityScore,
      issue.priorityScore,
      calculateTemplatePriority({
        criticalCount: existing.criticalCount,
        warningCount: existing.warningCount,
        issueCount: existing.issueCount,
        pageCount: existing.pageCount + 1,
      }),
    );

    if (!existing.recommendations.length && issue.recommendations.length) {
      existing.recommendations = issue.recommendations;
    }

    groups.set(groupKey, existing);
  }

  const pagesByGroup = new Map<string, Set<string>>();
  for (const issue of issues) {
    if (!issue.page) {
      continue;
    }

    const templateKey = inferPageTemplate(issue.page);
    const groupKey = `${issue.domain.id}:${templateKey}`;
    const pages = pagesByGroup.get(groupKey) ?? new Set<string>();
    pages.add(issue.page.id);
    pagesByGroup.set(groupKey, pages);
  }

  for (const [groupKey, pages] of pagesByGroup.entries()) {
    const group = groups.get(groupKey);
    if (group) {
      group.pageCount = pages.size;
      group.priorityScore = calculateTemplatePriority(group);
    }
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.priorityScore - a.priorityScore || b.issueCount - a.issueCount,
  );
}

function summarizeIssueTypes(issues: Array<{ issueType: string }>) {
  const counts = new Map<string, number>();

  for (const issue of issues) {
    counts.set(issue.issueType, (counts.get(issue.issueType) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([issueType, count]) => ({ issueType, count }))
    .sort(
      (a, b) => b.count - a.count || a.issueType.localeCompare(b.issueType),
    );
}

function inferTopic(url: string, domain: string) {
  const pathname = new URL(url).pathname;
  const segment = pathname
    .split("/")
    .filter(Boolean)
    .at(-1)
    ?.replaceAll("-", " ");

  if (!segment) {
    return `${domain} SEO landing page`;
  }

  return segment.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatIssueType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function validateRecommendationPayloads(
  value: unknown,
  fallback: Record<string, RecommendationPayload>,
) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return fallback;
  }

  const result: Record<string, RecommendationPayload> = {};

  for (const [key, fallbackPayload] of Object.entries(fallback)) {
    const candidate = (value as Record<string, unknown>)[key];
    result[key] = isSafeRecommendationPayload(candidate)
      ? candidate
      : fallbackPayload;
  }

  return result;
}

function isSafeRecommendationPayload(
  value: unknown,
): value is RecommendationPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  const payload = value as Partial<RecommendationPayload>;

  return (
    isSafeText(payload.title) &&
    isSafeText(payload.summary) &&
    isSafeText(payload.rationale) &&
    (payload.suggestedValue === undefined ||
      isSafeText(payload.suggestedValue)) &&
    (payload.implementation === undefined || isSafeText(payload.implementation))
  );
}

function isSafeText(value: unknown) {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= 4000 &&
    !/<script[\s>]/i.test(value)
  );
}

function chooseSchemaType(url: string) {
  const normalizedUrl = url.toLowerCase();

  if (
    normalizedUrl.includes("/products/") ||
    normalizedUrl.includes("/product/")
  ) {
    return "Product";
  }

  if (
    normalizedUrl.includes("/blog/") ||
    normalizedUrl.includes("/articles/")
  ) {
    return "Article";
  }

  return "WebPage, BreadcrumbList, Organization";
}

function extractResponseText(data: unknown) {
  if (
    data &&
    typeof data === "object" &&
    "output_text" in data &&
    typeof data.output_text === "string"
  ) {
    return data.output_text;
  }

  return JSON.stringify(data);
}

function parseJsonObject(value: string) {
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function hashInput(input: unknown) {
  return createHash("sha256").update(JSON.stringify(input)).digest("hex");
}

function estimateTokens(value: string) {
  return Math.ceil(value.length / 4);
}

function getMonthStart() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

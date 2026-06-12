import { randomBytes } from "crypto";
import { resolveTxt } from "node:dns/promises";
import {
  Prisma,
  type PrismaClient,
  type ReportScheduleFrequency,
} from "@prisma/client";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { formatCrawlRunChangeValue } from "@/lib/crawl-run-display-labels";
import { formatProductReportTitle } from "@/lib/product-copy";
import {
  buildPublicReportAccessWhere,
  buildWorkspaceIsolationWhere,
} from "@/lib/security";
import { formatWebsiteHealth } from "@/lib/website-display-labels";
import { getPrimaryWorkspace } from "@/lib/workspace";

const reportDetailInclude = Prisma.validator<Prisma.ReportInclude>()({
  client: {
    include: {
      domains: {
        include: {
          scoreHistory: { orderBy: { createdAt: "desc" }, take: 2 },
          crawlRuns: { orderBy: { createdAt: "desc" }, take: 3 },
          pages: { select: { id: true } },
          issues: {
            include: { page: true, assignedTo: true },
            orderBy: [
              { severity: "asc" },
              { priorityScore: "desc" },
              { lastDetectedAt: "desc" },
            ],
          },
          changeEvents: {
            include: { page: true },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
        },
        orderBy: { domain: "asc" },
      },
      reportWhiteLabelDomains: {
        where: { status: "VERIFIED" },
        orderBy: { verifiedAt: "desc" },
        take: 1,
      },
    },
  },
  domain: {
    include: {
      client: {
        include: {
          reportWhiteLabelDomains: {
            where: { status: "VERIFIED" },
            orderBy: { verifiedAt: "desc" },
            take: 1,
          },
        },
      },
      scoreHistory: { orderBy: { createdAt: "desc" }, take: 2 },
      crawlRuns: { orderBy: { createdAt: "desc" }, take: 3 },
      pages: { select: { id: true } },
      issues: {
        include: { page: true, assignedTo: true },
        orderBy: [
          { severity: "asc" },
          { priorityScore: "desc" },
          { lastDetectedAt: "desc" },
        ],
      },
      changeEvents: {
        include: { page: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  },
  template: true,
  workspace: {
    include: {
      reportWhiteLabelDomains: {
        where: { status: "VERIFIED" },
        orderBy: { verifiedAt: "desc" },
        take: 1,
      },
    },
  },
});

export const REPORT_WHITE_LABEL_RECORD_NAME = "@";
export const REPORT_WHITE_LABEL_PREFIX = "allinone-seo-report-domain";

const defaultReportSections = {
  healthScore: true,
  crawlSummary: true,
  issueMovement: true,
  changeSummary: true,
  priorityRecommendations: true,
} as const;

type ReportSectionKey = keyof typeof defaultReportSections;

export type ReportDetail = Prisma.ReportGetPayload<{
  include: typeof reportDetailInclude;
}>;

export async function getReportListData() {
  if (!hasDatabaseUrl()) {
    return {
      workspace: null,
      clients: [],
      domains: [],
      reports: [],
      schedules: [],
      templates: [],
      whiteLabelDomains: [],
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      workspace: null,
      clients: [],
      domains: [],
      reports: [],
      schedules: [],
      templates: [],
      whiteLabelDomains: [],
    };
  }

  const [clients, domains, reports, schedules, templates, whiteLabelDomains] =
    await Promise.all([
      getPrisma().client.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { name: "asc" },
      }),
      getPrisma().domain.findMany({
        where: { workspaceId: workspace.id },
        include: { client: true },
        orderBy: { domain: "asc" },
      }),
      getPrisma().report.findMany({
        where: { workspaceId: workspace.id },
        include: { client: true, domain: true, template: true },
        orderBy: { createdAt: "desc" },
      }),
      getPrisma().reportSchedule.findMany({
        where: { workspaceId: workspace.id },
        include: { client: true, domain: true, template: true },
        orderBy: [{ enabled: "desc" }, { nextRunAt: "asc" }],
      }),
      getPrisma().reportTemplate.findMany({
        where: { workspaceId: workspace.id },
        include: { client: true },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      }),
      getPrisma().reportWhiteLabelDomain.findMany({
        where: { workspaceId: workspace.id },
        include: { client: true },
        orderBy: [{ status: "asc" }, { hostname: "asc" }],
      }),
    ]);

  return {
    workspace,
    clients,
    domains,
    reports,
    schedules,
    templates,
    whiteLabelDomains,
  };
}

export async function getReportDetailData(reportId: string) {
  if (!hasDatabaseUrl()) {
    return { workspace: null, report: null, summary: null };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, report: null, summary: null };
  }

  const report = await getPrisma().report.findFirst({
    where: buildWorkspaceIsolationWhere(workspace.id, { id: reportId }),
    include: reportDetailInclude,
  });

  return {
    workspace,
    report,
    summary: report ? buildReportSummary(report) : null,
  };
}

export async function getPublicReportData(shareToken: string) {
  if (!hasDatabaseUrl()) {
    return { report: null, summary: null };
  }

  const report = await getPrisma().report.findFirst({
    where: buildPublicReportAccessWhere(shareToken),
    include: reportDetailInclude,
  });

  return {
    report,
    summary: report ? buildReportSummary(report) : null,
  };
}

export async function createReport({
  clientId,
  domainId,
  periodEnd,
  periodStart,
  templateId,
  title,
}: {
  clientId?: string;
  domainId?: string;
  periodEnd: Date;
  periodStart: Date;
  templateId?: string;
  title: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before generating reports.");
  }

  return getPrisma().report.create({
    data: {
      workspaceId: workspace.id,
      clientId,
      domainId,
      templateId,
      title,
      status: "GENERATED",
      periodStart,
      periodEnd,
      shareToken: randomToken(),
    },
  });
}

export async function createReportSchedule({
  clientId,
  domainId,
  frequency,
  templateId,
  title,
}: {
  clientId?: string;
  domainId?: string;
  frequency: ReportScheduleFrequency;
  templateId?: string;
  title: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before scheduling reports.");
  }

  return getPrisma().reportSchedule.create({
    data: {
      workspaceId: workspace.id,
      clientId,
      domainId,
      templateId,
      title,
      frequency,
      nextRunAt: calculateNextRunAt(frequency, new Date()),
    },
  });
}

export async function createReportTemplate({
  clientId,
  description,
  name,
  sections,
}: {
  clientId?: string;
  description?: string;
  name: string;
  sections: string[];
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before creating report templates.");
  }

  return getPrisma().reportTemplate.create({
    data: {
      workspaceId: workspace.id,
      clientId,
      name,
      description,
      sectionsJson: buildReportSections(sections) as Prisma.InputJsonObject,
    },
  });
}

export async function createReportWhiteLabelDomain({
  clientId,
  hostname,
}: {
  clientId?: string;
  hostname: string;
}) {
  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    throw new Error("Create a workspace before adding white-label domains.");
  }

  return getPrisma().reportWhiteLabelDomain.create({
    data: {
      workspaceId: workspace.id,
      clientId,
      hostname: normalizeReportHostname(hostname),
      verificationToken: randomToken(),
      status: "PENDING",
    },
  });
}

export async function verifyReportWhiteLabelDomain(whiteLabelDomainId: string) {
  const prisma = getPrisma();
  const whiteLabelDomain = await prisma.reportWhiteLabelDomain.findUnique({
    where: { id: whiteLabelDomainId },
  });

  if (!whiteLabelDomain) {
    throw new Error("White-label domain not found.");
  }

  const expectedValue = formatReportWhiteLabelVerificationValue(
    whiteLabelDomain.verificationToken,
  );
  const records = await resolveTxt(whiteLabelDomain.hostname).catch(() => []);
  const flattenedRecords = records.map((record) => record.join(""));
  const isVerified = flattenedRecords.includes(expectedValue);

  return prisma.reportWhiteLabelDomain.update({
    where: { id: whiteLabelDomain.id },
    data: {
      status: isVerified ? "VERIFIED" : "FAILED",
      verifiedAt: isVerified ? new Date() : null,
    },
  });
}

export async function evaluateReportSchedules(now = new Date()) {
  return evaluateReportSchedulesWithPrisma(getPrisma(), now);
}

export async function evaluateReportSchedulesWithPrisma(
  prisma: Pick<PrismaClient, "reportSchedule" | "report">,
  now = new Date(),
) {
  const schedules = await prisma.reportSchedule.findMany({
    where: {
      enabled: true,
      nextRunAt: { lte: now },
    },
    orderBy: { nextRunAt: "asc" },
    take: 50,
  });
  const generatedReports = [];

  for (const schedule of schedules) {
    const periodEnd = now;
    const periodStart =
      schedule.frequency === "MONTHLY"
        ? daysAgoFrom(now, 30)
        : daysAgoFrom(now, 7);
    const report = await prisma.report.create({
      data: {
        workspaceId: schedule.workspaceId,
        clientId: schedule.clientId,
        domainId: schedule.domainId,
        templateId: schedule.templateId,
        title: buildScheduledReportTitle(schedule.title, periodEnd),
        status: "GENERATED",
        periodStart,
        periodEnd,
        shareToken: randomToken(),
      },
    });

    generatedReports.push(report);

    await prisma.reportSchedule.update({
      where: { id: schedule.id },
      data: {
        lastRunAt: now,
        nextRunAt: calculateNextRunAt(schedule.frequency, now),
      },
    });
  }

  return {
    evaluated: schedules.length,
    generated: generatedReports.length,
    reportIds: generatedReports.map((report) => report.id),
  };
}

export async function publishReport(reportId: string) {
  return publishReportWithPrisma(getPrisma(), reportId);
}

export async function publishReportWithPrisma(
  prisma: Pick<PrismaClient, "report">,
  reportId: string,
) {
  const existingReport = await prisma.report.findUnique({
    where: { id: reportId },
    select: { shareToken: true },
  });

  return prisma.report.update({
    where: { id: reportId },
    data: {
      status: "PUBLISHED",
      shareToken: existingReport?.shareToken ?? randomToken(),
    },
  });
}

export function buildReportSummary(report: ReportDetail) {
  const domains = report.domain
    ? [report.domain]
    : (report.client?.domains ?? []);
  const issues = domains.flatMap((domain) => domain.issues);
  const changeEvents = domains
    .flatMap((domain) =>
      domain.changeEvents
        .filter(
          (change) =>
            change.createdAt >= report.periodStart &&
            change.createdAt <= report.periodEnd,
        )
        .map((change) => ({
          ...change,
          domainName: domain.domain,
        })),
    )
    .sort(
      (left, right) => right.createdAt.getTime() - left.createdAt.getTime(),
    );
  const openIssues = issues.filter((issue) => issue.status !== "FIXED");
  const fixedIssues = issues.filter(
    (issue) =>
      issue.status === "FIXED" &&
      issue.resolvedAt &&
      issue.resolvedAt >= report.periodStart &&
      issue.resolvedAt <= report.periodEnd,
  );
  const newIssues = issues.filter(
    (issue) =>
      issue.firstDetectedAt >= report.periodStart &&
      issue.firstDetectedAt <= report.periodEnd,
  );
  const criticalIssues = openIssues.filter(
    (issue) => issue.severity === "CRITICAL",
  );
  const warningIssues = openIssues.filter(
    (issue) => issue.severity === "WARNING",
  );
  const pageCount = domains.reduce(
    (total, domain) => total + domain.pages.length,
    0,
  );
  const crawls = domains.flatMap((domain) => domain.crawlRuns);
  const score = averageScore(domains.map((domain) => domain.healthScore));
  const brand = buildReportBrand(report);
  const sections = parseReportSections(report.template?.sectionsJson);

  return {
    brand,
    sections,
    domains,
    score,
    pageCount,
    crawls,
    changeEvents,
    criticalChanges: changeEvents.filter(
      (change) => change.severity === "CRITICAL",
    ),
    openIssues,
    fixedIssues,
    newIssues,
    criticalIssues,
    warningIssues,
    recommendations: openIssues
      .filter((issue) => issue.recommendation)
      .slice(0, 8)
      .map((issue) => ({
        title: issue.title,
        recommendation: issue.recommendation ?? "",
        domain:
          domains.find((domain) => domain.id === issue.domainId)?.domain ?? "",
        pageUrl: issue.page?.url,
      })),
  };
}

export function buildReportPdfText(report: ReportDetail) {
  const summary = buildReportSummary(report);
  const owner =
    report.client?.name ?? report.domain?.domain ?? report.workspace.name;
  const lines = [
    formatProductReportTitle(report.title),
    `Prepared by: ${summary.brand.agencyName}`,
    `Prepared for: ${summary.brand.clientName}`,
    `Website or client: ${owner}`,
    `Period: ${report.periodStart.toDateString()} - ${report.periodEnd.toDateString()}`,
  ];

  if (summary.sections.healthScore) {
    lines.push(`Health score: ${formatWebsiteHealth(summary.score)}`);
  }

  if (summary.sections.crawlSummary) {
    lines.push(`Pages checked: ${summary.pageCount}`);
  }

  if (summary.sections.issueMovement) {
    lines.push(
      `Problems ready to review: ${summary.openIssues.length}`,
      `Quick-care problems: ${summary.criticalIssues.length}`,
      `New problems: ${summary.newIssues.length}`,
      `Fixed problems: ${summary.fixedIssues.length}`,
    );
  }

  if (summary.sections.changeSummary) {
    lines.push(
      `Website changes found: ${summary.changeEvents.length}`,
      `Important changes: ${summary.criticalChanges.length}`,
      "",
      "Website change summary",
      ...summary.changeEvents
        .slice(0, 8)
        .map(
          (change) =>
            `- ${formatChangeType(change.changeType)} on ${change.domainName}: ${formatCrawlRunChangeValue(change.previousValue)} -> ${formatCrawlRunChangeValue(change.newValue)}`,
        ),
    );
  }

  if (summary.sections.priorityRecommendations) {
    lines.push(
      "",
      "Best next steps",
      ...summary.recommendations.map(
        (item) => `- ${item.title}: ${item.recommendation}`,
      ),
    );
  }

  return lines;
}

export function buildReportShareUrl(report: ReportDetail) {
  if (!report.shareToken) {
    return null;
  }

  const hostname =
    report.client?.reportWhiteLabelDomains.at(0)?.hostname ??
    report.domain?.client?.reportWhiteLabelDomains.at(0)?.hostname ??
    report.workspace.reportWhiteLabelDomains.at(0)?.hostname;
  const path = `/share/reports/${report.shareToken}`;

  return hostname ? `https://${hostname}${path}` : path;
}

export function parseReportSections(value: Prisma.JsonValue | undefined) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return defaultReportSections;
  }

  return {
    ...defaultReportSections,
    ...Object.fromEntries(
      Object.keys(defaultReportSections).map((key) => [
        key,
        Boolean((value as Record<string, Prisma.JsonValue>)[key]),
      ]),
    ),
  };
}

export function buildReportSections(keys: string[]) {
  const selected = new Set(keys);

  return Object.fromEntries(
    Object.keys(defaultReportSections).map((key) => [
      key,
      selected.size
        ? selected.has(key)
        : defaultReportSections[key as ReportSectionKey],
    ]),
  ) as Record<ReportSectionKey, boolean>;
}

export function formatReportWhiteLabelVerificationValue(token: string) {
  return `${REPORT_WHITE_LABEL_PREFIX}=${token}`;
}

export function normalizeReportHostname(value: string) {
  return value
    .replace(/^https?:\/\//i, "")
    .split("/")[0]
    .trim()
    .toLowerCase();
}

function buildReportBrand(report: ReportDetail) {
  const clientName =
    report.client?.name ??
    report.domain?.client?.name ??
    report.domain?.domain ??
    "Client";

  return {
    agencyName: report.workspace.name,
    clientName,
    clientLogoUrl: report.client?.logoUrl ?? report.domain?.client?.logoUrl,
    reportScope:
      report.domain?.domain ??
      report.client?.domains.map((domain) => domain.domain).join(", ") ??
      "Workspace",
  };
}

export function formatChangeType(value: string) {
  return value
    .split(":")
    .at(-1)!
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function averageScore(scores: Array<number | null>) {
  const validScores = scores.filter((score): score is number => score !== null);

  if (!validScores.length) {
    return null;
  }

  return Math.round(
    validScores.reduce((total, score) => total + score, 0) / validScores.length,
  );
}

function calculateNextRunAt(
  frequency: ReportScheduleFrequency,
  fromDate: Date,
) {
  const next = new Date(fromDate);
  next.setHours(9, 0, 0, 0);

  if (frequency === "MONTHLY") {
    next.setMonth(next.getMonth() + 1);
  } else {
    next.setDate(next.getDate() + 7);
  }

  return next;
}

function buildScheduledReportTitle(title: string, periodEnd: Date) {
  return `${formatProductReportTitle(title)} - ${periodEnd.toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  )}`;
}

function daysAgoFrom(date: Date, days: number) {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function randomToken() {
  return randomBytes(18).toString("base64url");
}

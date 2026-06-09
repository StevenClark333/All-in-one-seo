import { AlertTriangle, BarChart3, FileText, UsersRound } from "lucide-react";
import type { IssueStatus, Workspace } from "@prisma/client";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import type { Issue, Severity, Site } from "@/lib/dashboard-data";
import { formatOverviewOwner } from "@/lib/overview-display-labels";
import {
  formatWebsiteClient,
  formatWebsiteHealth,
} from "@/lib/website-display-labels";

type AgencyStat = {
  label: string;
  value: string;
  detail: string;
  icon: typeof UsersRound;
};

export type DashboardData = {
  workspaceName: string;
  workspaceType: Workspace["type"] | null;
  agencyStats: AgencyStat[];
  sites: Site[];
  issues: Issue[];
  isDatabaseConfigured: boolean;
};

const emptyStats: AgencyStat[] = [
  {
    label: "Clients",
    value: "0",
    detail: "Connect PostgreSQL and seed data to begin",
    icon: UsersRound,
  },
  {
    label: "Avg. health",
    value: "0",
    detail: "No verified sites available yet",
    icon: BarChart3,
  },
  {
    label: "Urgent problems",
    value: "0",
    detail: "No website check has run yet",
    icon: AlertTriangle,
  },
  {
    label: "Reports due",
    value: "0",
    detail: "Updates start after the first website check",
    icon: FileText,
  },
];

export async function getDashboardData(): Promise<DashboardData> {
  if (!hasDatabaseUrl()) {
    return {
      workspaceName: "All In One SEO",
      workspaceType: null,
      agencyStats: emptyStats,
      sites: [],
      issues: [],
      isDatabaseConfigured: false,
    };
  }

  const prisma = getPrisma();
  const workspace = await prisma.workspace
    .findFirst({
      orderBy: { createdAt: "asc" },
    })
    .catch(() => null);

  if (!workspace) {
    return {
      workspaceName: "All In One SEO",
      workspaceType: null,
      agencyStats: emptyStats,
      sites: [],
      issues: [],
      isDatabaseConfigured: true,
    };
  }

  const [clientCount, domains, criticalCount, reportsDue, openIssues] =
    await Promise.all([
      prisma.client.count({ where: { workspaceId: workspace.id } }),
      prisma.domain.findMany({
        where: { workspaceId: workspace.id },
        include: {
          client: true,
          pages: { select: { id: true } },
          issues: {
            where: { status: { not: "FIXED" } },
            select: { severity: true },
          },
          crawlRuns: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: { completedAt: true, createdAt: true, status: true },
          },
        },
        orderBy: [{ client: { name: "asc" } }, { domain: "asc" }],
      }),
      prisma.seoIssue.count({
        where: {
          workspaceId: workspace.id,
          severity: "CRITICAL",
          status: { not: "FIXED" },
        },
      }),
      prisma.report.count({
        where: {
          workspaceId: workspace.id,
          status: { in: ["DRAFT", "FAILED"] },
        },
      }),
      prisma.seoIssue.findMany({
        where: {
          workspaceId: workspace.id,
          status: { not: "FIXED" },
        },
        include: {
          client: true,
          domain: true,
          assignedTo: true,
        },
        orderBy: [{ severity: "asc" }, { priorityScore: "desc" }],
        take: 6,
      }),
    ]);

  const verifiedScores = domains
    .map((domain) => domain.healthScore)
    .filter((score): score is number => typeof score === "number");

  const avgHealth = verifiedScores.length
    ? Math.round(
        verifiedScores.reduce((total, score) => total + score, 0) /
          verifiedScores.length,
      )
    : 0;

  return {
    workspaceName: workspace.name,
    workspaceType: workspace.type,
    agencyStats: [
      {
        label: "Clients",
        value: clientCount.toString(),
        detail: `${domains.length} website${domains.length === 1 ? "" : "s"} being watched`,
        icon: UsersRound,
      },
      {
        label: "Avg. health",
        value: avgHealth.toString(),
        detail: "Across verified client sites",
        icon: BarChart3,
      },
      {
        label: "Urgent problems",
        value: criticalCount.toString(),
        detail: "Urgent problems across all clients",
        icon: AlertTriangle,
      },
      {
        label: "Reports due",
        value: reportsDue.toString(),
        detail: "Draft or failed reports awaiting review",
        icon: FileText,
      },
    ],
    sites: domains.map(mapDomainToSite),
    issues: openIssues.map((issue) => mapIssue(issue, workspace)),
    isDatabaseConfigured: true,
  };
}

function mapDomainToSite(
  domain: Awaited<ReturnType<typeof getPrisma>>["domain"] extends never
    ? never
    : {
        client: { name: string } | null;
        domain: string;
        platform: string;
        healthScore: number | null;
        pages: { id: string }[];
        issues: { severity: string }[];
        crawlRuns: {
          completedAt: Date | null;
          createdAt: Date;
          status: string;
        }[];
        verificationStatus: string;
      },
): Site {
  const critical = domain.issues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;
  const warnings = domain.issues.filter(
    (issue) => issue.severity === "WARNING",
  ).length;
  const latestCrawl = domain.crawlRuns.at(0);

  return {
    client: formatWebsiteClient(domain.client?.name),
    domain: domain.domain,
    platform: formatEnum(domain.platform),
    score: domain.healthScore ?? 0,
    scoreLabel:
      domain.verificationStatus === "VERIFIED"
        ? formatWebsiteHealth(domain.healthScore)
        : "No score yet",
    pages: domain.pages.length,
    critical,
    warnings,
    lastCrawl: latestCrawl
      ? formatRelativeTime(latestCrawl.completedAt ?? latestCrawl.createdAt)
      : "Not started",
    verification:
      domain.verificationStatus === "VERIFIED" ? "verified" : "pending",
  };
}

function mapIssue(
  issue: {
    title: string;
    client: { name: string } | null;
    domain: { domain: string };
    severity: string;
    status: IssueStatus;
    assignedTo: { name: string | null; email: string } | null;
  },
  workspace: Workspace,
): Issue {
  return {
    title: issue.title,
    client: issue.client?.name ?? workspace.name,
    domain: issue.domain.domain,
    severity: issue.severity.toLowerCase() as Severity,
    pages: 1,
    owner: formatOverviewOwner(
      issue.assignedTo?.name ?? issue.assignedTo?.email,
    ),
    status: formatIssueStatus(issue.status),
  };
}

function formatIssueStatus(status: IssueStatus): Issue["status"] {
  if (status === "IN_PROGRESS") {
    return "in progress";
  }

  if (status === "FIXED") {
    return "fixed";
  }

  return "open";
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRelativeTime(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const minutes = Math.max(1, Math.round(diffMs / 60000));

  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }

  const hours = Math.round(minutes / 60);

  if (hours < 24) {
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }

  const days = Math.round(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

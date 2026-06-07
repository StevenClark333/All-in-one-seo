import {
  BarChart3,
  Crosshair,
  FileText,
  Globe2,
  Hammer,
  KeyRound,
  LineChart,
  Play,
  Plus,
  Search,
  Settings,
  UsersRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { getPrimaryWorkspace } from "@/lib/workspace";

export type GlobalSearchResult = {
  category: "Action" | "Client" | "Domain" | "Issue" | "Page" | "Report";
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
};

const actionResults: GlobalSearchResult[] = [
  {
    category: "Action",
    description: "Open the projects table to start a verified domain crawl.",
    href: "/domains",
    icon: Play,
    title: "Run crawl",
  },
  {
    category: "Action",
    description: "Create a report from current crawl, issue, and score data.",
    href: "/reports",
    icon: FileText,
    title: "Create report",
  },
  {
    category: "Action",
    description: "Register a new website project for monitoring.",
    href: "/domains/new",
    icon: Plus,
    title: "Add domain",
  },
  {
    category: "Action",
    description: "Review approved and exported internal-link fixes.",
    href: "/fix-center",
    icon: Hammer,
    title: "Open Fix Center",
  },
  {
    category: "Action",
    description: "Compare owned projects by visibility, pages, issues, and top organic demand.",
    href: "/competitive-analysis",
    icon: Crosshair,
    title: "Open Competitive Analysis",
  },
  {
    category: "Action",
    description: "Find Search Console keyword opportunities, intent groups, and content gaps.",
    href: "/keyword-research",
    icon: KeyRound,
    title: "Open Keyword Research",
  },
  {
    category: "Action",
    description: "Track owned and competitor keyword positions with imported volume metrics.",
    href: "/rank-tracking",
    icon: LineChart,
    title: "Open Rank Tracking",
  },
  {
    category: "Action",
    description: "Review imported Search Console clicks, impressions, queries, and pages.",
    href: "/search-performance",
    icon: BarChart3,
    title: "Open Search Performance",
  },
  {
    category: "Action",
    description: "Connect Search Console, Analytics, CMS, and workflow tools.",
    href: "/integrations",
    icon: Settings,
    title: "Connect integration",
  },
];

export async function getGlobalSearchResults(
  query: string,
): Promise<{ results: GlobalSearchResult[]; workspaceName: string }> {
  const trimmedQuery = query.trim();

  if (!hasDatabaseUrl()) {
    return {
      results: filterActionResults(trimmedQuery),
      workspaceName: "Workspace",
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      results: filterActionResults(trimmedQuery),
      workspaceName: "Workspace",
    };
  }

  if (!trimmedQuery) {
    return {
      results: actionResults,
      workspaceName: workspace.name,
    };
  }

  const contains = { contains: trimmedQuery, mode: "insensitive" as const };
  const [clients, domains, pages, issues, reports] = await Promise.all([
    getPrisma().client.findMany({
      where: {
        archivedAt: null,
        workspaceId: workspace.id,
        OR: [{ name: contains }, { contactEmail: contains }],
      },
      orderBy: { name: "asc" },
      take: 8,
    }),
    getPrisma().domain.findMany({
      where: {
        archivedAt: null,
        workspaceId: workspace.id,
        domain: contains,
      },
      include: { client: true },
      orderBy: { domain: "asc" },
      take: 8,
    }),
    getPrisma().page.findMany({
      where: {
        domain: { archivedAt: null, workspaceId: workspace.id },
        OR: [{ url: contains }, { normalizedUrl: contains }],
      },
      include: { domain: { include: { client: true } } },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    getPrisma().seoIssue.findMany({
      where: {
        workspaceId: workspace.id,
        OR: [{ title: contains }, { description: contains }],
      },
      include: { domain: true, page: true },
      orderBy: [{ status: "asc" }, { priorityScore: "desc" }],
      take: 8,
    }),
    getPrisma().report.findMany({
      where: {
        workspaceId: workspace.id,
        title: contains,
      },
      include: { client: true, domain: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
  ]);

  return {
    results: [
      ...filterActionResults(trimmedQuery),
      ...clients.map((client) => ({
        category: "Client" as const,
        description: client.contactEmail ?? "Client account",
        href: `/clients/${client.id}`,
        icon: UsersRound,
        title: client.name,
      })),
      ...domains.map((domain) => ({
        category: "Domain" as const,
        description: domain.client?.name ?? "Unassigned client",
        href: `/domains/${domain.id}/workspace`,
        icon: Globe2,
        title: domain.domain,
      })),
      ...pages.map((page) => ({
        category: "Page" as const,
        description: `${page.domain.client?.name ?? "Unassigned"} - ${
          page.domain.domain
        }`,
        href: `/pages/${page.id}`,
        icon: Search,
        title: page.url,
      })),
      ...issues.map((issue) => ({
        category: "Issue" as const,
        description: `${issue.domain.domain}${
          issue.page ? ` - ${issue.page.url}` : ""
        }`,
        href: `/issues/${issue.id}`,
        icon: Hammer,
        title: issue.title,
      })),
      ...reports.map((report) => ({
        category: "Report" as const,
        description:
          report.domain?.domain ?? report.client?.name ?? "Workspace report",
        href: `/reports/${report.id}`,
        icon: FileText,
        title: report.title,
      })),
    ],
    workspaceName: workspace.name,
  };
}

function filterActionResults(query: string) {
  if (!query) {
    return actionResults;
  }

  const normalized = query.toLowerCase();

  return actionResults.filter((result) =>
    [result.title, result.description, result.category]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}

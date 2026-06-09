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
import { formatProductReportTitle } from "@/lib/product-copy";
import { formatWebsiteClient } from "@/lib/website-display-labels";
import { getPrimaryWorkspace } from "@/lib/workspace";

export type GlobalSearchResult = {
  category: "Action" | "Client" | "Page" | "Problem" | "Update" | "Website";
  description: string;
  href: string;
  icon: LucideIcon;
  title: string;
};

const actionResults: GlobalSearchResult[] = [
  {
    category: "Action",
    description: "Open Projects to run a fresh check for a verified website.",
    href: "/domains",
    icon: Play,
    title: "Check website",
  },
  {
    category: "Action",
    description: "Create a simple update from current health, problems, and fixes.",
    href: "/reports",
    icon: FileText,
    title: "Create update",
  },
  {
    category: "Action",
    description: "Add a new website and keep its work organized.",
    href: "/domains/new",
    icon: Plus,
    title: "Add website",
  },
  {
    category: "Action",
    description: "Review, send, and track fixes in one place.",
    href: "/fix-center",
    icon: Hammer,
    title: "Open fixes",
  },
  {
    category: "Action",
    description: "Compare your website against competitors and spot useful opportunities.",
    href: "/competitive-analysis",
    icon: Crosshair,
    title: "Open competitors",
  },
  {
    category: "Action",
    description: "Find useful keyword and content ideas.",
    href: "/keyword-research",
    icon: KeyRound,
    title: "Open keywords",
  },
  {
    category: "Action",
    description: "See how keyword positions are moving.",
    href: "/rank-tracking",
    icon: LineChart,
    title: "Open rank",
  },
  {
    category: "Action",
    description: "Review Google clicks, impressions, top searches, and top pages.",
    href: "/search-performance",
    icon: BarChart3,
    title: "Open search growth",
  },
  {
    category: "Action",
    description: "Connect Google, your website platform, alerts, and helper tools.",
    href: "/integrations",
    icon: Settings,
    title: "Connect tools",
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
        category: "Website" as const,
        description: formatWebsiteClient(domain.client?.name),
        href: `/domains/${domain.id}/workspace`,
        icon: Globe2,
        title: domain.domain,
      })),
      ...pages.map((page) => ({
        category: "Page" as const,
        description: `${formatWebsiteClient(page.domain.client?.name)} - ${
          page.domain.domain
        }`,
        href: `/pages/${page.id}`,
        icon: Search,
        title: page.url,
      })),
      ...issues.map((issue) => ({
        category: "Problem" as const,
        description: `${issue.domain.domain}${
          issue.page ? ` - ${issue.page.url}` : ""
        }`,
        href: `/issues/${issue.id}`,
        icon: Hammer,
        title: softenGlobalSearchProblemTitle(issue.title),
      })),
      ...reports.map((report) => ({
        category: "Update" as const,
        description:
          report.domain?.domain ?? report.client?.name ?? "Workspace report",
        href: `/reports/${report.id}`,
        icon: FileText,
        title: formatProductReportTitle(report.title),
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

function softenGlobalSearchProblemTitle(value: string) {
  const exactMatches: Record<string, string> = {
    "Sitemap URL is not internally linked":
      "Page is in the page list but needs links",
    "Sitemap Url Not Internally Linked":
      "Page is in the page list but needs links",
    "Internally Linked Url Missing From Sitemap":
      "Linked page missing from page list",
    "Robots Txt Unavailable Or Malformed": "Robots file needs attention",
    "Sitemap Unavailable": "Page list needs attention",
    "Missing H1": "Main heading missing",
    "Multiple H1": "Too many main headings",
    "Missing Image Alt": "Image description missing",
    "Missing Canonical": "Preferred page link missing",
    "Duplicate Content Cluster": "Repeated content group",
    "Duplicate content detected": "Page content repeats",
    "Duplicate Meta Description": "Repeated page description",
    "Duplicate Title": "Repeated page title",
    "Duplicate title": "Repeated page title",
    "Duplicate meta descriptions across page template":
      "Page template repeats the same description",
    "Missing Schema": "Page details for Google missing",
    "Missing Meta Description": "Page description missing",
    "Missing Title": "Page title missing",
    "Missing page title": "Page title missing",
    "Add a unique meta description": "Write a clear page description",
    "Add a unique title tag": "Write a clear page title",
    "Restore indexability": "Make page visible to Google",
    "Homepage Blocked By Robots": "Homepage blocked from Google",
    "Homepage blocked by robots.txt": "Homepage blocked from Google",
    "Product template canonical points to non-200 URLs":
      "Product template points to a broken preferred page",
    "Homepage became noindex after latest deploy":
      "Homepage was hidden from Google after deploy",
    "Critical Regression": "Urgent change",
  };

  const exactMatch = exactMatches[value];

  if (exactMatch) {
    return exactMatch;
  }

  return value
    .replace(/\bSitemap\b/g, "page list")
    .replace(/\bURLs?\b/g, "pages")
    .replace(/\bUrl\b/g, "page")
    .replace(/\bRobots Txt\b/g, "robots file")
    .replace(/\bH1\b/g, "main heading")
    .replace(/\bMeta Description\b/g, "page description")
    .replace(/\bduplicate content\b/gi, "repeated page content")
    .replace(/\bSchema\b/g, "page details for Google")
    .replace(/\bNoindex\b/g, "hidden from Google")
    .replace(/\bCanonical\b/g, "preferred page link")
    .replace(/\bindexability\b/gi, "visibility in Google")
    .replace(/\btitle tag\b/gi, "page title");
}

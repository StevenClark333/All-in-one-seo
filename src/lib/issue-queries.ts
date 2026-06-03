import { Prisma } from "@prisma/client";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import {
  calculateTemplatePriority,
  getTemplateLabel,
  inferPageTemplate,
} from "@/lib/template-detection";
import { getPrimaryWorkspace } from "@/lib/workspace";

export type IssueListFilters = {
  clientId?: string;
  domainId?: string;
  severity?: string;
  status?: string;
  assignedToId?: string;
  issueType?: string;
  templateKey?: string;
};

export async function getIssueListData(filters: IssueListFilters = {}) {
  if (!hasDatabaseUrl()) {
    return {
      workspace: null,
      issues: [],
      clients: [],
      domains: [],
      members: [],
      issueTypes: [],
      templateGroups: [],
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      workspace: null,
      issues: [],
      clients: [],
      domains: [],
      members: [],
      issueTypes: [],
      templateGroups: [],
    };
  }

  const where = {
    workspaceId: workspace.id,
    ...(filters.clientId ? { clientId: filters.clientId } : {}),
    ...(filters.domainId ? { domainId: filters.domainId } : {}),
    ...(filters.severity ? { severity: filters.severity as never } : {}),
    ...(filters.status ? { status: filters.status as never } : {}),
    ...(filters.assignedToId ? { assignedToId: filters.assignedToId } : {}),
    ...(filters.issueType ? { issueType: filters.issueType } : {}),
    ...(filters.templateKey
      ? { page: buildTemplatePageWhere(filters.templateKey) }
      : {}),
  } satisfies Prisma.SeoIssueWhereInput;

  const [issues, clients, domains, members, issueTypes, templateIssues] =
    await Promise.all([
      getPrisma().seoIssue.findMany({
        where,
        include: {
          client: true,
          domain: true,
          page: true,
          assignedTo: true,
        },
        orderBy: [
          { status: "asc" },
          { severity: "asc" },
          { priorityScore: "desc" },
          { lastDetectedAt: "desc" },
        ],
      }),
      getPrisma().client.findMany({
        where: { workspaceId: workspace.id },
        orderBy: { name: "asc" },
      }),
      getPrisma().domain.findMany({
        where: { workspaceId: workspace.id },
        include: { client: { select: { name: true } } },
        orderBy: { domain: "asc" },
      }),
      getPrisma().workspaceMember.findMany({
        where: { workspaceId: workspace.id },
        include: { user: true },
        orderBy: { createdAt: "asc" },
      }),
      getPrisma().seoIssue.findMany({
        where: { workspaceId: workspace.id },
        distinct: ["issueType"],
        select: { issueType: true },
        orderBy: { issueType: "asc" },
      }),
      getPrisma().seoIssue.findMany({
        where: {
          workspaceId: workspace.id,
          pageId: { not: null },
          status: { not: "FIXED" },
        },
        include: {
          page: true,
        },
      }),
    ]);

  return {
    workspace,
    issues,
    clients,
    domains,
    members,
    issueTypes: issueTypes.map((issue) => issue.issueType),
    templateGroups: buildIssueTemplateGroups(templateIssues),
  };
}

export async function getIssueDetailData(issueId: string) {
  if (!hasDatabaseUrl()) {
    return { workspace: null, issue: null, members: [] };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, issue: null, members: [] };
  }

  const [issue, members] = await Promise.all([
    getPrisma().seoIssue.findFirst({
      where: {
        id: issueId,
        workspaceId: workspace.id,
      },
      include: {
        assignedTo: true,
        client: true,
        domain: true,
        page: {
          include: {
            snapshots: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
        notes: {
          include: { author: true },
          orderBy: { createdAt: "desc" },
        },
        recommendations: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    }),
    getPrisma().workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return { workspace, issue, members };
}

function buildIssueTemplateGroups(
  issues: Array<{
    severity: string;
    priorityScore: number;
    page: { url: string; pageType: string | null } | null;
  }>,
) {
  const groups = new Map<
    string,
    {
      key: string;
      label: string;
      issueCount: number;
      criticalCount: number;
      warningCount: number;
      priorityScore: number;
    }
  >();

  for (const issue of issues) {
    if (!issue.page) {
      continue;
    }

    const key = inferPageTemplate(issue.page);
    const existing =
      groups.get(key) ??
      ({
        key,
        label: getTemplateLabel(key),
        issueCount: 0,
        criticalCount: 0,
        warningCount: 0,
        priorityScore: 0,
      } satisfies {
        key: string;
        label: string;
        issueCount: number;
        criticalCount: number;
        warningCount: number;
        priorityScore: number;
      });

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
        pageCount: 1,
      }),
    );
    groups.set(key, existing);
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.priorityScore - a.priorityScore || b.issueCount - a.issueCount,
  );
}

function buildTemplatePageWhere(templateKey: string): Prisma.PageWhereInput {
  const pathPrefixes: Record<string, string[]> = {
    blog: ["/blog/", "/posts/", "/articles/", "/news/"],
    product: ["/product/", "/products/", "/shop/", "/store/", "/item/"],
    category: ["/category/", "/categories/", "/collection/", "/collections/"],
    docs: ["/docs/", "/documentation/", "/help/", "/guide/", "/guides/"],
  };

  if (templateKey === "homepage") {
    return { pageType: templateKey };
  }

  const prefixes = pathPrefixes[templateKey] ?? [];

  return {
    OR: [
      { pageType: templateKey },
      ...prefixes.map((prefix) => ({
        url: { contains: prefix, mode: "insensitive" as const },
      })),
    ],
  };
}

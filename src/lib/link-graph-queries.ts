import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { generateInternalLinkOpportunities } from "@/lib/link-graph-analyzer";
import { getPrimaryWorkspace } from "@/lib/workspace";

export async function getInternalLinkGraphData() {
  if (!hasDatabaseUrl()) {
    return {
      workspace: null,
      domains: [],
      pages: [],
      issues: [],
      opportunities: [],
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      workspace: null,
      domains: [],
      pages: [],
      issues: [],
      opportunities: [],
    };
  }

  const [domains, issues] = await Promise.all([
    getPrisma().domain.findMany({
      where: { workspaceId: workspace.id },
      include: {
        client: true,
        pages: {
          include: {
            incomingLinks: true,
            outgoingLinks: true,
          },
          orderBy: [{ importance: "asc" }, { url: "asc" }],
        },
      },
      orderBy: [{ client: { name: "asc" } }, { domain: "asc" }],
    }),
    getPrisma().seoIssue.findMany({
      where: {
        workspaceId: workspace.id,
        status: { not: "FIXED" },
        OR: [
          { issueType: { startsWith: "deep_page:" } },
          { issueType: { startsWith: "sitemap_url_not_internally_linked:" } },
          {
            issueType: {
              startsWith: "internally_linked_url_missing_from_sitemap:",
            },
          },
        ],
      },
      include: {
        domain: { include: { client: true } },
        page: true,
      },
      orderBy: [
        { severity: "asc" },
        { priorityScore: "desc" },
        { lastDetectedAt: "desc" },
      ],
      take: 25,
    }),
  ]);

  const pages = domains.flatMap((domain) =>
    domain.pages.map((page) => ({
      id: page.id,
      domain: domain.domain,
      client: domain.client?.name ?? "Unassigned",
      url: page.url,
      pageType: page.pageType,
      importance: page.importance,
      incomingCount: page.incomingLinks.length,
      outgoingCount: page.outgoingLinks.length,
      isOrphan:
        page.importance !== "CRITICAL" &&
        page.incomingLinks.length === 0 &&
        page.lastCrawledAt === null,
    })),
  );
  const opportunities = domains.flatMap((domain) =>
    generateInternalLinkOpportunities({
      pages: domain.pages.map((page) => ({
        id: page.id,
        url: page.url,
        normalizedUrl: page.normalizedUrl,
        importance: page.importance,
        pageType: page.pageType,
      })),
      links: domain.pages.flatMap((page) =>
        page.outgoingLinks.map((link) => ({
          sourcePageId: link.sourcePageId,
          targetPageId: link.targetPageId,
          normalizedUrl: link.normalizedUrl,
        })),
      ),
    }).map((opportunity) => ({
      ...opportunity,
      domain: domain.domain,
      client: domain.client?.name ?? "Unassigned",
    })),
  );

  return { workspace, domains, pages, issues, opportunities };
}

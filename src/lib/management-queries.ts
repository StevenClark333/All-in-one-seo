import { Prisma } from "@prisma/client";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import {
  type PageTemplateSummary,
  summarizeTemplateGroups,
} from "@/lib/template-detection";
import { getPrimaryWorkspace } from "@/lib/workspace";

const pageInventoryInclude = Prisma.validator<Prisma.PageInclude>()({
  domain: { include: { client: true } },
  snapshots: {
    orderBy: { createdAt: "desc" },
    take: 1,
  },
  issues: {
    where: { status: { not: "FIXED" } },
    select: { severity: true, status: true },
  },
  incomingLinks: { select: { id: true } },
  outgoingLinks: { select: { id: true } },
});

const pageDetailInclude = Prisma.validator<Prisma.PageInclude>()({
  domain: { include: { client: true } },
  snapshots: {
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { crawlRun: true },
  },
  issues: {
    include: { assignedTo: true },
    orderBy: [
      { status: "asc" },
      { severity: "asc" },
      { priorityScore: "desc" },
    ],
  },
  recommendations: {
    orderBy: { createdAt: "desc" },
    take: 12,
  },
  changeEvents: {
    orderBy: { createdAt: "desc" },
    take: 12,
  },
  incomingLinks: {
    include: { sourcePage: true },
    orderBy: { createdAt: "desc" },
    take: 25,
  },
  outgoingLinks: {
    include: { targetPage: true },
    orderBy: { createdAt: "desc" },
    take: 25,
  },
});

type PrimaryWorkspace = Awaited<ReturnType<typeof getPrimaryWorkspace>>;
type PageInventoryItem = Prisma.PageGetPayload<{
  include: typeof pageInventoryInclude;
}>;
type PageDetail = Prisma.PageGetPayload<{ include: typeof pageDetailInclude }>;
export type ActiveProjectDomain = {
  client: { name: string } | null;
  domain: string;
  id: string;
};

export async function getActiveProjectDomain(
  domainId: string | undefined,
): Promise<ActiveProjectDomain | null> {
  if (!domainId || !hasDatabaseUrl()) {
    return null;
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return null;
  }

  return getPrisma().domain.findFirst({
    where: { archivedAt: null, id: domainId, workspaceId: workspace.id },
    include: { client: { select: { name: true } } },
  });
}

export async function getClientManagementData() {
  if (!hasDatabaseUrl()) {
    return { workspace: null, clients: [] };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, clients: [] };
  }

  const clients = await getPrisma().client.findMany({
    where: { archivedAt: null, workspaceId: workspace.id },
    include: {
      domains: {
        select: {
          id: true,
          domain: true,
          verificationStatus: true,
          healthScore: true,
        },
      },
      issues: {
        where: { status: { not: "FIXED" } },
        select: { severity: true },
      },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { title: true, status: true, createdAt: true },
      },
    },
    orderBy: { name: "asc" },
  });

  return { workspace, clients };
}

export async function getDomainManagementData() {
  if (!hasDatabaseUrl()) {
    return { workspace: null, clients: [], domains: [] };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, clients: [], domains: [] };
  }

  const [clients, domains] = await Promise.all([
    getPrisma().client.findMany({
      where: { archivedAt: null, workspaceId: workspace.id },
      orderBy: { name: "asc" },
    }),
    getPrisma().domain.findMany({
      where: { archivedAt: null, workspaceId: workspace.id },
      include: {
        client: true,
        scoreHistory: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
        crawlRuns: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            status: true,
            completedAt: true,
            createdAt: true,
            pagesCrawled: true,
            pagesDiscovered: true,
          },
        },
        verifications: {
          where: { status: "VERIFIED" },
          take: 1,
        },
        issues: {
          where: { status: { not: "FIXED" } },
          select: { issueType: true, severity: true },
        },
        linkFixSuggestions: {
          where: { status: { in: ["APPROVED", "EXPORTED", "APPLIED"] } },
          select: { status: true, verificationStatus: true },
        },
        pages: {
          select: {
            id: true,
            url: true,
            snapshots: {
              orderBy: { createdAt: "desc" },
              select: {
                metadataJson: true,
                robotsDirective: true,
                statusCode: true,
              },
              take: 1,
            },
          },
        },
        reports: {
          orderBy: { createdAt: "desc" },
          select: { id: true, status: true, createdAt: true },
          take: 3,
        },
      },
      orderBy: [{ client: { name: "asc" } }, { domain: "asc" }],
    }),
  ]);

  return { workspace, clients, domains };
}

export async function getClientDetailData(clientId: string) {
  if (!hasDatabaseUrl()) {
    return { workspace: null, client: null };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, client: null };
  }

  const client = await getPrisma().client.findFirst({
    where: { id: clientId, workspaceId: workspace.id },
    include: {
      domains: {
        where: { archivedAt: null },
        include: {
          scoreHistory: {
            orderBy: { createdAt: "desc" },
            take: 6,
          },
          crawlRuns: {
            orderBy: { createdAt: "desc" },
            take: 3,
          },
          issues: {
            where: { status: { not: "FIXED" } },
            select: { severity: true, status: true },
          },
          pages: { select: { id: true } },
        },
        orderBy: { domain: "asc" },
      },
      issues: {
        where: { status: { not: "FIXED" } },
        include: { domain: true, page: true, assignedTo: true },
        orderBy: [
          { severity: "asc" },
          { priorityScore: "desc" },
          { lastDetectedAt: "desc" },
        ],
        take: 10,
      },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  return { workspace, client };
}

export async function getDomainDetailData(domainId: string) {
  if (!hasDatabaseUrl()) {
    return { workspace: null, clients: [], domain: null };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, clients: [], domain: null };
  }

  const [clients, domain] = await Promise.all([
    getPrisma().client.findMany({
      where: { archivedAt: null, workspaceId: workspace.id },
      orderBy: { name: "asc" },
    }),
    getPrisma().domain.findFirst({
      where: { archivedAt: null, id: domainId, workspaceId: workspace.id },
      include: {
        client: true,
        verifications: {
          orderBy: { createdAt: "desc" },
          take: 12,
        },
        scoreHistory: {
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        crawlRuns: {
          orderBy: { createdAt: "desc" },
          take: 8,
        },
        artifacts: {
          orderBy: { createdAt: "desc" },
          take: 8,
        },
        pages: {
          include: {
            snapshots: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
            issues: {
              where: { status: { not: "FIXED" } },
              select: { severity: true },
            },
          },
          orderBy: [{ importance: "asc" }, { updatedAt: "desc" }],
          take: 25,
        },
        issues: {
          where: { status: { not: "FIXED" } },
          include: { page: true, assignedTo: true },
          orderBy: [
            { severity: "asc" },
            { priorityScore: "desc" },
            { lastDetectedAt: "desc" },
          ],
          take: 10,
        },
      },
    }),
  ]);

  return { workspace, clients, domain };
}

export async function getDomainWorkspaceData(domainId: string) {
  if (!hasDatabaseUrl()) {
    return { workspace: null, domain: null };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, domain: null };
  }

  const domain = await getPrisma().domain.findFirst({
    where: { archivedAt: null, id: domainId, workspaceId: workspace.id },
    include: {
      artifacts: {
        orderBy: { createdAt: "desc" },
        take: 4,
      },
      changeEvents: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      client: true,
      crawlRuns: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      integrations: {
        orderBy: [{ provider: "asc" }, { createdAt: "desc" }],
      },
      issues: {
        where: { status: { not: "FIXED" } },
        include: { page: true },
        orderBy: [
          { severity: "asc" },
          { priorityScore: "desc" },
          { lastDetectedAt: "desc" },
        ],
        take: 8,
      },
      linkFixSuggestions: {
        orderBy: [{ updatedAt: "desc" }],
        take: 8,
      },
      pages: {
        include: {
          issues: {
            where: { status: { not: "FIXED" } },
            select: { severity: true },
          },
          snapshots: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
        orderBy: [{ importance: "asc" }, { updatedAt: "desc" }],
        take: 8,
      },
      reports: {
        orderBy: { createdAt: "desc" },
        take: 4,
      },
      scoreHistory: {
        orderBy: { createdAt: "desc" },
        take: 6,
      },
      verifications: {
        orderBy: { createdAt: "desc" },
        take: 4,
      },
    },
  });

  return { workspace, domain };
}

export async function getPageInventoryData({
  domainId,
}: {
  domainId?: string;
} = {}): Promise<{
  domains: Array<{
    client: { name: string } | null;
    domain: string;
    id: string;
  }>;
  workspace: PrimaryWorkspace;
  pages: PageInventoryItem[];
  templateGroups: PageTemplateSummary[];
}> {
  if (!hasDatabaseUrl()) {
    return { workspace: null, domains: [], pages: [], templateGroups: [] };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, domains: [], pages: [], templateGroups: [] };
  }

  const [domains, pages] = await Promise.all([
    getPrisma().domain.findMany({
      where: { archivedAt: null, workspaceId: workspace.id },
      include: { client: { select: { name: true } } },
      orderBy: [{ client: { name: "asc" } }, { domain: "asc" }],
    }),
    getPrisma().page.findMany({
      where: {
        domain: { archivedAt: null, workspaceId: workspace.id },
        ...(domainId ? { domainId } : {}),
      },
      include: pageInventoryInclude,
      orderBy: [
        { domain: { domain: "asc" } },
        { lastCrawledAt: "desc" },
        { updatedAt: "desc" },
      ],
      take: 200,
    }),
  ]);

  return {
    workspace,
    domains,
    pages,
    templateGroups: summarizeTemplateGroups(pages),
  };
}

export async function getPageDetailData(pageId: string): Promise<{
  workspace: PrimaryWorkspace;
  page: PageDetail | null;
}> {
  if (!hasDatabaseUrl()) {
    return { workspace: null, page: null };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return { workspace: null, page: null };
  }

  const page = await getPrisma().page.findFirst({
    where: { id: pageId, domain: { workspaceId: workspace.id } },
    include: pageDetailInclude,
  });

  return { workspace, page };
}

export async function getIntegrationSettingsData() {
  if (!hasDatabaseUrl()) {
    return {
      workspace: null,
      clients: [],
      domains: [],
      integrations: [],
      deploymentChecks: [],
    };
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return {
      workspace: null,
      clients: [],
      domains: [],
      integrations: [],
      deploymentChecks: [],
    };
  }

  const [clients, domains, integrations, deploymentChecks] = await Promise.all([
    getPrisma().client.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { name: "asc" },
    }),
    getPrisma().domain.findMany({
      where: { workspaceId: workspace.id },
      include: { client: true },
      orderBy: { domain: "asc" },
    }),
    getPrisma().integration.findMany({
      where: { workspaceId: workspace.id },
      include: { client: true, domain: true },
      orderBy: [{ provider: "asc" }, { createdAt: "desc" }],
    }),
    getPrisma().deploymentCheck.findMany({
      where: { workspaceId: workspace.id },
      include: { domain: true },
      orderBy: { receivedAt: "desc" },
      take: 10,
    }),
  ]);

  return { workspace, clients, domains, integrations, deploymentChecks };
}

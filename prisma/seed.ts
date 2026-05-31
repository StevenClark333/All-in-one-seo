import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/password";

const prisma = new PrismaClient();
const demoPassword = "DemoPass123!";
const productOwnerEmail = "keccc@gmail.com";
const productOwnerPassword = "KEman321!";

async function main() {
  await prisma.user.deleteMany({
    where: {
      email: {
        in: [
          "founder@allinoneseo.local",
          "founder@allinoneseo.com",
          "seo-lead@allinoneseo.local",
          "seo-lead@allinoneseo.com",
        ],
      },
    },
  });

  const productOwner = await upsertDemoUser({
    email: productOwnerEmail,
    name: "Product Owner",
    password: productOwnerPassword,
  });

  await prisma.workspace.deleteMany({
    where: { id: "seed_agency_workspace" },
  });

  const workspace = await prisma.workspace.create({
    data: {
      id: "seed_agency_workspace",
      name: "All In One SEO Agency",
      type: "AGENCY",
      plan: "agency",
      members: {
        create: {
          userId: productOwner.id,
          role: "OWNER",
        },
      },
    },
  });

  const agencyAdmin = await upsertDemoUser({
    email: "agency-admin@allinoneseo.local",
    name: "Agency Admin",
    password: demoPassword,
  });
  const seoOperator = await upsertDemoUser({
    email: "seo-operator@allinoneseo.local",
    name: "SEO Operator",
    password: demoPassword,
  });
  const clientViewer = await upsertDemoUser({
    email: "client-viewer@allinoneseo.local",
    name: "Client Viewer",
    password: demoPassword,
  });

  await prisma.workspaceMember.createMany({
    data: [
      {
        role: "ADMIN",
        userId: agencyAdmin.id,
        workspaceId: workspace.id,
      },
      {
        role: "MEMBER",
        userId: seoOperator.id,
        workspaceId: workspace.id,
      },
      {
        role: "VIEWER",
        userId: clientViewer.id,
        workspaceId: workspace.id,
      },
    ],
    skipDuplicates: true,
  });

  const northstar = await upsertClient(workspace.id, "Northstar Dental");
  const urbanThread = await upsertClient(workspace.id, "Urban Thread");
  const apexTech = await upsertClient(workspace.id, "ApexTech");
  const brightLedger = await upsertClient(workspace.id, "BrightLedger");

  await createDomainBundle({
    workspaceId: workspace.id,
    clientId: northstar.id,
    domain: "northstardental.com",
    platform: "WORDPRESS",
    healthScore: 91,
    pages: 428,
    criticalIssues: 0,
    warningIssues: 21,
    assignedToId: seoOperator.id,
  });

  await createDomainBundle({
    workspaceId: workspace.id,
    clientId: urbanThread.id,
    domain: "urbanthread.store",
    platform: "SHOPIFY",
    healthScore: 74,
    pages: 1840,
    criticalIssues: 6,
    warningIssues: 84,
    assignedToId: seoOperator.id,
  });

  await createDomainBundle({
    workspaceId: workspace.id,
    clientId: apexTech.id,
    domain: "apextech.io",
    platform: "CUSTOM",
    healthScore: 87,
    pages: 132,
    criticalIssues: 1,
    warningIssues: 14,
  });

  await prisma.domain.upsert({
    where: {
      workspaceId_domain: {
        workspaceId: workspace.id,
        domain: "brightledger.com",
      },
    },
    update: {},
    create: {
      workspaceId: workspace.id,
      clientId: brightLedger.id,
      domain: "brightledger.com",
      platform: "WEBFLOW",
      verificationStatus: "PENDING",
      crawlFrequency: "WEEKLY",
    },
  });

  await prisma.report.createMany({
    data: [
      {
        workspaceId: workspace.id,
        clientId: northstar.id,
        title: "Northstar Dental weekly SEO report",
        status: "DRAFT",
        periodStart: daysAgo(7),
        periodEnd: new Date(),
      },
      {
        workspaceId: workspace.id,
        clientId: urbanThread.id,
        title: "Urban Thread technical SEO report",
        status: "DRAFT",
        periodStart: daysAgo(7),
        periodEnd: new Date(),
      },
    ],
    skipDuplicates: true,
  });
}

async function upsertDemoUser({
  email,
  name,
  password,
}: {
  email: string;
  name: string;
  password: string;
}) {
  return prisma.user.upsert({
    where: { email },
    update: {
      emailVerifiedAt: new Date(),
      failedLoginCount: 0,
      lockedUntil: null,
      name,
      passwordHash: hashPassword(password),
    },
    create: {
      email,
      emailVerifiedAt: new Date(),
      name,
      passwordHash: hashPassword(password),
    },
  });
}

async function upsertClient(workspaceId: string, name: string) {
  const existing = await prisma.client.findFirst({
    where: { workspaceId, name },
  });

  if (existing) {
    return existing;
  }

  return prisma.client.create({
    data: {
      workspaceId,
      name,
      contactEmail: `hello@${name.toLowerCase().replaceAll(" ", "")}.local`,
    },
  });
}

async function createDomainBundle(input: {
  workspaceId: string;
  clientId: string;
  domain: string;
  platform: "WORDPRESS" | "SHOPIFY" | "WEBFLOW" | "CUSTOM";
  healthScore: number;
  pages: number;
  criticalIssues: number;
  warningIssues: number;
  assignedToId?: string;
}) {
  const domain = await prisma.domain.upsert({
    where: {
      workspaceId_domain: {
        workspaceId: input.workspaceId,
        domain: input.domain,
      },
    },
    update: {
      healthScore: input.healthScore,
      verificationStatus: "VERIFIED",
    },
    create: {
      workspaceId: input.workspaceId,
      clientId: input.clientId,
      domain: input.domain,
      platform: input.platform,
      verificationStatus: "VERIFIED",
      crawlFrequency: "WEEKLY",
      healthScore: input.healthScore,
      lastCrawledAt: daysAgo(1),
    },
  });

  const crawlRun = await prisma.crawlRun.create({
    data: {
      domainId: domain.id,
      status: "COMPLETED",
      trigger: "SCHEDULED",
      startedAt: daysAgo(1),
      completedAt: daysAgo(1),
      pagesDiscovered: input.pages,
      pagesCrawled: input.pages,
      pagesFailed: 0,
    },
  });

  const page = await prisma.page.upsert({
    where: {
      domainId_normalizedUrl: {
        domainId: domain.id,
        normalizedUrl: `https://${input.domain}/`,
      },
    },
    update: {
      lastSeenAt: new Date(),
      lastCrawledAt: daysAgo(1),
    },
    create: {
      domainId: domain.id,
      url: `https://${input.domain}/`,
      normalizedUrl: `https://${input.domain}/`,
      pageType: "homepage",
      importance: "CRITICAL",
      lastSeenAt: new Date(),
      lastCrawledAt: daysAgo(1),
    },
  });

  await prisma.pageSnapshot.create({
    data: {
      pageId: page.id,
      crawlRunId: crawlRun.id,
      statusCode: 200,
      title: `${input.domain} homepage`,
      metaDescription: `SEO snapshot for ${input.domain}`,
      h1: input.domain,
      canonical: `https://${input.domain}/`,
      robotsDirective: "index,follow",
      wordCount: 1200,
      metadataJson: {
        source: "seed",
      },
    },
  });

  if (input.criticalIssues > 0) {
    await prisma.seoIssue.create({
      data: {
        workspaceId: input.workspaceId,
        clientId: input.clientId,
        domainId: domain.id,
        pageId: page.id,
        issueType: "critical_regression",
        severity: "CRITICAL",
        priorityScore: 95,
        status: "OPEN",
        title:
          input.domain === "urbanthread.store"
            ? "Product template canonical points to non-200 URLs"
            : "Homepage became noindex after latest deploy",
        description: "Critical SEO regression detected during latest crawl.",
        recommendation:
          "Review the affected template and restore indexable canonical signals.",
        assignedToId: input.assignedToId,
      },
    });
  }

  if (input.warningIssues > 0) {
    await prisma.seoIssue.create({
      data: {
        workspaceId: input.workspaceId,
        clientId: input.clientId,
        domainId: domain.id,
        pageId: page.id,
        issueType: "duplicate_meta_description",
        severity: "WARNING",
        priorityScore: 64,
        status: "OPEN",
        title: "Duplicate meta descriptions across page template",
        description: "Multiple pages share the same meta description pattern.",
        recommendation:
          "Add unique page-specific copy to the affected template metadata.",
        assignedToId: input.assignedToId,
      },
    });
  }
}

function daysAgo(days: number) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

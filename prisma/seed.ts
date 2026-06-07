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

  const northstarDomain = await createDomainBundle({
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

  const urbanThreadDomain = await createDomainBundle({
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

  const apexTechDomain = await createDomainBundle({
    workspaceId: workspace.id,
    clientId: apexTech.id,
    domain: "apextech.io",
    platform: "CUSTOM",
    healthScore: 87,
    pages: 132,
    criticalIssues: 1,
    warningIssues: 14,
  });

  await seedProductSeoAnalytics({
    clientId: northstar.id,
    domain: northstarDomain,
    keywords: [
      "dentist near me",
      "cosmetic dentist austin",
      "emergency dental care",
      "teeth whitening cost",
      "northstar dental reviews",
    ],
    competitors: ["brightsmileclinic.com", "austindentalgroup.com"],
    workspaceId: workspace.id,
  });
  await seedProductSeoAnalytics({
    clientId: urbanThread.id,
    domain: urbanThreadDomain,
    keywords: [
      "sustainable streetwear",
      "organic cotton hoodie",
      "urban thread discount",
      "best capsule wardrobe",
      "streetwear brands",
    ],
    competitors: ["threadmarket.com", "everlane.com"],
    workspaceId: workspace.id,
  });
  await seedProductSeoAnalytics({
    clientId: apexTech.id,
    domain: apexTechDomain,
    keywords: [
      "workflow automation software",
      "ai ops dashboard",
      "apextech alternatives",
      "best incident management tool",
      "saas deployment checklist",
    ],
    competitors: ["opsforge.io", "deploypilot.com"],
    workspaceId: workspace.id,
  });
  await seedSavedAnalyticsViews(workspace.id, productOwner.id, northstarDomain.id);

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

  for (const pagePath of ["/pricing", "/services", "/blog/seo-checklist"]) {
    await prisma.page.upsert({
      where: {
        domainId_normalizedUrl: {
          domainId: domain.id,
          normalizedUrl: `https://${input.domain}${pagePath}`,
        },
      },
      update: {
        lastSeenAt: new Date(),
        lastCrawledAt: daysAgo(1),
      },
      create: {
        domainId: domain.id,
        importance: pagePath === "/pricing" ? "IMPORTANT" : "NORMAL",
        lastCrawledAt: daysAgo(1),
        lastSeenAt: new Date(),
        normalizedUrl: `https://${input.domain}${pagePath}`,
        pageType: pagePath.startsWith("/blog") ? "article" : "landing",
        url: `https://${input.domain}${pagePath}`,
      },
    });
  }

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

  return domain;
}

async function seedProductSeoAnalytics(input: {
  clientId: string;
  competitors: string[];
  domain: { domain: string; id: string };
  keywords: string[];
  workspaceId: string;
}) {
  await prisma.competitorDomain.createMany({
    data: input.competitors.map((competitor, index) => ({
      clientId: input.clientId,
      domain: competitor,
      domainId: input.domain.id,
      label: index === 0 ? "Direct competitor" : "SERP competitor",
      lastSeenAt: daysAgo(index + 1),
      source: "SEED",
      workspaceId: input.workspaceId,
    })),
    skipDuplicates: true,
  });

  const trackedKeywords = [];

  for (const [index, keyword] of input.keywords.entries()) {
    const trackedKeyword = await prisma.trackedKeyword.upsert({
      where: {
        domainId_keyword_country_device_engine: {
          country: "US",
          device: index % 2 ? "MOBILE" : "DESKTOP",
          domainId: input.domain.id,
          engine: "GOOGLE",
          keyword,
        },
      },
      update: {
        frequency: index < 2 ? "DAILY" : "WEEKLY",
        status: "ACTIVE",
        tags: index < 2 ? "priority,commercial" : "monitoring",
      },
      create: {
        country: "US",
        device: index % 2 ? "MOBILE" : "DESKTOP",
        domainId: input.domain.id,
        engine: "GOOGLE",
        frequency: index < 2 ? "DAILY" : "WEEKLY",
        keyword,
        locale: "en-US",
        tags: index < 2 ? "priority,commercial" : "monitoring",
        workspaceId: input.workspaceId,
      },
    });

    trackedKeywords.push(trackedKeyword);

    await prisma.keywordMetric.create({
      data: {
        competition: 0.28 + index * 0.08,
        country: "US",
        cpcCents: 180 + index * 95,
        difficulty: 24 + index * 9,
        keyword,
        language: "en",
        provider: "SEED_PROVIDER",
        searchVolume: 450 + index * 760,
        trackedKeywordId: trackedKeyword.id,
        trendJson: [32, 38, 35, 44, 51, 57, 62].map(
          (value) => value + index * 3,
        ),
        workspaceId: input.workspaceId,
      },
    });

    const latestPosition = 2 + index * 3;
    const previousPosition = latestPosition + (index % 2 ? -2 : 3);

    await prisma.rankObservation.createMany({
      data: [
        {
          country: "US",
          date: daysAgo(1),
          device: trackedKeyword.device,
          engine: "GOOGLE",
          position: latestPosition,
          trackedKeywordId: trackedKeyword.id,
          url: `https://${input.domain.domain}/${slugify(keyword)}`,
        },
        {
          country: "US",
          date: daysAgo(8),
          device: trackedKeyword.device,
          engine: "GOOGLE",
          position: previousPosition,
          trackedKeywordId: trackedKeyword.id,
          url: `https://${input.domain.domain}/${slugify(keyword)}`,
        },
        ...input.competitors.map((competitor, competitorIndex) => ({
          competitorDomain: competitor,
          country: "US",
          date: daysAgo(1),
          device: trackedKeyword.device,
          engine: "GOOGLE" as const,
          position: Math.max(1, latestPosition - competitorIndex - 1),
          trackedKeywordId: trackedKeyword.id,
          url: `https://${competitor}/${slugify(keyword)}`,
        })),
      ],
    });
  }

  const pages = ["/", "/pricing", "/services", "/blog/seo-checklist"];

  for (const [keywordIndex, keyword] of input.keywords.entries()) {
    for (let day = 0; day < 14; day += 1) {
      const impressions = 120 + keywordIndex * 80 + day * 9;
      const clicks = Math.max(1, Math.round(impressions * (0.035 + day / 1000)));
      const pageUrl = `https://${input.domain.domain}${pages[keywordIndex % pages.length]}`;

      await prisma.gscSearchMetric.upsert({
        where: {
          domainId_date_query_pageUrl_country_device: {
            country: "US",
            date: daysAgo(day),
            device: keywordIndex % 2 ? "MOBILE" : "DESKTOP",
            domainId: input.domain.id,
            pageUrl,
            query: keyword,
          },
        },
        update: {
          clicks,
          ctr: clicks / impressions,
          impressions,
          position: 3 + keywordIndex * 2 + day / 10,
        },
        create: {
          clicks,
          country: "US",
          ctr: clicks / impressions,
          date: daysAgo(day),
          device: keywordIndex % 2 ? "MOBILE" : "DESKTOP",
          domainId: input.domain.id,
          impressions,
          pageUrl,
          position: 3 + keywordIndex * 2 + day / 10,
          query: keyword,
        },
      });
    }
  }
}

async function seedSavedAnalyticsViews(
  workspaceId: string,
  userId: string,
  primaryDomainId: string,
) {
  await prisma.savedAnalyticsView.createMany({
    data: [
      {
        filtersJson: { domainId: primaryDomainId },
        isDefault: true,
        name: "Primary project",
        route: "/search-performance",
        userId,
        workspaceId,
      },
      {
        filtersJson: { domainId: primaryDomainId, query: "dentist" },
        name: "Dental growth terms",
        route: "/keyword-research",
        userId,
        workspaceId,
      },
      {
        filtersJson: { domainId: primaryDomainId },
        name: "Rank watchlist",
        route: "/rank-tracking",
        userId,
        workspaceId,
      },
      {
        filtersJson: { domainId: primaryDomainId },
        name: "Competitive snapshot",
        route: "/competitive-analysis",
        userId,
        workspaceId,
      },
    ],
    skipDuplicates: true,
  });
}

function slugify(value: string) {
  return value.toLowerCase().replaceAll(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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

import * as cheerio from "cheerio";
import { createHash } from "node:crypto";
import { getPrisma } from "@/lib/prisma";
import {
  detectCrawlArtifactChanges,
  detectSnapshotChanges,
  detectTemplateRegressions,
} from "@/lib/change-detection";
import { safeCrawlerFetch } from "@/lib/crawler-security";
import {
  assertDomainCrawlRateLimit,
  shouldPersistDiscoveredLinkDepth,
} from "@/lib/crawler-policy";
import { analyzeInternalLinkGraph } from "@/lib/link-graph-analyzer";
import { logger } from "@/lib/logger";
import { calculateSiteScore } from "@/lib/site-scoring";
import { analyzeCrawlArtifacts, analyzeSnapshot } from "@/lib/seo-analyzer";
import { storeHtmlSnapshot } from "@/lib/snapshot-storage";
import { inferPageTemplate } from "@/lib/template-detection";
import { buildDetectedIssueStatus } from "@/lib/issue-workflow";

const CRAWLER_USER_AGENT =
  "All In One SEO Bot/0.1 (+https://allinoneseo.local/bot)";
const HOMEPAGE_CRAWL_LINK_LIMIT = 50;

export async function createManualCrawlRun(domainId: string) {
  const prisma = getPrisma();
  const domain = await prisma.domain.findUnique({
    where: { id: domainId },
  });

  if (!domain) {
    throw new Error("Domain not found.");
  }

  await assertDomainCrawlRateLimit(domain.id);

  const crawlRun = await prisma.crawlRun.create({
    data: {
      domainId: domain.id,
      trigger: "MANUAL",
      status: "QUEUED",
    },
  });

  return crawlRun;
}

export async function runHomepageCrawl(crawlRunId: string) {
  const prisma = getPrisma();
  const crawlRun = await prisma.crawlRun.findUnique({
    where: { id: crawlRunId },
    include: {
      domain: {
        include: {
          verifications: {
            where: { status: "VERIFIED" },
            take: 1,
          },
        },
      },
    },
  });

  if (!crawlRun) {
    throw new Error("Crawl run not found.");
  }

  if (crawlRun.status === "CANCELLED") {
    return crawlRun;
  }

  if (
    crawlRun.domain.verificationStatus !== "VERIFIED" &&
    crawlRun.domain.verifications.length === 0
  ) {
    return prisma.crawlRun.update({
      where: { id: crawlRun.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        errorMessage: "Domain must be verified before running a full crawl.",
      },
    });
  }

  await prisma.crawlRun.update({
    where: { id: crawlRun.id },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  try {
    const homepageUrl = normalizeHomepageUrl(crawlRun.domain.domain);
    const robots = await fetchAndStoreRobots({
      crawlRunId: crawlRun.id,
      domainId: crawlRun.domainId,
      homepageUrl,
    });

    if (!robots.homepageAllowed) {
      await upsertRobotsBlockedIssue({
        workspaceId: crawlRun.domain.workspaceId,
        clientId: crawlRun.domain.clientId,
        domainId: crawlRun.domainId,
        domain: crawlRun.domain.domain,
      });
      await calculateSiteScore(crawlRun.domainId, crawlRun.id);

      return prisma.crawlRun.update({
        where: { id: crawlRun.id },
        data: {
          status: "FAILED",
          completedAt: new Date(),
          pagesFailed: 1,
          errorMessage: "Homepage crawl blocked by robots.txt.",
        },
      });
    }

    await fetchAndStoreSitemaps({
      crawlRunId: crawlRun.id,
      domainId: crawlRun.domainId,
      homepageUrl,
      sitemapUrls: robots.sitemapUrls,
    });
    await analyzeCrawlArtifacts(crawlRun.id);
    await detectCrawlArtifactChanges(crawlRun.id);

    const response = await safeCrawlerFetch(homepageUrl, {
      headers: {
        "user-agent": CRAWLER_USER_AGENT,
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    const snapshot = extractPageSnapshot(html, homepageUrl, response.status);
    const page = await prisma.page.upsert({
      where: {
        domainId_normalizedUrl: {
          domainId: crawlRun.domainId,
          normalizedUrl: homepageUrl,
        },
      },
      update: {
        url: homepageUrl,
        pageType: inferPageTemplate({ url: homepageUrl }),
        importance: "CRITICAL",
        lastSeenAt: new Date(),
        lastCrawledAt: new Date(),
      },
      create: {
        domainId: crawlRun.domainId,
        url: homepageUrl,
        normalizedUrl: homepageUrl,
        pageType: inferPageTemplate({ url: homepageUrl }),
        importance: "CRITICAL",
        lastSeenAt: new Date(),
        lastCrawledAt: new Date(),
      },
    });

    const htmlObjectKey = await storeHtmlSnapshot({
      crawlRunId: crawlRun.id,
      domainId: crawlRun.domainId,
      html,
      pageId: page.id,
    });

    const pageSnapshot = await prisma.pageSnapshot.create({
      data: {
        pageId: page.id,
        crawlRunId: crawlRun.id,
        statusCode: response.status,
        htmlObjectKey,
        title: snapshot.title,
        metaDescription: snapshot.metaDescription,
        h1: snapshot.h1,
        canonical: snapshot.canonical,
        robotsDirective: snapshot.robotsDirective,
        wordCount: snapshot.wordCount,
        contentHash: snapshot.contentHash,
        metadataJson: {
          discoveredInternalLinks: snapshot.internalLinks.map(
            (link) => link.url,
          ),
          finalUrl: response.url,
          contentType: response.headers.get("content-type"),
          h1Count: snapshot.h1Count,
          headings: snapshot.headings,
          imageCount: snapshot.imageCount,
          imagesMissingAlt: snapshot.imagesMissingAlt,
          invalidHreflangCount: snapshot.invalidHreflangCount,
          hreflangCount: snapshot.hreflangCount,
          paginationLinkCount: snapshot.paginationLinkCount,
          schemaCount: snapshot.schemaCount,
          schemaTypes: snapshot.schemaTypes,
        },
      },
    });

    await analyzeSnapshot(pageSnapshot.id);
    await detectSnapshotChanges(pageSnapshot.id);
    await detectTemplateRegressions(crawlRun.id);
    await persistInternalLinks({
      crawlRunId: crawlRun.id,
      domainId: crawlRun.domainId,
      sourcePageId: page.id,
      links: snapshot.internalLinks,
    });
    await analyzeInternalLinkGraph(crawlRun.id);
    await calculateSiteScore(crawlRun.domainId, crawlRun.id);

    await prisma.domain.update({
      where: { id: crawlRun.domainId },
      data: { lastCrawledAt: new Date() },
    });

    return prisma.crawlRun.update({
      where: { id: crawlRun.id },
      data: {
        status: response.ok ? "COMPLETED" : "FAILED",
        completedAt: new Date(),
        pagesDiscovered: snapshot.internalLinks.length + 1,
        pagesCrawled: 1,
        pagesFailed: response.ok ? 0 : 1,
        errorMessage: response.ok
          ? null
          : `Homepage returned HTTP ${response.status}.`,
      },
    });
  } catch (error) {
    logger.error("Homepage crawl failed.", {
      crawlRunId: crawlRun.id,
      domainId: crawlRun.domainId,
      error: error instanceof Error ? error.message : "Unknown crawler error",
    });

    return prisma.crawlRun.update({
      where: { id: crawlRun.id },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        pagesFailed: 1,
        errorMessage:
          error instanceof Error ? error.message : "Unknown crawler error.",
      },
    });
  }
}

async function upsertRobotsBlockedIssue(input: {
  workspaceId: string;
  clientId: string | null;
  domainId: string;
  domain: string;
}) {
  const prisma = getPrisma();
  const existing = await prisma.seoIssue.findFirst({
    where: {
      domainId: input.domainId,
      pageId: null,
      issueType: "homepage_blocked_by_robots",
    },
  });
  const data = {
    severity: "CRITICAL" as const,
    priorityScore: 96,
    status: buildDetectedIssueStatus(existing?.status),
    title: "Homepage blocked by robots.txt",
    description: `${input.domain} disallows crawling the homepage in robots.txt.`,
    recommendation:
      "Review robots.txt and allow crawling if the homepage should be monitored and indexed.",
    lastDetectedAt: new Date(),
    resolvedAt: null,
  };

  if (existing) {
    await prisma.seoIssue.update({ where: { id: existing.id }, data });
  } else {
    await prisma.seoIssue.create({
      data: {
        ...data,
        workspaceId: input.workspaceId,
        clientId: input.clientId,
        domainId: input.domainId,
        issueType: "homepage_blocked_by_robots",
      },
    });
  }
}

function extractPageSnapshot(
  html: string,
  pageUrl: string,
  statusCode: number,
) {
  const $ = cheerio.load(html);
  const text = $("body").text().replace(/\s+/g, " ").trim();
  const origin = new URL(pageUrl).origin;
  const internalLinks = new Map<string, string | null>();
  const headings = $("h1,h2,h3,h4,h5,h6")
    .map((_, element) => ({
      level: Number(element.tagName.replace("h", "")),
      text: $(element).text().replace(/\s+/g, " ").trim(),
    }))
    .get()
    .filter((heading) => heading.text);
  const imageCount = $("img").length;
  const imagesMissingAlt = $("img").filter(
    (_, element) => !($(element).attr("alt") ?? "").trim(),
  ).length;
  const schemaTypes = $('script[type="application/ld+json"]')
    .map((_, element) => readSchemaTypes($(element).text()))
    .get()
    .flat();
  const hreflangLinks = $('link[rel="alternate"][hreflang]');
  const invalidHreflangCount = hreflangLinks.filter(
    (_, element) => !($(element).attr("href") ?? "").trim(),
  ).length;
  const paginationLinkCount = $('link[rel="next"],link[rel="prev"]').length;

  $("a[href]").each((_, element) => {
    const href = $(element).attr("href");

    if (!href) {
      return;
    }

    const normalizedUrl = normalizeDiscoveredUrl(href, pageUrl);

    if (normalizedUrl?.startsWith(origin)) {
      const anchorText = $(element).text().replace(/\s+/g, " ").trim() || null;
      internalLinks.set(normalizedUrl, anchorText);
    }
  });

  return {
    statusCode,
    title: $("title").first().text().trim() || null,
    metaDescription:
      $('meta[name="description"]').first().attr("content")?.trim() || null,
    h1: $("h1").first().text().replace(/\s+/g, " ").trim() || null,
    h1Count: $("h1").length,
    headings,
    canonical: $('link[rel="canonical"]').first().attr("href")?.trim() || null,
    robotsDirective:
      $('meta[name="robots"]').first().attr("content")?.trim() || null,
    wordCount: text ? text.split(/\s+/).length : 0,
    contentHash: createHash("sha256").update(html).digest("hex"),
    imageCount,
    imagesMissingAlt,
    invalidHreflangCount,
    hreflangCount: hreflangLinks.length,
    paginationLinkCount,
    schemaCount: $('script[type="application/ld+json"]').length,
    schemaTypes,
    internalLinks: Array.from(internalLinks.entries())
      .slice(0, 250)
      .map(([url, anchorText]) => ({ url, anchorText })),
  };
}

function readSchemaTypes(value: string) {
  try {
    const parsed = JSON.parse(value) as unknown;
    const items = Array.isArray(parsed) ? parsed : [parsed];

    return items
      .map((item) => {
        if (!item || typeof item !== "object" || !("@type" in item)) {
          return null;
        }

        const type = (item as { "@type": unknown })["@type"];
        return Array.isArray(type) ? type.join(",") : String(type);
      })
      .filter((type): type is string => Boolean(type));
  } catch {
    return [];
  }
}

async function persistInternalLinks(input: {
  crawlRunId: string;
  domainId: string;
  sourcePageId: string;
  links: Array<{ url: string; anchorText: string | null }>;
}) {
  const prisma = getPrisma();
  const domain = await prisma.domain.findUnique({
    where: { id: input.domainId },
    select: { workspaceId: true, clientId: true },
  });

  await prisma.pageLink.deleteMany({
    where: {
      crawlRunId: input.crawlRunId,
      sourcePageId: input.sourcePageId,
    },
  });

  if (!shouldPersistDiscoveredLinkDepth(1)) {
    return;
  }

  for (const link of input.links.slice(0, HOMEPAGE_CRAWL_LINK_LIMIT)) {
    const targetPage = await prisma.page.upsert({
      where: {
        domainId_normalizedUrl: {
          domainId: input.domainId,
          normalizedUrl: link.url,
        },
      },
      update: {
        url: link.url,
        pageType: inferPageTemplate({ url: link.url }),
        lastSeenAt: new Date(),
      },
      create: {
        domainId: input.domainId,
        url: link.url,
        normalizedUrl: link.url,
        pageType: inferPageTemplate({ url: link.url }),
        firstSeenAt: new Date(),
        lastSeenAt: new Date(),
      },
    });
    const statusCode = await checkLinkStatus(link.url);

    await prisma.pageLink.create({
      data: {
        domainId: input.domainId,
        crawlRunId: input.crawlRunId,
        sourcePageId: input.sourcePageId,
        targetPageId: targetPage.id,
        href: link.url,
        normalizedUrl: link.url,
        anchorText: link.anchorText,
        isInternal: true,
        statusCode,
      },
    });

    if (domain && statusCode && statusCode >= 400) {
      await upsertBrokenInternalLinkIssue({
        workspaceId: domain.workspaceId,
        clientId: domain.clientId,
        domainId: input.domainId,
        pageId: input.sourcePageId,
        targetUrl: link.url,
        statusCode,
      });
    }
  }
}

export async function cancelCrawlRun(crawlRunId: string) {
  return getPrisma().crawlRun.update({
    where: { id: crawlRunId },
    data: {
      status: "CANCELLED",
      completedAt: new Date(),
      errorMessage: "Crawl cancelled by user.",
    },
  });
}

async function checkLinkStatus(url: string) {
  try {
    const headResponse = await safeCrawlerFetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
      headers: { "user-agent": CRAWLER_USER_AGENT },
    });

    return headResponse.status;
  } catch {
    try {
      const getResponse = await safeCrawlerFetch(url, {
        method: "GET",
        redirect: "follow",
        signal: AbortSignal.timeout(8000),
        headers: { "user-agent": CRAWLER_USER_AGENT },
      });

      return getResponse.status;
    } catch {
      return null;
    }
  }
}

async function upsertBrokenInternalLinkIssue(input: {
  workspaceId: string;
  clientId: string | null;
  domainId: string;
  pageId: string;
  targetUrl: string;
  statusCode: number;
}) {
  const prisma = getPrisma();
  const issueType = `broken_internal_link:${input.targetUrl}`;
  const existing = await prisma.seoIssue.findFirst({
    where: {
      domainId: input.domainId,
      pageId: input.pageId,
      issueType,
    },
  });

  const data = {
    severity: "WARNING" as const,
    priorityScore: 70,
    status: buildDetectedIssueStatus(existing?.status),
    title: "Broken internal link detected",
    description: `Internal link ${input.targetUrl} returned HTTP ${input.statusCode}.`,
    recommendation:
      "Update the link target, restore the destination page, or remove the broken internal link.",
    lastDetectedAt: new Date(),
    resolvedAt: null,
  };

  if (existing) {
    await prisma.seoIssue.update({
      where: { id: existing.id },
      data,
    });
  } else {
    await prisma.seoIssue.create({
      data: {
        ...data,
        workspaceId: input.workspaceId,
        clientId: input.clientId,
        domainId: input.domainId,
        pageId: input.pageId,
        issueType,
      },
    });
  }
}

function normalizeHomepageUrl(domain: string) {
  return `https://${domain.replace(/^https?:\/\//i, "").replace(/\/+$/, "")}/`;
}

async function fetchAndStoreRobots(input: {
  crawlRunId: string;
  domainId: string;
  homepageUrl: string;
}) {
  const prisma = getPrisma();
  const robotsUrl = new URL("/robots.txt", input.homepageUrl).toString();

  try {
    const response = await safeCrawlerFetch(robotsUrl, {
      headers: { "user-agent": CRAWLER_USER_AGENT },
      signal: AbortSignal.timeout(10000),
    });
    const body = await response.text();
    const parsed = parseRobotsTxt(body);

    await prisma.crawlArtifact.create({
      data: {
        crawlRunId: input.crawlRunId,
        domainId: input.domainId,
        type: "ROBOTS_TXT",
        url: robotsUrl,
        statusCode: response.status,
        contentHash: createHash("sha256").update(body).digest("hex"),
        metadataJson: parsed,
      },
    });

    return {
      homepageAllowed: response.ok
        ? isPathAllowedByRobots("/", parsed.disallowRules)
        : true,
      sitemapUrls: parsed.sitemapUrls,
    };
  } catch (error) {
    await prisma.crawlArtifact.create({
      data: {
        crawlRunId: input.crawlRunId,
        domainId: input.domainId,
        type: "ROBOTS_TXT",
        url: robotsUrl,
        metadataJson: {
          error:
            error instanceof Error ? error.message : "Unknown robots error",
        },
      },
    });

    return { homepageAllowed: true, sitemapUrls: [] };
  }
}

async function fetchAndStoreSitemaps(input: {
  crawlRunId: string;
  domainId: string;
  homepageUrl: string;
  sitemapUrls: string[];
}) {
  const defaultSitemap = new URL("/sitemap.xml", input.homepageUrl).toString();
  const sitemapUrls = Array.from(
    new Set([...input.sitemapUrls, defaultSitemap]),
  );
  const prisma = getPrisma();

  for (const sitemapUrl of sitemapUrls.slice(0, 5)) {
    try {
      const response = await safeCrawlerFetch(sitemapUrl, {
        headers: { "user-agent": CRAWLER_USER_AGENT },
        signal: AbortSignal.timeout(10000),
      });
      const body = await response.text();
      const urls = extractSitemapUrls(body);

      await prisma.crawlArtifact.create({
        data: {
          crawlRunId: input.crawlRunId,
          domainId: input.domainId,
          type: "SITEMAP",
          url: sitemapUrl,
          statusCode: response.status,
          contentHash: createHash("sha256").update(body).digest("hex"),
          metadataJson: {
            urlCount: urls.length,
            urls: urls.slice(0, 500),
          },
        },
      });
    } catch (error) {
      await prisma.crawlArtifact.create({
        data: {
          crawlRunId: input.crawlRunId,
          domainId: input.domainId,
          type: "SITEMAP",
          url: sitemapUrl,
          metadataJson: {
            error:
              error instanceof Error ? error.message : "Unknown sitemap error",
          },
        },
      });
    }
  }
}

export function parseRobotsTxt(body: string) {
  const sitemapUrls: string[] = [];
  const disallowRules: string[] = [];
  let appliesToAllAgents = false;

  for (const rawLine of body.split(/\r?\n/)) {
    const line = rawLine.split("#")[0]?.trim();

    if (!line) {
      continue;
    }

    const [rawKey, ...rawValueParts] = line.split(":");
    const key = rawKey?.trim().toLowerCase();
    const value = rawValueParts.join(":").trim();

    if (key === "user-agent") {
      appliesToAllAgents = value === "*";
    }

    if (key === "sitemap" && value) {
      sitemapUrls.push(value);
    }

    if (key === "disallow" && appliesToAllAgents && value) {
      disallowRules.push(value);
    }
  }

  return { sitemapUrls, disallowRules };
}

export function isPathAllowedByRobots(
  pathname: string,
  disallowRules: string[],
) {
  return !disallowRules.some(
    (rule) => rule === "/" || pathname.startsWith(rule),
  );
}

export function extractSitemapUrls(body: string) {
  const $ = cheerio.load(body, { xmlMode: true });

  return $("loc")
    .map((_, element) => $(element).text().trim())
    .get()
    .filter(Boolean);
}

export function normalizeDiscoveredUrl(href: string, baseUrl: string) {
  try {
    const url = new URL(href, baseUrl);
    url.hash = "";
    return url.toString();
  } catch {
    return null;
  }
}

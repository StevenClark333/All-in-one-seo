import type { IssueSeverity, PrismaClient, Prisma } from "@prisma/client";
import { buildDetectedIssueStatus } from "@/lib/issue-workflow";
import { getPrisma } from "@/lib/prisma";

type SnapshotForAnalysis = {
  id: string;
  pageId: string;
  statusCode: number;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonical: string | null;
  robotsDirective: string | null;
  wordCount: number | null;
  contentHash: string | null;
  metadataJson: Prisma.JsonValue;
  page: {
    id: string;
    domainId: string;
    url: string;
    domain: {
      id: string;
      workspaceId: string;
      clientId: string | null;
    };
  };
};

type RuleIssue = {
  issueType: string;
  severity: IssueSeverity;
  priorityScore: number;
  title: string;
  description: string;
  recommendation: string;
};

export async function analyzeSnapshot(snapshotId: string) {
  const prisma = getPrisma();
  const snapshot = await prisma.pageSnapshot.findUnique({
    where: { id: snapshotId },
    include: {
      page: {
        include: {
          domain: true,
        },
      },
    },
  });

  if (!snapshot) {
    throw new Error("Snapshot not found.");
  }

  const detectedIssues = await runRules(prisma, snapshot);
  await upsertDetectedIssues(prisma, snapshot, detectedIssues);
  await resolveMissingIssues(prisma, snapshot, detectedIssues);

  return detectedIssues;
}

export async function analyzeCrawlArtifacts(crawlRunId: string) {
  const prisma = getPrisma();
  const crawlRun = await prisma.crawlRun.findUnique({
    where: { id: crawlRunId },
    include: {
      domain: true,
      artifacts: true,
    },
  });

  if (!crawlRun) {
    throw new Error("Crawl run not found.");
  }

  const issues: RuleIssue[] = [];
  const robotsArtifact = crawlRun.artifacts.find(
    (artifact) => artifact.type === "ROBOTS_TXT",
  );
  const sitemapArtifacts = crawlRun.artifacts.filter(
    (artifact) => artifact.type === "SITEMAP",
  );

  if (
    !robotsArtifact ||
    !robotsArtifact.statusCode ||
    robotsArtifact.statusCode >= 400
  ) {
    issues.push({
      issueType: "robots_txt_unavailable_or_malformed",
      severity: "WARNING",
      priorityScore: 58,
      title: "Robots.txt unavailable or malformed",
      description: `${crawlRun.domain.domain} did not return a healthy robots.txt response.`,
      recommendation:
        "Confirm robots.txt is available, valid, and not unintentionally blocking important pages.",
    });
  }

  const healthySitemap = sitemapArtifacts.some((artifact) => {
    const metadata = getMetadata(artifact.metadataJson);
    return artifact.statusCode === 200 && Number(metadata.urlCount ?? 0) > 0;
  });

  if (!healthySitemap) {
    issues.push({
      issueType: "sitemap_unavailable",
      severity: "WARNING",
      priorityScore: 62,
      title: "Sitemap unavailable or empty",
      description: `${crawlRun.domain.domain} did not expose a usable sitemap during the crawl.`,
      recommendation:
        "Publish a valid XML sitemap and reference it from robots.txt when possible.",
    });
  }

  await upsertDomainIssues(prisma, crawlRun.domain, issues);
  return issues;
}

export async function runRules(
  prisma: PrismaClient,
  snapshot: SnapshotForAnalysis,
): Promise<RuleIssue[]> {
  const issues: RuleIssue[] = [];
  const metadata = getMetadata(snapshot.metadataJson);
  const h1Count = Number(metadata.h1Count ?? 0);
  const imagesMissingAlt = Number(metadata.imagesMissingAlt ?? 0);
  const imageCount = Number(metadata.imageCount ?? 0);
  const schemaCount = Number(metadata.schemaCount ?? 0);
  const invalidHreflangCount = Number(metadata.invalidHreflangCount ?? 0);
  const hreflangCount = Number(metadata.hreflangCount ?? 0);
  const paginationLinkCount = Number(metadata.paginationLinkCount ?? 0);
  const redirectChainLength = Number(metadata.redirectChainLength ?? 0);
  const schemaTypes = readStringArray(metadata.schemaTypes);
  const headings = Array.isArray(metadata.headings)
    ? metadata.headings.filter(isHeading)
    : [];

  if (snapshot.statusCode >= 500) {
    issues.push({
      issueType: "page_5xx",
      severity: "CRITICAL",
      priorityScore: 100,
      title: "Page returns a 5xx status",
      description: `${snapshot.page.url} returned HTTP ${snapshot.statusCode}.`,
      recommendation:
        "Investigate server errors and restore the page to a stable 200 response.",
    });
  } else if (snapshot.statusCode >= 400) {
    issues.push({
      issueType: "page_4xx",
      severity: "CRITICAL",
      priorityScore: 95,
      title: "Page returns a 4xx status",
      description: `${snapshot.page.url} returned HTTP ${snapshot.statusCode}.`,
      recommendation:
        "Restore the page, redirect it intentionally, or remove internal links to it.",
    });
  }

  if (!snapshot.title) {
    issues.push({
      issueType: "missing_title",
      severity: "CRITICAL",
      priorityScore: 90,
      title: "Missing page title",
      description: `${snapshot.page.url} does not include a title tag.`,
      recommendation:
        "Add a unique, descriptive title tag that reflects the page intent.",
    });
  }

  if (
    snapshot.title &&
    (snapshot.title.length < 20 || snapshot.title.length > 65)
  ) {
    issues.push({
      issueType: "weak_title",
      severity: "SUGGESTION",
      priorityScore: 35,
      title: "Weak title length",
      description: `${snapshot.page.url} has a title that is ${snapshot.title.length} characters long.`,
      recommendation:
        "Use a descriptive title between roughly 20 and 65 characters when appropriate.",
    });
  }

  if (snapshot.title) {
    const duplicateTitle = await prisma.pageSnapshot.findFirst({
      where: {
        id: { not: snapshot.id },
        title: snapshot.title,
        page: { domainId: snapshot.page.domainId },
      },
      select: { id: true },
    });

    if (duplicateTitle) {
      issues.push({
        issueType: "duplicate_title",
        severity: "WARNING",
        priorityScore: 68,
        title: "Duplicate title",
        description: `${snapshot.page.url} shares its title with another crawled page.`,
        recommendation:
          "Make the title unique so search engines can distinguish page intent.",
      });
    }
  }

  if (snapshot.contentHash) {
    const duplicateContent = await prisma.pageSnapshot.findFirst({
      where: {
        contentHash: snapshot.contentHash,
        id: { not: snapshot.id },
        page: { domainId: snapshot.page.domainId },
      },
      select: { id: true },
    });

    if (duplicateContent) {
      issues.push({
        issueType: "duplicate_content_cluster",
        severity: "WARNING",
        priorityScore: 66,
        title: "Duplicate content detected",
        description: `${snapshot.page.url} appears to share the same content body as another crawled page.`,
        recommendation:
          "Review canonicalization, faceted URLs, duplicate templates, and indexation rules for this content cluster.",
      });
    }
  }

  if (!snapshot.metaDescription) {
    issues.push({
      issueType: "missing_meta_description",
      severity: "WARNING",
      priorityScore: 65,
      title: "Missing meta description",
      description: `${snapshot.page.url} does not include a meta description.`,
      recommendation:
        "Add a concise meta description that summarizes the page and encourages clicks.",
    });
  }

  if (
    snapshot.metaDescription &&
    (snapshot.metaDescription.length < 70 ||
      snapshot.metaDescription.length > 160)
  ) {
    issues.push({
      issueType: "weak_meta_description",
      severity: "SUGGESTION",
      priorityScore: 32,
      title: "Weak meta description length",
      description: `${snapshot.page.url} has a meta description that is ${snapshot.metaDescription.length} characters long.`,
      recommendation:
        "Use a concise description that summarizes the page, usually around 70 to 160 characters.",
    });
  }

  if (snapshot.metaDescription) {
    const duplicateMeta = await prisma.pageSnapshot.findFirst({
      where: {
        id: { not: snapshot.id },
        metaDescription: snapshot.metaDescription,
        page: { domainId: snapshot.page.domainId },
      },
      select: { id: true },
    });

    if (duplicateMeta) {
      issues.push({
        issueType: "duplicate_meta_description",
        severity: "WARNING",
        priorityScore: 64,
        title: "Duplicate meta description",
        description: `${snapshot.page.url} shares its meta description with another crawled page.`,
        recommendation:
          "Write unique meta descriptions for important pages and templates.",
      });
    }
  }

  if (!snapshot.h1) {
    issues.push({
      issueType: "missing_h1",
      severity: "WARNING",
      priorityScore: 60,
      title: "Missing H1",
      description: `${snapshot.page.url} does not include a visible H1.`,
      recommendation:
        "Add one clear H1 that describes the main purpose of the page.",
    });
  }

  if (h1Count > 1) {
    issues.push({
      issueType: "multiple_h1",
      severity: "WARNING",
      priorityScore: 52,
      title: "Multiple H1 tags",
      description: `${snapshot.page.url} includes ${h1Count} H1 tags.`,
      recommendation:
        "Use one primary H1 and move secondary section titles to lower heading levels.",
    });
  }

  if (hasPoorHeadingHierarchy(headings)) {
    issues.push({
      issueType: "poor_heading_hierarchy",
      severity: "SUGGESTION",
      priorityScore: 30,
      title: "Poor heading hierarchy",
      description: `${snapshot.page.url} appears to skip heading levels.`,
      recommendation:
        "Structure headings in a logical order so users and crawlers can understand the page outline.",
    });
  }

  if (!snapshot.canonical) {
    issues.push({
      issueType: "missing_canonical",
      severity: "WARNING",
      priorityScore: 55,
      title: "Missing canonical tag",
      description: `${snapshot.page.url} does not include a canonical tag.`,
      recommendation:
        "Add a self-referencing canonical unless this page intentionally canonicalizes elsewhere.",
    });
  }

  if (snapshot.canonical) {
    const canonicalStatus = await checkUrlStatus(
      snapshot.canonical,
      snapshot.page.url,
    );

    if (canonicalStatus === null) {
      issues.push({
        issueType: "broken_canonical",
        severity: "CRITICAL",
        priorityScore: 88,
        title: "Canonical URL could not be checked",
        description: `${snapshot.page.url} has a canonical URL that could not be reached.`,
        recommendation:
          "Verify the canonical URL is valid, absolute, and reachable.",
      });
    } else if (canonicalStatus >= 400) {
      issues.push({
        issueType: "canonical_non_200",
        severity: "CRITICAL",
        priorityScore: 92,
        title: "Canonical points to a non-200 URL",
        description: `${snapshot.page.url} canonical returned HTTP ${canonicalStatus}.`,
        recommendation:
          "Update the canonical to a reachable 200 page or restore the canonical target.",
      });
    }
  }

  if (redirectChainLength > 1) {
    issues.push({
      issueType: "redirect_chain",
      severity: "WARNING",
      priorityScore: 72,
      title: "Redirect chain detected",
      description: `${snapshot.page.url} resolved through ${redirectChainLength} redirects.`,
      recommendation:
        "Update internal links, sitemap URLs, and canonical targets to point directly to the final 200 URL.",
    });
  }

  if (hreflangCount > 0 && invalidHreflangCount > 0) {
    issues.push({
      issueType: "invalid_hreflang",
      severity: "WARNING",
      priorityScore: 57,
      title: "Invalid hreflang links",
      description: `${snapshot.page.url} has ${invalidHreflangCount} hreflang alternates without valid href targets.`,
      recommendation:
        "Ensure every hreflang alternate uses a valid absolute URL and returns the expected language or regional page.",
    });
  }

  if (
    ["category", "collection", "blog"].includes(
      String(snapshot.page.url).toLowerCase().includes("/page/") ||
        String(snapshot.page.url).includes("?page=")
        ? "category"
        : "",
    ) &&
    paginationLinkCount === 0
  ) {
    issues.push({
      issueType: "missing_pagination_links",
      severity: "SUGGESTION",
      priorityScore: 34,
      title: "Pagination links missing",
      description: `${snapshot.page.url} appears paginated but does not expose rel next or prev links.`,
      recommendation:
        "Add crawlable pagination links and confirm paginated collection pages are discoverable.",
    });
  }

  if (
    isLikelyProductPage(snapshot.page.url) &&
    !schemaTypes.some((type) => type.toLowerCase().includes("product"))
  ) {
    issues.push({
      issueType: "product_schema_missing",
      severity: "WARNING",
      priorityScore: 63,
      title: "Product schema missing",
      description: `${snapshot.page.url} looks like a product page but does not expose Product structured data.`,
      recommendation:
        "Add Product schema with name, image, offers, price, availability, and review data where available.",
    });
  }

  if (snapshot.robotsDirective?.toLowerCase().includes("noindex")) {
    issues.push({
      issueType: "page_noindex",
      severity: "CRITICAL",
      priorityScore: 98,
      title: "Page is marked noindex",
      description: `${snapshot.page.url} includes a noindex robots directive.`,
      recommendation:
        "Remove noindex if this page should be eligible for search indexing.",
    });
  }

  if ((snapshot.wordCount ?? 0) > 0 && (snapshot.wordCount ?? 0) < 300) {
    issues.push({
      issueType: "thin_content",
      severity: "SUGGESTION",
      priorityScore: 28,
      title: "Thin content",
      description: `${snapshot.page.url} has only ${snapshot.wordCount ?? 0} detected words.`,
      recommendation:
        "Review whether the page answers its search intent with enough useful content.",
    });
  }

  if (imageCount > 0 && imagesMissingAlt > 0) {
    issues.push({
      issueType: "missing_image_alt",
      severity: "SUGGESTION",
      priorityScore: 25,
      title: "Images missing alt text",
      description: `${snapshot.page.url} has ${imagesMissingAlt} of ${imageCount} images missing alt text.`,
      recommendation:
        "Add descriptive alt text to meaningful images and empty alt text to decorative images.",
    });
  }

  if (schemaCount === 0) {
    issues.push({
      issueType: "missing_schema",
      severity: "SUGGESTION",
      priorityScore: 22,
      title: "No structured data detected",
      description: `${snapshot.page.url} does not include JSON-LD structured data.`,
      recommendation:
        "Add relevant schema markup for the page type, such as Organization, Article, Product, or BreadcrumbList.",
    });
  }

  return issues;
}

async function upsertDetectedIssues(
  prisma: PrismaClient,
  snapshot: SnapshotForAnalysis,
  issues: RuleIssue[],
) {
  for (const issue of issues) {
    const existing = await prisma.seoIssue.findFirst({
      where: {
        domainId: snapshot.page.domainId,
        pageId: snapshot.pageId,
        issueType: issue.issueType,
      },
    });

    if (existing) {
      await prisma.seoIssue.update({
        where: { id: existing.id },
        data: {
          severity: issue.severity,
          priorityScore: issue.priorityScore,
          status: buildDetectedIssueStatus(existing.status),
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
          lastDetectedAt: new Date(),
          resolvedAt: null,
        },
      });
    } else {
      await prisma.seoIssue.create({
        data: {
          workspaceId: snapshot.page.domain.workspaceId,
          clientId: snapshot.page.domain.clientId,
          domainId: snapshot.page.domainId,
          pageId: snapshot.pageId,
          issueType: issue.issueType,
          severity: issue.severity,
          priorityScore: issue.priorityScore,
          status: "OPEN",
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
        },
      });
    }
  }
}

async function resolveMissingIssues(
  prisma: PrismaClient,
  snapshot: SnapshotForAnalysis,
  detectedIssues: RuleIssue[],
) {
  const detectedTypes = detectedIssues.map((issue) => issue.issueType);

  await prisma.seoIssue.updateMany({
    where: {
      domainId: snapshot.page.domainId,
      pageId: snapshot.pageId,
      issueType: {
        in: [
          "page_5xx",
          "page_4xx",
          "missing_title",
          "weak_title",
          "duplicate_title",
          "missing_meta_description",
          "weak_meta_description",
          "duplicate_meta_description",
          "missing_h1",
          "multiple_h1",
          "poor_heading_hierarchy",
          "missing_canonical",
          "broken_canonical",
          "canonical_non_200",
          "page_noindex",
          "thin_content",
          "missing_image_alt",
          "missing_schema",
          "duplicate_content_cluster",
          "redirect_chain",
          "invalid_hreflang",
          "missing_pagination_links",
          "product_schema_missing",
        ],
        notIn: detectedTypes,
      },
      status: { in: ["OPEN", "IN_PROGRESS", "REAPPEARED"] },
    },
    data: {
      status: "FIXED",
      resolvedAt: new Date(),
    },
  });
}

async function upsertDomainIssues(
  prisma: PrismaClient,
  domain: {
    id: string;
    workspaceId: string;
    clientId: string | null;
    domain: string;
  },
  issues: RuleIssue[],
) {
  for (const issue of issues) {
    const existing = await prisma.seoIssue.findFirst({
      where: {
        domainId: domain.id,
        pageId: null,
        issueType: issue.issueType,
      },
    });

    if (existing) {
      await prisma.seoIssue.update({
        where: { id: existing.id },
        data: {
          severity: issue.severity,
          priorityScore: issue.priorityScore,
          status: buildDetectedIssueStatus(existing.status),
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
          lastDetectedAt: new Date(),
          resolvedAt: null,
        },
      });
    } else {
      await prisma.seoIssue.create({
        data: {
          workspaceId: domain.workspaceId,
          clientId: domain.clientId,
          domainId: domain.id,
          issueType: issue.issueType,
          severity: issue.severity,
          priorityScore: issue.priorityScore,
          status: "OPEN",
          title: issue.title,
          description: issue.description,
          recommendation: issue.recommendation,
        },
      });
    }
  }
}

function getMetadata(value: Prisma.JsonValue) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Prisma.JsonValue>;
  }

  return {};
}

function isHeading(value: unknown): value is { level: number; text: string } {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof (value as { level?: unknown }).level === "number" &&
    typeof (value as { text?: unknown }).text === "string"
  );
}

function readStringArray(value: Prisma.JsonValue) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function isLikelyProductPage(url: string) {
  const normalizedUrl = url.toLowerCase();
  return (
    normalizedUrl.includes("/products/") ||
    normalizedUrl.includes("/product/") ||
    normalizedUrl.includes("/p/")
  );
}

export function hasPoorHeadingHierarchy(
  headings: Array<{ level: number; text: string }>,
) {
  let previousLevel = 0;

  for (const heading of headings) {
    if (previousLevel && heading.level > previousLevel + 1) {
      return true;
    }

    previousLevel = heading.level;
  }

  return false;
}

async function checkUrlStatus(url: string, baseUrl: string) {
  try {
    const normalizedUrl = new URL(url, baseUrl).toString();
    const response = await fetch(normalizedUrl, {
      method: "HEAD",
      redirect: "follow",
      signal: AbortSignal.timeout(8000),
    });

    return response.status;
  } catch {
    return null;
  }
}

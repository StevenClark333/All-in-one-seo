import type {
  CrawlArtifactType,
  IssueSeverity,
  Prisma,
  PrismaClient,
} from "@prisma/client";
import { getPrisma } from "@/lib/prisma";
import { inferPageTemplate } from "@/lib/template-detection";

type SnapshotWithPage = {
  id: string;
  pageId: string;
  crawlRunId: string;
  statusCode: number;
  title: string | null;
  metaDescription: string | null;
  h1: string | null;
  canonical: string | null;
  robotsDirective: string | null;
  metadataJson: Prisma.JsonValue;
  page: {
    id: string;
    domainId: string;
    url?: string;
    pageType?: string | null;
  };
};

type ChangeCandidate = {
  changeType: string;
  severity: IssueSeverity;
  previousValue: string | null;
  newValue: string | null;
};

type CrawlArtifactForChange = {
  id: string;
  crawlRunId: string;
  domainId: string;
  type: CrawlArtifactType;
  url: string;
  statusCode: number | null;
  contentHash: string | null;
  metadataJson: Prisma.JsonValue;
};

type TemplateSnapshotPair = {
  current: SnapshotWithPage;
  previous: Omit<SnapshotWithPage, "page">;
};

type TemplateRegressionCandidate = ChangeCandidate & {
  templateKey: string;
  affectedPages: number;
  templatePages: number;
};

const TEMPLATE_REGRESSION_MIN_AFFECTED_PAGES = 3;
const TEMPLATE_REGRESSION_MIN_AFFECTED_RATIO = 0.5;

export async function detectSnapshotChanges(snapshotId: string) {
  const prisma = getPrisma();
  const currentSnapshot = await prisma.pageSnapshot.findUnique({
    where: { id: snapshotId },
    include: { page: true },
  });

  if (!currentSnapshot) {
    throw new Error("Snapshot not found.");
  }

  const previousSnapshot = await prisma.pageSnapshot.findFirst({
    where: {
      pageId: currentSnapshot.pageId,
      id: { not: currentSnapshot.id },
      createdAt: { lt: currentSnapshot.createdAt },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!previousSnapshot) {
    return [];
  }

  const changes = compareSnapshots(currentSnapshot, previousSnapshot);
  await replaceCrawlRunChanges(prisma, currentSnapshot, changes);

  return changes;
}

export async function detectCrawlArtifactChanges(crawlRunId: string) {
  const prisma = getPrisma();
  const currentArtifacts = await prisma.crawlArtifact.findMany({
    where: { crawlRunId },
    orderBy: { createdAt: "asc" },
  });
  const allChanges: ChangeCandidate[] = [];

  for (const artifact of currentArtifacts) {
    const previousArtifact = await prisma.crawlArtifact.findFirst({
      where: {
        crawlRunId: { not: crawlRunId },
        domainId: artifact.domainId,
        type: artifact.type,
        url: artifact.url,
        createdAt: { lt: artifact.createdAt },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!previousArtifact) {
      continue;
    }

    const changes = compareCrawlArtifacts(artifact, previousArtifact);
    await replaceArtifactChanges(prisma, artifact, changes);
    allChanges.push(...changes);
  }

  return allChanges;
}

export async function detectTemplateRegressions(crawlRunId: string) {
  const prisma = getPrisma();
  const currentSnapshots = await prisma.pageSnapshot.findMany({
    where: { crawlRunId },
    include: { page: true },
    orderBy: { createdAt: "asc" },
  });

  if (!currentSnapshots.length) {
    return [];
  }

  const snapshotPairs: TemplateSnapshotPair[] = [];

  for (const snapshot of currentSnapshots) {
    const previousSnapshot = await prisma.pageSnapshot.findFirst({
      where: {
        pageId: snapshot.pageId,
        id: { not: snapshot.id },
        createdAt: { lt: snapshot.createdAt },
      },
      orderBy: { createdAt: "desc" },
    });

    if (previousSnapshot) {
      snapshotPairs.push({
        current: snapshot,
        previous: previousSnapshot,
      });
    }
  }

  const changes = compareTemplateRegressions(snapshotPairs);
  await replaceTemplateRegressionChanges(
    prisma,
    currentSnapshots[0].page.domainId,
    crawlRunId,
    changes,
  );

  return changes;
}

export function compareSnapshots(
  current: SnapshotWithPage,
  previous: Omit<SnapshotWithPage, "page">,
): ChangeCandidate[] {
  const changes: ChangeCandidate[] = [];
  const currentMetadata = getMetadata(current.metadataJson);
  const previousMetadata = getMetadata(previous.metadataJson);

  addChange(
    changes,
    "status_code_changed",
    previous.statusCode,
    current.statusCode,
    {
      severity:
        current.statusCode >= 500 || current.statusCode >= 400
          ? "CRITICAL"
          : "WARNING",
    },
  );
  addChange(changes, "title_changed", previous.title, current.title, {
    severity: "WARNING",
  });
  addChange(
    changes,
    "meta_description_changed",
    previous.metaDescription,
    current.metaDescription,
    { severity: "WARNING" },
  );
  addChange(changes, "h1_changed", previous.h1, current.h1, {
    severity: "WARNING",
  });
  addChange(
    changes,
    "canonical_changed",
    previous.canonical,
    current.canonical,
    {
      severity: "CRITICAL",
    },
  );
  addChange(
    changes,
    "robots_directive_changed",
    previous.robotsDirective,
    current.robotsDirective,
    {
      severity: current.robotsDirective?.toLowerCase().includes("noindex")
        ? "CRITICAL"
        : "WARNING",
    },
  );

  if (
    !previous.robotsDirective?.toLowerCase().includes("noindex") &&
    current.robotsDirective?.toLowerCase().includes("noindex")
  ) {
    changes.push({
      changeType: "indexability_changed_to_noindex",
      severity: "CRITICAL",
      previousValue: previous.robotsDirective,
      newValue: current.robotsDirective,
    });
  }

  addChange(
    changes,
    "schema_count_changed",
    getNumber(previousMetadata.schemaCount),
    getNumber(currentMetadata.schemaCount),
    {
      severity:
        getNumber(previousMetadata.schemaCount) > 0 &&
        getNumber(currentMetadata.schemaCount) === 0
          ? "CRITICAL"
          : "WARNING",
    },
  );
  addChange(
    changes,
    "internal_links_changed",
    normalizeStringList(previousMetadata.discoveredInternalLinks).join("\n"),
    normalizeStringList(currentMetadata.discoveredInternalLinks).join("\n"),
    { severity: "WARNING" },
  );

  return changes;
}

export function compareTemplateRegressions(
  snapshotPairs: TemplateSnapshotPair[],
): TemplateRegressionCandidate[] {
  const grouped = new Map<string, TemplateSnapshotPair[]>();

  for (const pair of snapshotPairs) {
    const templateKey = inferTemplateKey(pair.current.page);
    const existing = grouped.get(templateKey) ?? [];

    existing.push(pair);
    grouped.set(templateKey, existing);
  }

  const regressions: TemplateRegressionCandidate[] = [];

  for (const [templateKey, pairs] of grouped.entries()) {
    const changesByType = new Map<
      string,
      Array<{ current: SnapshotWithPage; change: ChangeCandidate }>
    >();

    for (const pair of pairs) {
      for (const change of compareSnapshots(pair.current, pair.previous)) {
        const existing = changesByType.get(change.changeType) ?? [];

        existing.push({ current: pair.current, change });
        changesByType.set(change.changeType, existing);
      }
    }

    for (const [changeType, affected] of changesByType.entries()) {
      const affectedPages = affected.length;
      const affectedRatio = affectedPages / pairs.length;

      if (
        affectedPages < TEMPLATE_REGRESSION_MIN_AFFECTED_PAGES ||
        affectedRatio < TEMPLATE_REGRESSION_MIN_AFFECTED_RATIO
      ) {
        continue;
      }

      regressions.push({
        changeType: `template_regression:${templateKey}:${changeType}`,
        severity: affected.some((item) => item.change.severity === "CRITICAL")
          ? "CRITICAL"
          : "WARNING",
        previousValue: summarizeTemplateValues(
          templateKey,
          affected.map((item) => item.change.previousValue),
        ),
        newValue: summarizeTemplateValues(
          templateKey,
          affected.map((item) => item.change.newValue),
        ),
        templateKey,
        affectedPages,
        templatePages: pairs.length,
      });
    }
  }

  return regressions.sort((a, b) => a.changeType.localeCompare(b.changeType));
}

export function compareCrawlArtifacts(
  current: CrawlArtifactForChange,
  previous: CrawlArtifactForChange,
): ChangeCandidate[] {
  const changes: ChangeCandidate[] = [];
  const prefix = current.type === "ROBOTS_TXT" ? "robots_txt" : "sitemap";
  const currentMetadata = getMetadata(current.metadataJson);
  const previousMetadata = getMetadata(previous.metadataJson);

  addChange(
    changes,
    `${prefix}_status_changed`,
    previous.statusCode,
    current.statusCode,
    {
      severity:
        current.statusCode !== null && current.statusCode >= 400
          ? "CRITICAL"
          : "WARNING",
    },
  );
  addChange(
    changes,
    `${prefix}_content_changed`,
    previous.contentHash,
    current.contentHash,
    { severity: "WARNING" },
  );

  if (current.type === "ROBOTS_TXT") {
    addChange(
      changes,
      "robots_txt_disallow_rules_changed",
      normalizeStringList(previousMetadata.disallowRules).join("\n"),
      normalizeStringList(currentMetadata.disallowRules).join("\n"),
      {
        severity: normalizeStringList(currentMetadata.disallowRules).includes(
          "/",
        )
          ? "CRITICAL"
          : "WARNING",
      },
    );
    addChange(
      changes,
      "robots_txt_sitemaps_changed",
      normalizeStringList(previousMetadata.sitemapUrls).join("\n"),
      normalizeStringList(currentMetadata.sitemapUrls).join("\n"),
      { severity: "WARNING" },
    );
  }

  if (current.type === "SITEMAP") {
    addChange(
      changes,
      "sitemap_url_count_changed",
      getNumber(previousMetadata.urlCount),
      getNumber(currentMetadata.urlCount),
      {
        severity:
          getNumber(currentMetadata.urlCount) === 0 ? "CRITICAL" : "WARNING",
      },
    );
    addChange(
      changes,
      "sitemap_urls_changed",
      normalizeStringList(previousMetadata.urls).join("\n"),
      normalizeStringList(currentMetadata.urls).join("\n"),
      { severity: "WARNING" },
    );
  }

  return changes;
}

async function replaceCrawlRunChanges(
  prisma: PrismaClient,
  snapshot: SnapshotWithPage,
  changes: ChangeCandidate[],
) {
  await prisma.changeEvent.deleteMany({
    where: {
      crawlRunId: snapshot.crawlRunId,
      pageId: snapshot.pageId,
      changeType: { in: changes.map((change) => change.changeType) },
    },
  });

  if (!changes.length) {
    return;
  }

  await prisma.changeEvent.createMany({
    data: changes.map((change) => ({
      domainId: snapshot.page.domainId,
      pageId: snapshot.pageId,
      crawlRunId: snapshot.crawlRunId,
      changeType: change.changeType,
      severity: change.severity,
      previousValue: change.previousValue,
      newValue: change.newValue,
    })),
  });
}

async function replaceArtifactChanges(
  prisma: PrismaClient,
  artifact: CrawlArtifactForChange,
  changes: ChangeCandidate[],
) {
  await prisma.changeEvent.deleteMany({
    where: {
      crawlRunId: artifact.crawlRunId,
      pageId: null,
      changeType: { in: changes.map((change) => change.changeType) },
    },
  });

  if (!changes.length) {
    return;
  }

  await prisma.changeEvent.createMany({
    data: changes.map((change) => ({
      domainId: artifact.domainId,
      pageId: null,
      crawlRunId: artifact.crawlRunId,
      changeType: change.changeType,
      severity: change.severity,
      previousValue: change.previousValue,
      newValue: change.newValue,
    })),
  });
}

async function replaceTemplateRegressionChanges(
  prisma: PrismaClient,
  domainId: string,
  crawlRunId: string,
  changes: TemplateRegressionCandidate[],
) {
  await prisma.changeEvent.deleteMany({
    where: {
      crawlRunId,
      pageId: null,
      changeType: { startsWith: "template_regression:" },
    },
  });

  if (!changes.length) {
    return;
  }

  await prisma.changeEvent.createMany({
    data: changes.map((change) => ({
      domainId,
      pageId: null,
      crawlRunId,
      changeType: change.changeType,
      severity: change.severity,
      previousValue: change.previousValue,
      newValue: change.newValue,
    })),
  });
}

function addChange(
  changes: ChangeCandidate[],
  changeType: string,
  previousValue: string | number | null,
  newValue: string | number | null,
  options: { severity: IssueSeverity },
) {
  const previous = normalizeChangeValue(previousValue);
  const next = normalizeChangeValue(newValue);

  if (previous === next) {
    return;
  }

  changes.push({
    changeType,
    severity: options.severity,
    previousValue: previous,
    newValue: next,
  });
}

function normalizeChangeValue(value: string | number | null) {
  if (value === null) {
    return null;
  }

  return String(value).trim() || null;
}

function getMetadata(value: Prisma.JsonValue) {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, Prisma.JsonValue>;
  }

  return {};
}

function getNumber(value: Prisma.JsonValue | undefined) {
  return typeof value === "number" ? value : 0;
}

function normalizeStringList(value: Prisma.JsonValue | undefined) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .sort();
}

function inferTemplateKey(page: { url?: string; pageType?: string | null }) {
  return inferPageTemplate(page);
}

function summarizeTemplateValues(
  templateKey: string,
  values: Array<string | null>,
) {
  const uniqueValues = Array.from(new Set(values.map((value) => value ?? "")));
  const preview = uniqueValues
    .slice(0, 3)
    .map((value) => (value ? value : "(empty)"))
    .join(" | ");

  return `${templateKey}: ${preview}`;
}

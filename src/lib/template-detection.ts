export type PageTemplateKey =
  | "homepage"
  | "blog"
  | "product"
  | "category"
  | "docs"
  | "unknown"
  | `${string}_template`;

export type PageTemplateSummary = {
  key: PageTemplateKey;
  label: string;
  pageCount: number;
  issueCount: number;
  criticalCount: number;
  warningCount: number;
  priorityScore: number;
};

export function inferPageTemplate(input: {
  url?: string | null;
  pageType?: string | null;
}): PageTemplateKey {
  if (input.pageType?.trim()) {
    return normalizeTemplateSegment(input.pageType) as PageTemplateKey;
  }

  if (!input.url) {
    return "unknown";
  }

  try {
    const pathname = new URL(input.url).pathname.toLowerCase();
    const segments = pathname.split("/").filter(Boolean);

    if (segments.length === 0) {
      return "homepage";
    }

    const firstSegment = normalizeTemplateSegment(segments[0]);

    if (["blog", "posts", "articles", "news"].includes(firstSegment)) {
      return "blog";
    }

    if (
      ["product", "products", "shop", "store", "item"].includes(firstSegment)
    ) {
      return "product";
    }

    if (
      ["category", "categories", "collection", "collections"].includes(
        firstSegment,
      )
    ) {
      return "category";
    }

    if (
      ["docs", "documentation", "help", "guide", "guides"].includes(
        firstSegment,
      )
    ) {
      return "docs";
    }

    return `${firstSegment}_template` as PageTemplateKey;
  } catch {
    return "unknown";
  }
}

export function getTemplateLabel(templateKey: string | null | undefined) {
  if (!templateKey) {
    return "Unknown";
  }

  const labels: Record<string, string> = {
    homepage: "Homepage",
    blog: "Blog",
    product: "Product",
    category: "Category",
    docs: "Docs",
    unknown: "Unknown",
  };

  return (
    labels[templateKey] ??
    templateKey
      .replace(/_template$/, "")
      .split("_")
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ")
  );
}

export function calculateTemplatePriority(input: {
  criticalCount: number;
  warningCount: number;
  issueCount: number;
  pageCount: number;
}) {
  return Math.min(
    100,
    input.criticalCount * 30 +
      input.warningCount * 12 +
      Math.max(0, input.issueCount - input.criticalCount - input.warningCount) *
        4 +
      Math.min(input.pageCount, 10),
  );
}

export function summarizeTemplateGroups<
  TPage extends {
    url: string;
    pageType: string | null;
    issues: Array<{ severity: string }>;
  },
>(pages: TPage[]): PageTemplateSummary[] {
  const groups = new Map<PageTemplateKey, PageTemplateSummary>();

  for (const page of pages) {
    const key = inferPageTemplate(page);
    const existing =
      groups.get(key) ??
      ({
        key,
        label: getTemplateLabel(key),
        pageCount: 0,
        issueCount: 0,
        criticalCount: 0,
        warningCount: 0,
        priorityScore: 0,
      } satisfies PageTemplateSummary);

    const criticalCount = page.issues.filter(
      (issue) => issue.severity === "CRITICAL",
    ).length;
    const warningCount = page.issues.filter(
      (issue) => issue.severity === "WARNING",
    ).length;

    existing.pageCount += 1;
    existing.issueCount += page.issues.length;
    existing.criticalCount += criticalCount;
    existing.warningCount += warningCount;
    existing.priorityScore = calculateTemplatePriority(existing);
    groups.set(key, existing);
  }

  return Array.from(groups.values()).sort(
    (a, b) => b.priorityScore - a.priorityScore || b.pageCount - a.pageCount,
  );
}

function normalizeTemplateSegment(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "") || "unknown"
  );
}

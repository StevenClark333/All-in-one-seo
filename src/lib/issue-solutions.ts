import type { DomainPlatform } from "@prisma/client";

export type IssueSolution = {
  actionLabel: string;
  detail: string;
  effort: "Quick fix" | "Template fix" | "Developer fix" | "Content fix";
  primaryAction: "fix-center" | "issue" | "recommendations";
  steps: string[];
  title: string;
};

export function buildIssueSolution(input: {
  issueType: string;
  platform: DomainPlatform | string;
  recommendation?: string | null;
  title: string;
}): IssueSolution {
  const type = input.issueType.toLowerCase();
  const platform = formatPlatform(input.platform);
  const recommendation =
    input.recommendation ?? "Update the affected page, publish, and recrawl.";

  if (type.startsWith("broken_internal_link:")) {
    return {
      actionLabel: "Generate link fix",
      detail:
        "Replace the broken destination with a live internal URL. The portal can suggest the closest matching page and export the exact handoff.",
      effort: "Quick fix",
      primaryAction: "fix-center",
      steps: [
        "Open Fix Center for this project.",
        "Generate or refresh link fixes.",
        "Approve the suggested replacement URL.",
        "Send, export, or mark applied, then recrawl.",
      ],
      title: "Replace the broken internal link",
    };
  }

  if (
    type.startsWith("sitemap_url_not_internally_linked:") ||
    type.startsWith("internally_linked_url_missing_from_sitemap:") ||
    type.startsWith("deep_page:")
  ) {
    return {
      actionLabel: "Create internal link fix",
      detail:
        "Improve discovery by adding a contextual link from a stronger page or by fixing the sitemap/internal link mismatch.",
      effort: "Quick fix",
      primaryAction: "fix-center",
      steps: [
        "Open Fix Center for this project.",
        "Generate internal link opportunities.",
        "Approve the best source page and anchor text.",
        "Publish and recrawl to verify the link graph.",
      ],
      title: "Improve internal discovery",
    };
  }

  if (type.includes("schema") || type.includes("markup")) {
    return {
      actionLabel: "Build schema fix",
      detail: `Add valid structured data in ${platform}. Use the affected page type to choose Product, Article, BreadcrumbList, Organization, or WebPage schema.`,
      effort: "Template fix",
      primaryAction: "recommendations",
      steps: [
        "Generate a fix brief for this issue.",
        "Add JSON-LD to the page or shared template.",
        "Validate the rendered schema.",
        "Recrawl after publishing.",
      ],
      title: "Add valid structured data",
    };
  }

  if (type.includes("canonical")) {
    return {
      actionLabel: "Fix canonical",
      detail: `Set the canonical URL in ${platform} so search engines know the preferred indexable page.`,
      effort: "Template fix",
      primaryAction: "recommendations",
      steps: [
        "Generate a fix brief for this issue.",
        "Update the canonical tag on the affected page or template.",
        "Confirm it points to a live indexable URL.",
        "Recrawl to verify.",
      ],
      title: "Correct the canonical URL",
    };
  }

  if (type.includes("meta_description")) {
    return {
      actionLabel: "Write meta fix",
      detail:
        "Add a unique, useful meta description that matches the page intent and encourages clicks from search results.",
      effort: "Content fix",
      primaryAction: "recommendations",
      steps: [
        "Generate a suggested description.",
        "Add it to the CMS field or template metadata.",
        "Keep it specific to the page.",
        "Publish and recrawl.",
      ],
      title: "Add a unique meta description",
    };
  }

  if (type.includes("title")) {
    return {
      actionLabel: "Write title fix",
      detail:
        "Add a unique title tag that names the page topic, product, or offer clearly.",
      effort: "Content fix",
      primaryAction: "recommendations",
      steps: [
        "Generate a suggested SEO title.",
        "Add it to the CMS field or template metadata.",
        "Confirm the rendered title is unique.",
        "Publish and recrawl.",
      ],
      title: "Add a unique title tag",
    };
  }

  if (type.includes("h1") || type.includes("heading")) {
    return {
      actionLabel: "Fix heading",
      detail:
        "Make the page’s main heading clear, unique, and aligned with the search intent.",
      effort: "Content fix",
      primaryAction: "recommendations",
      steps: [
        "Generate a suggested heading.",
        "Update the visible page H1.",
        "Avoid duplicate or empty H1s.",
        "Publish and recrawl.",
      ],
      title: "Fix the main heading",
    };
  }

  if (type.includes("noindex") || type.includes("robots")) {
    return {
      actionLabel: "Fix indexability",
      detail:
        "Remove accidental blocking rules or noindex directives if the page should appear in search results.",
      effort: "Developer fix",
      primaryAction: "recommendations",
      steps: [
        "Check robots meta tags, X-Robots-Tag headers, and robots.txt rules.",
        "Remove the blocking directive for indexable pages.",
        "Publish or deploy the change.",
        "Recrawl and verify the page is indexable.",
      ],
      title: "Restore indexability",
    };
  }

  return {
    actionLabel: "View solution",
    detail: recommendation,
    effort: type.includes("template") ? "Template fix" : "Developer fix",
    primaryAction: "issue",
    steps: [
      "Review the affected page and rendered HTML.",
      "Apply the recommended fix in the CMS, template, or codebase.",
      "Publish the change.",
      "Recrawl to verify the issue is gone.",
    ],
    title: input.title,
  };
}

function formatPlatform(platform: DomainPlatform | string) {
  return platform
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

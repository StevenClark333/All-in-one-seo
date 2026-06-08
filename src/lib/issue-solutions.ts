import type { DomainPlatform } from "@prisma/client";

export type IssueSolution = {
  actionLabel: string;
  detail: string;
  effort: "Quick fix" | "Template fix" | "Specialist fix" | "Content fix";
  fixAvailability: {
    detail: string;
    label: "Can prepare here" | "Needs website editor" | "Needs site helper";
    tone: "emerald" | "amber" | "blue";
  };
  primaryAction: "fix-center" | "issue" | "recommendations";
  steps: string[];
  title: string;
  whyMatters: string;
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
    input.recommendation ??
    "Update the affected page, publish, and run a new website check.";

  if (type.startsWith("broken_internal_link:")) {
    return {
      actionLabel: "Generate link fix",
      detail:
        "Replace the broken destination with a live internal URL. The portal can suggest the closest matching page and prepare a simple fix note.",
      effort: "Quick fix",
      fixAvailability: {
        detail:
          "The portal can suggest the replacement URL and prepare the fix note from Fix Center.",
        label: "Can prepare here",
        tone: "emerald",
      },
      primaryAction: "fix-center",
      steps: [
        "Open Fix Center for this website.",
        "Create or refresh link fixes.",
        "Approve the suggested replacement URL.",
        "Send, download, or mark applied, then run a new website check.",
      ],
      title: "Replace the broken internal link",
      whyMatters:
        "Broken links send visitors to dead pages and make it harder for search engines to trust the site structure.",
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
      fixAvailability: {
        detail:
          "The portal can suggest the source page, target page, and anchor text in Fix Center.",
        label: "Can prepare here",
        tone: "emerald",
      },
      primaryAction: "fix-center",
      steps: [
        "Open Fix Center for this website.",
        "Create internal link ideas.",
        "Approve the best source page and anchor text.",
        "Publish and run a new website check to confirm the links.",
      ],
      title: "Improve internal discovery",
      whyMatters:
        "Important pages need clear paths from the rest of the website so people and search engines can find them.",
    };
  }

  if (type.includes("schema") || type.includes("markup")) {
    return {
      actionLabel: "Build schema fix",
      detail: `Add valid structured data in ${platform}. Use the affected page type to choose Product, Article, BreadcrumbList, Organization, or WebPage schema.`,
      effort: "Template fix",
      fixAvailability: {
        detail:
          "Create the fix note here, then add the schema in the website editor, template, or code.",
        label: "Needs site helper",
        tone: "blue",
      },
      primaryAction: "recommendations",
      steps: [
        "Create a fix note for this problem.",
        "Add JSON-LD to the page or shared template.",
        "Validate the rendered schema.",
        "Run a new website check after publishing.",
      ],
      title: "Add valid structured data",
      whyMatters:
        "Schema helps search engines understand the page and can improve how the result appears in Google.",
    };
  }

  if (type.includes("canonical")) {
    return {
      actionLabel: "Fix canonical",
      detail: `Set the canonical URL in ${platform} so search engines know the preferred indexable page.`,
      effort: "Template fix",
      fixAvailability: {
        detail:
          "Create the fix note here, then update the canonical field in the website editor or template.",
        label: "Needs website editor",
        tone: "amber",
      },
      primaryAction: "recommendations",
      steps: [
        "Create a fix note for this problem.",
        "Update the canonical tag on the affected page or template.",
        "Confirm it points to a live indexable URL.",
        "Run a new website check to confirm it is fixed.",
      ],
      title: "Correct the canonical URL",
      whyMatters:
        "A wrong canonical can make Google choose the wrong page or ignore the page you actually want to rank.",
    };
  }

  if (type.includes("meta_description")) {
    return {
      actionLabel: "Write meta fix",
      detail:
        "Add a unique, useful meta description that matches the page intent and encourages clicks from search results.",
      effort: "Content fix",
      fixAvailability: {
        detail:
          "Create the copy here, then paste it into the page SEO field in the website editor.",
        label: "Needs website editor",
        tone: "amber",
      },
      primaryAction: "recommendations",
      steps: [
        "Create a suggested description.",
        "Add it to the website editor field or template metadata.",
        "Keep it specific to the page.",
        "Publish and run a new website check.",
      ],
      title: "Add a unique meta description",
      whyMatters:
        "A clear description helps people understand the page before they click from search results.",
    };
  }

  if (type.includes("title")) {
    return {
      actionLabel: "Write title fix",
      detail:
        "Add a unique title tag that names the page topic, product, or offer clearly.",
      effort: "Content fix",
      fixAvailability: {
        detail:
          "Create the title here, then paste it into the page SEO field in the website editor.",
        label: "Needs website editor",
        tone: "amber",
      },
      primaryAction: "recommendations",
      steps: [
        "Create a suggested SEO title.",
        "Add it to the website editor field or template metadata.",
        "Confirm the rendered title is unique.",
        "Publish and run a new website check.",
      ],
      title: "Add a unique title tag",
      whyMatters:
        "The title is one of the clearest signals people and search engines use to understand the page.",
    };
  }

  if (type.includes("h1") || type.includes("heading")) {
    return {
      actionLabel: "Fix heading",
      detail:
        "Make the page’s main heading clear, unique, and aligned with the search intent.",
      effort: "Content fix",
      fixAvailability: {
        detail:
          "Create the heading here, then update the visible page content in the website editor.",
        label: "Needs website editor",
        tone: "amber",
      },
      primaryAction: "recommendations",
      steps: [
        "Create a suggested heading.",
        "Update the visible page H1.",
        "Avoid duplicate or empty H1s.",
        "Publish and run a new website check.",
      ],
      title: "Fix the main heading",
      whyMatters:
        "The main heading tells visitors they landed in the right place and helps search engines understand the page topic.",
    };
  }

  if (type.includes("noindex") || type.includes("robots")) {
    return {
      actionLabel: "Fix indexability",
      detail:
        "Remove accidental blocking rules or noindex directives if the page should appear in search results.",
      effort: "Specialist fix",
      fixAvailability: {
        detail:
          "Create the fix note here, then ask a site helper or website admin to remove the blocking rule.",
        label: "Needs site helper",
        tone: "blue",
      },
      primaryAction: "recommendations",
      steps: [
        "Check robots meta tags, X-Robots-Tag headers, and robots.txt rules.",
        "Remove the blocking directive for indexable pages.",
        "Publish or deploy the change.",
        "Run a new website check and confirm the page can be indexed.",
      ],
      title: "Restore indexability",
      whyMatters:
        "If an important page is blocked, it may not appear in Google even when the content is useful.",
    };
  }

  return {
    actionLabel: "View solution",
    detail: recommendation,
    effort: type.includes("template") ? "Template fix" : "Specialist fix",
    fixAvailability: {
      detail:
        "Use this page to create a fix note and decide whether the website editor or codebase needs the change.",
      label: type.includes("content")
        ? "Needs website editor"
        : "Needs site helper",
      tone: type.includes("content") ? "amber" : "blue",
    },
    primaryAction: "issue",
    steps: [
      "Review the affected page and page details.",
      "Apply the recommended fix in the website editor, template, or codebase.",
      "Publish the change.",
      "Run a new website check to confirm the problem is gone.",
    ],
    title: input.title,
    whyMatters:
      "Fixing this helps keep the website easier to understand, easier to crawl, and safer from preventable ranking drops.",
  };
}

function formatPlatform(platform: DomainPlatform | string) {
  return platform
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

import type { DomainPlatform } from "@prisma/client";
import { PRODUCT_LINK_FIX_COPY } from "@/lib/product-copy";

export type PlatformFixBriefInput = {
  anchorText?: string | null;
  brokenUrl?: string | null;
  domain: string;
  platform: DomainPlatform;
  sourceUrl: string;
  suggestedUrl: string;
};

export type PlatformFixBrief = {
  deliveryMode: string;
  exportFilename: string;
  platformLabel: string;
  snippets: Array<{
    code: string;
    label: string;
  }>;
  steps: string[];
  summary: string;
  title: string;
  validation: string[];
};

export function buildPlatformFixBrief(
  input: PlatformFixBriefInput,
): PlatformFixBrief {
  const platformLabel = formatPlatform(input.platform);
  const title = input.brokenUrl
    ? PRODUCT_LINK_FIX_COPY.replaceStoppedLinkSummary(input.domain)
    : PRODUCT_LINK_FIX_COPY.addHelpfulLinkSummary(input.domain);
  const commonSteps = buildCommonSteps(input);
  const validation = [
    "Publish the website change.",
    "Open the source page and confirm the new link is visible.",
    "Run a crawl from Fix Center to verify the issue status.",
  ];
  const exportFilename = `${slugify(input.domain)}-${slugify(
    input.brokenUrl ? "link-repair-note" : "internal-link-note",
  )}.md`;

  if (input.platform === "WORDPRESS") {
    return {
      deliveryMode: "WordPress receiver or editor handoff",
      exportFilename,
      platformLabel,
      snippets: [
        {
          label: "WordPress editor instruction",
          code: buildWordPressInstruction(input),
        },
      ],
      steps: [
        "Use the connected WordPress receiver when available.",
        "If receiver delivery is unavailable, edit the source post, page, menu, or template manually.",
        ...commonSteps,
      ],
      summary:
        "Send this fix through the WordPress receiver or apply it in the WordPress editor/template that owns the source page.",
      title,
      validation,
    };
  }

  if (input.platform === "SHOPIFY") {
    return {
      deliveryMode: "Shopify Liquid/theme handoff",
      exportFilename,
      platformLabel,
      snippets: [
        {
          label: "Liquid link snippet",
          code: `<a href="${input.suggestedUrl}">${escapeHtml(
            input.anchorText ?? "Learn more",
          )}</a>`,
        },
        {
          label: "Shopify redirect CSV row",
          code: input.brokenUrl
            ? `Redirect from,Redirect to\n${toPath(input.brokenUrl)},${toPath(
                input.suggestedUrl,
              )}`
            : "Redirect export is only needed when replacing a broken URL.",
        },
      ],
      steps: [
        "Find whether the source page is owned by a product, collection, page, blog article, navigation menu, or theme section.",
        "Update the content field or Liquid template that renders the source link.",
        ...commonSteps,
        "If the broken URL should keep working, add a Shopify URL redirect.",
      ],
      summary:
        "Apply this in Shopify admin content or the active theme's Liquid templates, then optionally export a redirect row for broken URLs.",
      title,
      validation,
    };
  }

  if (input.platform === "WEBFLOW") {
    return {
      deliveryMode: "Webflow Designer/CMS handoff",
      exportFilename,
      platformLabel,
      snippets: [
        {
          label: "Webflow editor note",
          code: buildEditorInstruction(input),
        },
        {
          label: "Webflow redirect rule",
          code: input.brokenUrl
            ? `${toPath(input.brokenUrl)} -> ${toPath(input.suggestedUrl)}`
            : "Redirect rule is only needed when replacing a broken URL.",
        },
      ],
      steps: [
        "Open the source page or CMS collection item in Webflow.",
        "Update the link block, rich text link, nav item, or component instance that owns the source link.",
        ...commonSteps,
        "Publish the site from Webflow after the edit.",
      ],
      summary:
        "Apply this in Webflow Designer or CMS fields, with an optional redirect rule for broken URLs.",
      title,
      validation,
    };
  }

  if (input.platform === "CUSTOM") {
    return {
      deliveryMode: "Custom PHP/developer handoff",
      exportFilename,
      platformLabel,
      snippets: [
        {
          label: "PHP template replacement",
          code: buildPhpReplacementSnippet(input),
        },
        {
          label: "Apache redirect",
          code: input.brokenUrl
            ? `Redirect 301 ${toPath(input.brokenUrl)} ${toPath(
                input.suggestedUrl,
              )}`
            : "Redirect is not required for a new internal link.",
        },
        {
          label: "Nginx redirect",
          code: input.brokenUrl
            ? `rewrite ^${escapeRegex(toPath(input.brokenUrl))}$ ${toPath(
                input.suggestedUrl,
              )} permanent;`
            : "Redirect is not required for a new internal link.",
        },
      ],
      steps: [
        "Find the PHP template, layout partial, CMS content field, or database record that renders the source page.",
        ...commonSteps,
        "If the old URL receives traffic, add the Apache or Nginx redirect to the hosting config.",
      ],
      summary:
        "Hand this to the developer responsible for the custom PHP templates or content database.",
      title,
      validation,
    };
  }

  if (input.platform === "WIX" || input.platform === "SQUARESPACE") {
    return {
      deliveryMode: `${platformLabel} editor handoff`,
      exportFilename,
      platformLabel,
      snippets: [
        {
          label: "Editor instruction",
          code: buildEditorInstruction(input),
        },
      ],
      steps: [
        `Open the source page in the ${platformLabel} editor.`,
        "Update the text link, button, navigation item, or reusable block that owns the source link.",
        ...commonSteps,
        "Add a platform redirect if the old URL must remain supported.",
      ],
      summary:
        "Apply this in the site editor and use the platform redirect settings for broken URL cleanup.",
      title,
      validation,
    };
  }

  return {
    deliveryMode: "Generic developer handoff",
    exportFilename,
    platformLabel,
    snippets: [
      {
        label: "HTML link snippet",
        code: `<a href="${input.suggestedUrl}">${escapeHtml(
          input.anchorText ?? "Learn more",
        )}</a>`,
      },
    ],
    steps: [
      "Identify the CMS, template, source component, or content record that owns the source page.",
      ...commonSteps,
      "Add a redirect for the old URL if it should continue resolving.",
    ],
    summary:
      "Use this as a generic developer or editor handoff when the platform is unknown.",
    title,
    validation,
  };
}

export function renderPlatformFixBriefMarkdown(brief: PlatformFixBrief) {
  const snippets = brief.snippets
    .map(
      (snippet) =>
        `## ${snippet.label}\n\n\`\`\`\n${snippet.code}\n\`\`\``,
    )
    .join("\n\n");

  return [
    `# ${brief.title}`,
    `Platform: ${brief.platformLabel}`,
    `Delivery mode: ${brief.deliveryMode}`,
    "",
    brief.summary,
    "",
    "## Steps",
    ...brief.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    snippets,
    "",
    "## Validation",
    ...brief.validation.map((step, index) => `${index + 1}. ${step}`),
  ].join("\n");
}

function buildCommonSteps(input: PlatformFixBriefInput) {
  if (input.brokenUrl) {
    return [
      `On ${input.sourceUrl}, replace ${input.brokenUrl} with ${input.suggestedUrl}.`,
      `Use anchor text "${input.anchorText ?? "Learn more"}" if it fits naturally.`,
    ];
  }

  return [
    `On ${input.sourceUrl}, add a contextual link to ${input.suggestedUrl}.`,
    `Use anchor text "${input.anchorText ?? "Learn more"}" if it fits naturally.`,
  ];
}

function buildWordPressInstruction(input: PlatformFixBriefInput) {
  return input.brokenUrl
    ? `Edit the source post/page/template and replace ${input.brokenUrl} with ${input.suggestedUrl}.`
    : `Edit the source post/page/template and add a contextual link to ${input.suggestedUrl}.`;
}

function buildEditorInstruction(input: PlatformFixBriefInput) {
  return input.brokenUrl
    ? `Replace the link target ${input.brokenUrl} with ${input.suggestedUrl} on ${input.sourceUrl}.`
    : `Add a link to ${input.suggestedUrl} on ${input.sourceUrl}.`;
}

function buildPhpReplacementSnippet(input: PlatformFixBriefInput) {
  const link = `<a href="${input.suggestedUrl}">${escapeHtml(
    input.anchorText ?? "Learn more",
  )}</a>`;

  if (!input.brokenUrl) {
    return link;
  }

  return [
    "<?php",
    `$html = str_replace(${phpString(input.brokenUrl)}, ${phpString(
      input.suggestedUrl,
    )}, $html);`,
    "?>",
    "",
    link,
  ].join("\n");
}

function formatPlatform(platform: DomainPlatform) {
  return platform
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toPath(value: string) {
  try {
    const url = new URL(value);
    return `${url.pathname}${url.search}` || "/";
  } catch {
    return value.startsWith("/") ? value : `/${value}`;
  }
}

function phpString(value: string) {
  return `'${value.replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

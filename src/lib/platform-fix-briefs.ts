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
    "Open the page with the link and confirm the new link is visible.",
    "Run a new website check from Fixes to confirm the problem is handled.",
  ];
  const exportFilename = `${slugify(input.domain)}-${slugify(
    input.brokenUrl ? "link-repair-note" : "internal-link-note",
  )}.md`;

  if (input.platform === "WORDPRESS") {
    return {
      deliveryMode: "WordPress receiver or editor note",
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
        "If receiver delivery is unavailable, edit the post, page, menu, or template with the link manually.",
        ...commonSteps,
      ],
      summary:
        "Send this fix through the WordPress receiver or apply it in the WordPress editor/template that owns the page with the link.",
      title,
      validation,
    };
  }

  if (input.platform === "SHOPIFY") {
    return {
      deliveryMode: "Shopify theme note",
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
          label: "Shopify optional redirect row",
          code: input.brokenUrl
            ? `Redirect from,Redirect to\n${toPath(input.brokenUrl)},${toPath(
                input.suggestedUrl,
              )}`
            : "A redirect row is only needed when replacing a link that stopped working.",
        },
      ],
      steps: [
        "Find whether the page with the link is owned by a product, collection, page, blog article, navigation menu, or theme section.",
        "Update the content field or theme file that shows the link.",
        ...commonSteps,
        "If the old address should keep working, add a Shopify redirect.",
      ],
      summary:
        "Apply this in Shopify admin content or the active theme files, then add a redirect row only if the old address should keep working.",
      title,
      validation,
    };
  }

  if (input.platform === "WEBFLOW") {
    return {
      deliveryMode: "Webflow Designer/CMS note",
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
            : "A redirect rule is only needed when replacing a link that stopped working.",
        },
      ],
      steps: [
        "Open the page with the link or CMS collection item in Webflow.",
        "Update the link block, rich text link, nav item, or component instance that shows the link.",
        ...commonSteps,
        "Publish the site from Webflow after the edit.",
      ],
      summary:
        "Apply this in Webflow Designer or CMS fields, with an optional redirect rule if the old address should keep working.",
      title,
      validation,
    };
  }

  if (input.platform === "CUSTOM") {
    return {
      deliveryMode: "Custom PHP helper note",
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
            : "A redirect is not needed for a new helpful page link.",
        },
        {
          label: "Nginx redirect",
          code: input.brokenUrl
            ? `rewrite ^${escapeRegex(toPath(input.brokenUrl))}$ ${toPath(
                input.suggestedUrl,
              )} permanent;`
            : "A redirect is not needed for a new helpful page link.",
        },
      ],
      steps: [
        "Find the PHP template, layout partial, CMS content field, or database record that shows the page with the link.",
        ...commonSteps,
        "If the old address still gets visits, add the Apache or Nginx redirect to the hosting settings.",
      ],
      summary:
        "Share this note with the person who manages the custom PHP templates or content database.",
      title,
      validation,
    };
  }

  if (input.platform === "WIX" || input.platform === "SQUARESPACE") {
    return {
      deliveryMode: `${platformLabel} editor note`,
      exportFilename,
      platformLabel,
      snippets: [
        {
          label: "Editor instruction",
          code: buildEditorInstruction(input),
        },
      ],
      steps: [
        `Open the page with the link in the ${platformLabel} editor.`,
        "Update the text link, button, navigation item, or reusable block that shows the link.",
        ...commonSteps,
        "Add a platform redirect if the old address should keep working.",
      ],
      summary:
        "Apply this in the site editor and use the platform redirect settings only if the old address should keep working.",
      title,
      validation,
    };
  }

  return {
    deliveryMode: "Generic helper note",
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
      "Identify the CMS, template, page component, or content record that shows the page with the link.",
      ...commonSteps,
      "Add a redirect for the old address if it should keep working.",
    ],
    summary:
      "Use this as a general website helper note when the platform is unknown.",
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
    `How to use this note: ${brief.deliveryMode}`,
    "",
    brief.summary,
    "",
    "## Steps",
    ...brief.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    snippets,
    "",
    "## Check after publishing",
    ...brief.validation.map((step, index) => `${index + 1}. ${step}`),
  ].join("\n");
}

function buildCommonSteps(input: PlatformFixBriefInput) {
  if (input.brokenUrl) {
    return [
      `On ${input.sourceUrl}, replace the link that stopped working (${input.brokenUrl}) with ${input.suggestedUrl}.`,
      `Use link text "${input.anchorText ?? "Learn more"}" if it fits naturally.`,
    ];
  }

  return [
    `On ${input.sourceUrl}, add a helpful page link to ${input.suggestedUrl}.`,
    `Use link text "${input.anchorText ?? "Learn more"}" if it fits naturally.`,
  ];
}

function buildWordPressInstruction(input: PlatformFixBriefInput) {
  return input.brokenUrl
    ? `Edit the post, page, or template with the link and replace ${input.brokenUrl} with ${input.suggestedUrl}.`
    : `Edit the post, page, or template and add a helpful page link to ${input.suggestedUrl}.`;
}

function buildEditorInstruction(input: PlatformFixBriefInput) {
  return input.brokenUrl
    ? `Replace the link that stopped working (${input.brokenUrl}) with ${input.suggestedUrl} on ${input.sourceUrl}.`
    : `Add a helpful page link to ${input.suggestedUrl} on ${input.sourceUrl}.`;
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

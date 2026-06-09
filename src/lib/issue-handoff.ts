import type { DomainPlatform, IssueSeverity } from "@prisma/client";
import {
  formatExportClient,
  formatExportImportance,
  formatExportProblemArea,
} from "@/lib/export-display-labels";
import type { IssueSolution } from "@/lib/issue-solutions";

export type IssueHandoffInput = {
  clientName?: string | null;
  description: string;
  domain: string;
  issueType: string;
  pageUrl?: string | null;
  platform: DomainPlatform | string;
  recommendation?: string | null;
  severity: IssueSeverity | string;
  solution: IssueSolution;
  title: string;
};

export function buildIssueHandoffBrief(input: IssueHandoffInput) {
  const platformLabel = formatLabel(input.platform);
  const target = input.pageUrl ?? `Whole-website problem on ${input.domain}`;
  const owner =
    input.solution.fixAvailability.label === "Needs website editor"
      ? "Website editor or site manager"
      : "Site helper or website admin";

  return {
    exportFilename: `${slugify(input.domain)}-${slugify(input.title)}-fix-note.md`,
    markdown: renderIssueHandoffMarkdown({
      ...input,
      owner,
      platformLabel,
      target,
    }),
    owner,
    platformLabel,
    target,
  };
}

function renderIssueHandoffMarkdown(
  input: IssueHandoffInput & {
    owner: string;
    platformLabel: string;
    target: string;
  },
) {
  return [
    `# ${input.title}`,
    "",
    `Website: ${input.domain}`,
    `Client: ${formatExportClient(input.clientName)}`,
    `Platform: ${input.platformLabel}`,
    `Importance: ${formatExportImportance(input.severity)}`,
    `Problem area: ${formatExportProblemArea(input.issueType)}`,
    `Owner: ${input.owner}`,
    `Target: ${input.target}`,
    "",
    "## What is wrong",
    input.description,
    "",
    "## Why it matters",
    input.solution.whyMatters,
    "",
    "## Best next step",
    input.solution.title,
    "",
    input.solution.detail,
    "",
    "## What to do next",
    ...input.solution.steps.map((step, index) => `${index + 1}. ${step}`),
    "",
    "## Can this be fixed in the portal?",
    `${input.solution.fixAvailability.label}: ${input.solution.fixAvailability.detail}`,
    "",
    "## Saved fix note",
    input.recommendation ?? "No extra fix note has been created yet.",
    "",
    "## Check it after the fix",
    "1. Publish the website or website-editor change.",
    "2. Open the affected page and confirm the visible or technical fix is present.",
    "3. Run a fresh website check in All In One SEO.",
    "4. Mark the problem fixed only after the new check no longer reports it.",
  ].join("\n");
}

function formatLabel(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

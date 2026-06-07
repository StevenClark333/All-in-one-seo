import type { DomainPlatform, IssueSeverity } from "@prisma/client";
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
  const target = input.pageUrl ?? `Site-wide issue on ${input.domain}`;
  const owner =
    input.solution.fixAvailability.label === "Needs CMS"
      ? "CMS editor or site manager"
      : "Developer or site admin";

  return {
    exportFilename: `${slugify(input.domain)}-${slugify(input.title)}-handoff.md`,
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
    `Client: ${input.clientName ?? "Unassigned"}`,
    `Platform: ${input.platformLabel}`,
    `Severity: ${formatLabel(input.severity)}`,
    `Issue type: ${formatIssueType(input.issueType)}`,
    `Owner: ${input.owner}`,
    `Target: ${input.target}`,
    "",
    "## What is wrong",
    input.description,
    "",
    "## Why it matters",
    input.solution.whyMatters,
    "",
    "## Recommended solution",
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
    "## Existing recommendation",
    input.recommendation ?? "No extra recommendation has been generated yet.",
    "",
    "## Verification",
    "1. Publish the website or CMS change.",
    "2. Open the affected page and confirm the visible or technical fix is present.",
    "3. Run a fresh scan in All In One SEO.",
    "4. Mark the problem fixed only after the scan no longer reports it.",
  ].join("\n");
}

function formatIssueType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
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

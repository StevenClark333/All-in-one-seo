import {
  formatExportClient,
  formatExportImportance,
  formatExportOwner,
  formatExportPriority,
  formatExportProblemArea,
  formatExportProgress,
} from "@/lib/export-display-labels";
import {
  formatPageCheckDate,
  formatPageResponse,
} from "@/lib/page-display-labels";

export type ProblemExportIssue = {
  assignedTo?: { email?: string | null; name?: string | null } | null;
  client?: { name?: string | null } | null;
  description: string;
  domain: { domain: string };
  issueType?: string | null;
  page?: { url: string } | null;
  priorityScore?: number | null;
  severity?: string | null;
  status?: string | null;
  title: string;
};

export type PageCareExportPage = {
  domain: { client?: { name?: string | null } | null; domain: string };
  incomingLinks: unknown[];
  issues: unknown[];
  lastCrawledAt?: Date | null;
  outgoingLinks: unknown[];
  snapshots: Array<{ statusCode?: number | null; title?: string | null }>;
  url: string;
};

export function buildProblemExportRow(issue: ProblemExportIssue) {
  return {
    assignedTo: formatExportOwner(
      issue.assignedTo?.name ?? issue.assignedTo?.email,
    ),
    client: formatExportClient(issue.client?.name),
    description: issue.description,
    importance: formatExportImportance(issue.severity),
    page: issue.page?.url ?? "",
    priority: formatExportPriority(issue.priorityScore),
    problemArea: formatExportProblemArea(issue.issueType),
    progress: formatExportProgress(issue.status),
    title: issue.title,
    website: issue.domain.domain,
  };
}

export function buildPageCareExportRow(page: PageCareExportPage) {
  const snapshot = page.snapshots.at(0);

  return {
    client: formatExportClient(page.domain.client?.name),
    incomingLinks: page.incomingLinks.length,
    lastChecked: formatPageCheckDate(page.lastCrawledAt),
    outgoingLinks: page.outgoingLinks.length,
    problems: page.issues.length,
    title: snapshot?.title ?? "",
    url: page.url,
    website: page.domain.domain,
    websiteResponse: formatPageResponse(snapshot?.statusCode),
  };
}

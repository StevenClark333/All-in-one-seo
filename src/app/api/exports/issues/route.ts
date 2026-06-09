import { NextResponse, type NextRequest } from "next/server";
import { toCsv } from "@/lib/csv";
import {
  formatExportClient,
  formatExportOwner,
} from "@/lib/export-display-labels";
import { getIssueListData } from "@/lib/issue-queries";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const { issues } = await getIssueListData({
    assignedToId: params.get("assignedToId") ?? undefined,
    clientId: params.get("clientId") ?? undefined,
    domainId: params.get("domainId") ?? undefined,
    issueType: params.get("issueType") ?? undefined,
    severity: params.get("severity") ?? undefined,
    status: params.get("status") ?? undefined,
    templateKey: params.get("templateKey") ?? undefined,
  });
  const csv = toCsv(
    issues.map((issue) => ({
      assignedTo: formatExportOwner(
        issue.assignedTo?.name ?? issue.assignedTo?.email,
      ),
      client: formatExportClient(issue.client?.name),
      description: issue.description,
      domain: issue.domain.domain,
      issueType: issue.issueType,
      page: issue.page?.url ?? "",
      priorityScore: issue.priorityScore,
      severity: issue.severity,
      status: issue.status,
      title: issue.title,
    })),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": "attachment; filename=issues-export.csv",
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { toCsv } from "@/lib/csv";
import {
  PROBLEM_EXPORT_FILENAME,
} from "@/lib/export-display-labels";
import { buildProblemExportRow } from "@/lib/export-rows";
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
  const csv = toCsv(issues.map((issue) => buildProblemExportRow(issue)));

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename=${PROBLEM_EXPORT_FILENAME}`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}

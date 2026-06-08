import { NextRequest } from "next/server";
import { publishReport } from "@/lib/reporting";
import { getFormString, redirectToPath } from "@/lib/route-helpers";

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const reportId = getFormString(formData, "reportId");

  if (!reportId) {
    return redirectToPath(request, "/reports", { error: "report-invalid" });
  }

  const reportPath = `/reports/${reportId}`;

  try {
    await publishReport(reportId);

    return redirectToPath(request, reportPath, { status: "client-link-ready" });
  } catch {
    return redirectToPath(request, reportPath, {
      error: "report-publish-failed",
    });
  }
}

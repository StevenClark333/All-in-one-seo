import { notFound } from "next/navigation";
import { createSimplePdf } from "@/lib/pdf";
import { buildReportPdfText, getReportDetailData } from "@/lib/reporting";

export const dynamic = "force-dynamic";

type ReportPdfRouteProps = {
  params: Promise<{ reportId: string }>;
};

export async function GET(_request: Request, { params }: ReportPdfRouteProps) {
  const { reportId } = await params;
  const { report } = await getReportDetailData(reportId);

  if (!report) {
    notFound();
  }

  const pdf = createSimplePdf(buildReportPdfText(report));

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${report.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf"`,
    },
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { toCsv } from "@/lib/csv";
import { formatExportClient } from "@/lib/export-display-labels";
import { getPageInventoryData } from "@/lib/management-queries";

export async function GET(request: NextRequest) {
  const domainId = request.nextUrl.searchParams.get("domainId") ?? undefined;
  const { pages } = await getPageInventoryData({ domainId });
  const csv = toCsv(
    pages.map((page) => {
      const snapshot = page.snapshots.at(0);

      return {
        client: formatExportClient(page.domain.client?.name),
        domain: page.domain.domain,
        httpStatus: snapshot?.statusCode ?? "",
        incomingLinks: page.incomingLinks.length,
        issues: page.issues.length,
        lastCrawledAt: page.lastCrawledAt?.toISOString() ?? "",
        outgoingLinks: page.outgoingLinks.length,
        title: snapshot?.title ?? "",
        url: page.url,
      };
    }),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": "attachment; filename=pages-export.csv",
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}

import { NextResponse, type NextRequest } from "next/server";
import { toCsv } from "@/lib/csv";
import {
  PAGE_CARE_EXPORT_FILENAME,
  formatExportClient,
} from "@/lib/export-display-labels";
import { getPageInventoryData } from "@/lib/management-queries";
import {
  formatPageCheckDate,
  formatPageResponse,
} from "@/lib/page-display-labels";

export async function GET(request: NextRequest) {
  const domainId = request.nextUrl.searchParams.get("domainId") ?? undefined;
  const { pages } = await getPageInventoryData({ domainId });
  const csv = toCsv(
    pages.map((page) => {
      const snapshot = page.snapshots.at(0);

      return {
        client: formatExportClient(page.domain.client?.name),
        domain: page.domain.domain,
        incomingLinks: page.incomingLinks.length,
        issues: page.issues.length,
        lastChecked: formatPageCheckDate(page.lastCrawledAt),
        outgoingLinks: page.outgoingLinks.length,
        title: snapshot?.title ?? "",
        url: page.url,
        websiteResponse: formatPageResponse(snapshot?.statusCode),
      };
    }),
  );

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename=${PAGE_CARE_EXPORT_FILENAME}`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}

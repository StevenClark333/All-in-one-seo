import { NextResponse, type NextRequest } from "next/server";
import { toCsv } from "@/lib/csv";
import {
  PAGE_CARE_EXPORT_FILENAME,
} from "@/lib/export-display-labels";
import { buildPageCareExportRow } from "@/lib/export-rows";
import { getPageInventoryData } from "@/lib/management-queries";

export async function GET(request: NextRequest) {
  const domainId = request.nextUrl.searchParams.get("domainId") ?? undefined;
  const { pages } = await getPageInventoryData({ domainId });
  const csv = toCsv(pages.map((page) => buildPageCareExportRow(page)));

  return new NextResponse(csv, {
    headers: {
      "Content-Disposition": `attachment; filename=${PAGE_CARE_EXPORT_FILENAME}`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}

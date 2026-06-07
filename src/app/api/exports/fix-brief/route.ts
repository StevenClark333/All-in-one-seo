import { NextResponse, type NextRequest } from "next/server";
import { getPrisma } from "@/lib/prisma";
import {
  buildPlatformFixBrief,
  renderPlatformFixBriefMarkdown,
} from "@/lib/platform-fix-briefs";
import { getPrimaryWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const fixId = request.nextUrl.searchParams.get("fixId");

  if (!fixId) {
    return NextResponse.json({ error: "fixId is required." }, { status: 400 });
  }

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace is required." },
      { status: 401 },
    );
  }

  const fix = await getPrisma().linkFixSuggestion.findFirst({
    where: { id: fixId, workspaceId: workspace.id },
    include: { domain: true },
  });

  if (!fix) {
    return NextResponse.json({ error: "Fix not found." }, { status: 404 });
  }

  const brief = buildPlatformFixBrief({
    anchorText: fix.anchorText,
    brokenUrl: fix.brokenUrl,
    domain: fix.domain.domain,
    platform: fix.domain.platform,
    sourceUrl: fix.sourceUrl,
    suggestedUrl: fix.suggestedUrl,
  });
  const markdown = renderPlatformFixBriefMarkdown(brief);

  return new NextResponse(markdown, {
    headers: {
      "Content-Disposition": `attachment; filename=${brief.exportFilename}`,
      "Content-Type": "text/markdown; charset=utf-8",
    },
  });
}

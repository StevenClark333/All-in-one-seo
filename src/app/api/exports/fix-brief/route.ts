import { NextResponse, type NextRequest } from "next/server";
import { buildIssueHandoffBrief } from "@/lib/issue-handoff";
import { buildIssueSolution } from "@/lib/issue-solutions";
import { getPrisma } from "@/lib/prisma";
import {
  buildPlatformFixBrief,
  renderPlatformFixBriefMarkdown,
} from "@/lib/platform-fix-briefs";
import { getPrimaryWorkspace } from "@/lib/workspace";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const fixId = request.nextUrl.searchParams.get("fixId");
  const issueId = request.nextUrl.searchParams.get("issueId");

  const workspace = await getPrimaryWorkspace();

  if (!workspace) {
    return NextResponse.json(
      { error: "Workspace is required." },
      { status: 401 },
    );
  }

  if (issueId) {
    const issue = await getPrisma().seoIssue.findFirst({
      where: { id: issueId, workspaceId: workspace.id },
      include: { client: true, domain: true, page: true },
    });

    if (!issue) {
      return NextResponse.json({ error: "Issue not found." }, { status: 404 });
    }

    const solution = buildIssueSolution({
      issueType: issue.issueType,
      platform: issue.domain.platform,
      recommendation: issue.recommendation,
      title: issue.title,
    });
    const brief = buildIssueHandoffBrief({
      clientName: issue.client?.name,
      description: issue.description,
      domain: issue.domain.domain,
      issueType: issue.issueType,
      pageUrl: issue.page?.url,
      platform: issue.domain.platform,
      recommendation: issue.recommendation,
      severity: issue.severity,
      solution,
      title: issue.title,
    });

    return new NextResponse(brief.markdown, {
      headers: {
        "Content-Disposition": `attachment; filename=${brief.exportFilename}`,
        "Content-Type": "text/markdown; charset=utf-8",
      },
    });
  }

  if (!fixId) {
    return NextResponse.json(
      { error: "fixId or issueId is required." },
      { status: 400 },
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

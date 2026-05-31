import { getPrisma } from "@/lib/prisma";

export async function calculateSiteScore(
  domainId: string,
  crawlRunId?: string,
) {
  const prisma = getPrisma();
  const [
    criticalIssues,
    warningIssues,
    suggestionIssues,
    pageCount,
    criticalPageIssues,
    linkCount,
    brokenLinks,
  ] = await Promise.all([
    prisma.seoIssue.count({
      where: {
        domainId,
        severity: "CRITICAL",
        status: { notIn: ["FIXED", "IGNORED"] },
      },
    }),
    prisma.seoIssue.count({
      where: {
        domainId,
        severity: "WARNING",
        status: { notIn: ["FIXED", "IGNORED"] },
      },
    }),
    prisma.seoIssue.count({
      where: {
        domainId,
        severity: "SUGGESTION",
        status: { notIn: ["FIXED", "IGNORED"] },
      },
    }),
    prisma.page.count({ where: { domainId } }),
    prisma.seoIssue.count({
      where: {
        domainId,
        severity: "CRITICAL",
        status: { notIn: ["FIXED", "IGNORED"] },
        page: { importance: { in: ["CRITICAL", "IMPORTANT"] } },
      },
    }),
    prisma.pageLink.count({ where: { domainId } }),
    prisma.pageLink.count({
      where: {
        domainId,
        statusCode: { gte: 400 },
      },
    }),
  ]);

  const { score, reasonsJson } = calculateScoreFromMetrics({
    criticalIssues,
    warningIssues,
    suggestionIssues,
    pageCount,
    criticalPageIssues,
    linkCount,
    brokenLinks,
  });

  await prisma.domain.update({
    where: { id: domainId },
    data: { healthScore: score },
  });

  await prisma.siteScore.create({
    data: {
      domainId,
      crawlRunId,
      score,
      reasonsJson,
    },
  });

  return { score, reasonsJson };
}

export function calculateScoreFromMetrics({
  brokenLinks,
  criticalIssues,
  criticalPageIssues,
  linkCount,
  pageCount,
  suggestionIssues,
  warningIssues,
}: {
  brokenLinks: number;
  criticalIssues: number;
  criticalPageIssues: number;
  linkCount: number;
  pageCount: number;
  suggestionIssues: number;
  warningIssues: number;
}) {
  const penalties = {
    critical: criticalIssues * 12,
    criticalPages: criticalPageIssues * 5,
    warning: warningIssues * 5,
    suggestion: suggestionIssues * 2,
    brokenLinks: brokenLinks * 4,
    noPages: pageCount === 0 ? 25 : 0,
    noLinks: pageCount > 1 && linkCount === 0 ? 10 : 0,
  };
  const score = Math.max(
    0,
    Math.min(
      100,
      100 -
        penalties.critical -
        penalties.criticalPages -
        penalties.warning -
        penalties.suggestion -
        penalties.brokenLinks -
        penalties.noPages -
        penalties.noLinks,
    ),
  );

  return {
    score,
    reasonsJson: {
      criticalIssues,
      warningIssues,
      suggestionIssues,
      pageCount,
      criticalPageIssues,
      linkCount,
      brokenLinks,
      penalties,
    },
  };
}

import assert from "node:assert/strict";
import test from "node:test";
import {
  buildReportSections,
  buildReportPdfText,
  buildReportShareUrl,
  buildReportSummary,
  evaluateReportSchedulesWithPrisma,
  formatReportWhiteLabelVerificationValue,
  normalizeReportHostname,
  parseReportSections,
  publishReportWithPrisma,
  type ReportDetail,
} from "@/lib/reporting";

test("summarizes report issues, scores, crawls, and recommendations", () => {
  const periodStart = new Date("2026-05-01T00:00:00Z");
  const periodEnd = new Date("2026-05-31T23:59:59Z");
  const report = {
    title: "May SEO report",
    periodStart,
    periodEnd,
    workspace: { name: "Agency" },
    domain: null,
    template: null,
    client: {
      name: "Client Co",
      logoUrl: "https://example.com/logo.png",
      domains: [
        {
          id: "domain_1",
          domain: "example.com",
          healthScore: 90,
          pages: [{ id: "page_1" }, { id: "page_2" }],
          crawlRuns: [
            {
              id: "crawl_1",
              status: "COMPLETED",
              pagesCrawled: 2,
              pagesFailed: 0,
            },
          ],
          changeEvents: [
            {
              id: "change_1",
              severity: "CRITICAL",
              changeType: "title_changed",
              previousValue: "Old title",
              newValue: "New title",
              createdAt: new Date("2026-05-12T00:00:00Z"),
              page: { url: "https://example.com/" },
            },
            {
              id: "change_2",
              severity: "WARNING",
              changeType: "h1_changed",
              previousValue: "Old H1",
              newValue: "New H1",
              createdAt: new Date("2026-04-12T00:00:00Z"),
              page: null,
            },
          ],
          issues: [
            {
              id: "issue_1",
              domainId: "domain_1",
              status: "OPEN",
              severity: "CRITICAL",
              firstDetectedAt: new Date("2026-05-10T00:00:00Z"),
              resolvedAt: null,
              recommendation: "Add a unique title.",
              title: "Missing title",
              page: { url: "https://example.com/" },
            },
            {
              id: "issue_2",
              domainId: "domain_1",
              status: "FIXED",
              severity: "WARNING",
              firstDetectedAt: new Date("2026-04-01T00:00:00Z"),
              resolvedAt: new Date("2026-05-20T00:00:00Z"),
              recommendation: "Compress image assets.",
              title: "Large image",
              page: null,
            },
          ],
        },
      ],
    },
  } as unknown as ReportDetail;

  const summary = buildReportSummary(report);

  assert.equal(summary.score, 90);
  assert.equal(summary.pageCount, 2);
  assert.equal(summary.openIssues.length, 1);
  assert.equal(summary.fixedIssues.length, 1);
  assert.equal(summary.newIssues.length, 1);
  assert.equal(summary.criticalIssues.length, 1);
  assert.equal(summary.changeEvents.length, 1);
  assert.equal(summary.criticalChanges.length, 1);
  assert.equal(summary.brand.agencyName, "Agency");
  assert.equal(summary.brand.clientName, "Client Co");
  assert.equal(summary.brand.clientLogoUrl, "https://example.com/logo.png");
  assert.equal(summary.recommendations.length, 1);

  const pdfLines = buildReportPdfText(report);
  assert.equal(pdfLines[0], "May SEO report");
  assert.ok(pdfLines.some((line) => line.includes("Open issues: 1")));
  assert.ok(pdfLines.some((line) => line.includes("Changes detected: 1")));
  assert.ok(pdfLines.some((line) => line.includes("Prepared for: Client Co")));
});

test("builds and parses custom report template sections", () => {
  const sections = buildReportSections(["healthScore", "changeSummary"]);
  const parsed = parseReportSections(sections);

  assert.equal(parsed.healthScore, true);
  assert.equal(parsed.changeSummary, true);
  assert.equal(parsed.crawlSummary, false);
  assert.equal(parsed.issueMovement, false);
  assert.equal(parsed.priorityRecommendations, false);
});

test("omits disabled custom report template sections from PDF text", () => {
  const periodStart = new Date("2026-05-01T00:00:00Z");
  const periodEnd = new Date("2026-05-31T23:59:59Z");
  const report = {
    title: "Executive report",
    periodStart,
    periodEnd,
    workspace: { name: "Agency" },
    domain: null,
    template: {
      sectionsJson: buildReportSections(["healthScore"]),
    },
    client: {
      name: "Client Co",
      logoUrl: null,
      domains: [
        {
          id: "domain_1",
          domain: "example.com",
          healthScore: 84,
          pages: [{ id: "page_1" }],
          crawlRuns: [],
          changeEvents: [
            {
              id: "change_1",
              severity: "WARNING",
              changeType: "meta_description_changed",
              previousValue: "Old",
              newValue: "New",
              createdAt: new Date("2026-05-12T00:00:00Z"),
              page: null,
            },
          ],
          issues: [
            {
              id: "issue_1",
              domainId: "domain_1",
              status: "OPEN",
              severity: "WARNING",
              firstDetectedAt: new Date("2026-05-10T00:00:00Z"),
              resolvedAt: null,
              recommendation: "Rewrite the description.",
              title: "Weak meta description",
              page: null,
            },
          ],
        },
      ],
    },
  } as unknown as ReportDetail;

  const pdfLines = buildReportPdfText(report);

  assert.ok(pdfLines.some((line) => line.includes("Health score: 84")));
  assert.ok(!pdfLines.some((line) => line.includes("Change summary")));
  assert.ok(
    !pdfLines.some((line) => line.includes("Priority recommendations")),
  );
  assert.ok(!pdfLines.some((line) => line.includes("Pages monitored")));
});

test("formats missing report PDF health scores as no score yet", () => {
  const periodStart = new Date("2026-05-01T00:00:00Z");
  const periodEnd = new Date("2026-05-31T23:59:59Z");
  const report = {
    title: "Setup report",
    periodStart,
    periodEnd,
    workspace: { name: "Agency" },
    domain: {
      id: "domain_1",
      domain: "example.com",
      healthScore: null,
      pages: [],
      crawlRuns: [],
      changeEvents: [],
      issues: [],
      client: null,
    },
    template: {
      sectionsJson: buildReportSections(["healthScore"]),
    },
    client: null,
  } as unknown as ReportDetail;

  const pdfLines = buildReportPdfText(report);

  assert.ok(pdfLines.some((line) => line === "Health score: No score yet"));
  assert.ok(!pdfLines.some((line) => line.includes("Pending")));
});

test("builds white-label share URLs from verified report domains", () => {
  const report = {
    shareToken: "share_123",
    workspace: {
      name: "Agency",
      reportWhiteLabelDomains: [{ hostname: "reports.agency.com" }],
    },
    client: null,
    domain: null,
  } as unknown as ReportDetail;

  assert.equal(
    buildReportShareUrl(report),
    "https://reports.agency.com/share/reports/share_123",
  );
});

test("normalizes and formats white-label report domain verification", () => {
  assert.equal(
    normalizeReportHostname("https://Reports.Client.com/share"),
    "reports.client.com",
  );
  assert.equal(
    formatReportWhiteLabelVerificationValue("token_123"),
    "allinone-seo-report-domain=token_123",
  );
});

test("publishing a report creates a share token when missing", async () => {
  const updates: unknown[] = [];
  const prisma = {
    report: {
      findUnique: async () => ({ shareToken: null }),
      update: async (input: unknown) => {
        updates.push(input);
        return input;
      },
    },
  };

  await publishReportWithPrisma(prisma as never, "report_1");

  const update = updates[0] as {
    data: { shareToken?: string; status: string };
  };
  assert.equal(update.data.status, "PUBLISHED");
  assert.equal(typeof update.data.shareToken, "string");
  assert.ok(update.data.shareToken);
});

test("publishing a report preserves an existing share token", async () => {
  const updates: unknown[] = [];
  const prisma = {
    report: {
      findUnique: async () => ({ shareToken: "existing_token" }),
      update: async (input: unknown) => {
        updates.push(input);
        return input;
      },
    },
  };

  await publishReportWithPrisma(prisma as never, "report_1");

  const update = updates[0] as {
    data: { shareToken?: string; status: string };
  };
  assert.equal(update.data.status, "PUBLISHED");
  assert.equal(update.data.shareToken, "existing_token");
});

test("generates due scheduled reports and advances next run", async () => {
  const now = new Date("2026-05-29T12:00:00Z");
  const createdReports: unknown[] = [];
  const updates: unknown[] = [];
  const prisma = {
    reportSchedule: {
      findMany: async () => [
        {
          id: "schedule_1",
          workspaceId: "workspace_1",
          clientId: "client_1",
          domainId: null,
          title: "Weekly SEO report",
          frequency: "WEEKLY",
        },
      ],
      update: async (input: unknown) => {
        updates.push(input);
        return input;
      },
    },
    report: {
      create: async (input: { data: { id?: string; title: string } }) => {
        const report = { id: "report_1", ...input.data };
        createdReports.push(report);
        return report;
      },
    },
  };

  const result = await evaluateReportSchedulesWithPrisma(prisma as never, now);

  assert.equal(result.evaluated, 1);
  assert.equal(result.generated, 1);
  assert.equal(result.reportIds[0], "report_1");
  assert.equal(createdReports.length, 1);
  assert.match(
    (createdReports[0] as { title: string }).title,
    /Weekly SEO report/,
  );
  assert.equal(updates.length, 1);
});

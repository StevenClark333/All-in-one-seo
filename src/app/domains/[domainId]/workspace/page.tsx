import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";
import {
  AlertTriangle,
  BarChart3,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Hammer,
  Home,
  Link2,
  Play,
  PlugZap,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { generateReport } from "@/app/actions";
import {
  AnalyticsMetricCard,
  HorizontalBar,
} from "@/components/analytics-widgets";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { getDomainWorkspaceData } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

type DomainWorkspacePageProps = {
  params: Promise<{ domainId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type DomainWorkspace = NonNullable<
  Awaited<ReturnType<typeof getDomainWorkspaceData>>["domain"]
>;

type ThematicReport = {
  detail: string;
  href: string;
  label: string;
  status: "good" | "warning" | "critical" | "neutral";
  value: string;
};

type ProjectFocusItem = {
  detail: string;
  href: string;
  label: string;
  tone: "good" | "neutral" | "warning" | "critical";
  value: string;
};

export default async function DomainWorkspacePage({
  params,
  searchParams,
}: DomainWorkspacePageProps) {
  const { domainId } = await params;
  const query = searchParams ? await searchParams : {};
  const error = getSingle(query.error);
  const { workspace, domain } = await getDomainWorkspaceData(domainId);

  if (!domain) {
    notFound();
  }

  const latestCrawl = domain.crawlRuns.at(0);
  const latestScore = domain.scoreHistory.at(0);
  const latestReport = domain.reports.at(0);
  const searchSummary = buildSearchSummary(domain.gscMetrics);
  const auditOverview = buildAuditOverview(domain);
  const lastUpdatedAt =
    latestCrawl?.completedAt ?? latestCrawl?.createdAt ?? domain.updatedAt;
  const jsRenderingStatus = latestCrawl?.renderedCaptures.length
    ? "Rendered fallback used"
    : "Standard crawler";
  const shareHref =
    latestReport?.status === "PUBLISHED" && latestReport.shareToken
      ? `/share/reports/${latestReport.shareToken}`
      : latestReport
        ? `/reports/${latestReport.id}`
        : `/reports?domainId=${domain.id}`;
  const isVerified =
    domain.verificationStatus === "VERIFIED" ||
    domain.verifications.some(
      (verification) => verification.status === "VERIFIED",
    );
  const criticalIssues = domain.issues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;
  const warningIssues = domain.issues.filter(
    (issue) => issue.severity === "WARNING",
  ).length;
  const approvedFixes = domain.linkFixSuggestions.filter(
    (fix) => fix.status === "APPROVED",
  ).length;
  const sentFixes = domain.linkFixSuggestions.filter(
    (fix) => fix.status === "EXPORTED",
  ).length;
  const appliedFixes = domain.linkFixSuggestions.filter(
    (fix) => fix.status === "APPLIED",
  ).length;
  const wordpressReady = domain.integrations.some(
    (integration) =>
      integration.provider === "WORDPRESS_RECEIVER" &&
      integration.status === "CONNECTED",
  );
  const navItems = buildProjectTabs(domain.id);
  const thematicReports = buildThematicReports(domain);
  const commandQueue = buildCommandQueue({
    approvedFixes,
    criticalIssues,
    domainId: domain.id,
    isVerified,
    latestReportId: latestReport?.id,
    warningIssues,
  });
  const projectFocusItems = buildProjectFocusItems({
    criticalIssues,
    domainId: domain.id,
    healthScore: domain.healthScore ?? latestScore?.score ?? 0,
    isVerified,
    latestCrawlHref: latestCrawl
      ? `/crawl-runs/${latestCrawl.id}`
      : `/domains/${domain.id}/workspace`,
    latestCrawlStatus: latestCrawl ? formatEnum(latestCrawl.status) : "Not run",
    latestReportHref: shareHref,
    latestReportStatus: latestReport ? formatEnum(latestReport.status) : "No report yet",
    warningIssues,
  });
  const scorePoints = domain.scoreHistory
    .slice()
    .reverse()
    .map((score) => ({ value: score.score }));
  const searchPoints = domain.gscMetrics
    .slice(0, 28)
    .reverse()
    .map((metric) => ({ value: metric.impressions }));

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Sites" activeDomainId={domain.id} />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium hover:text-slate-950"
            >
              <Home className="size-4" aria-hidden="true" />
              Home
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <Link href="/domains" className="font-medium hover:text-slate-950">
              Projects
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <Link href="/domains" className="font-medium hover:text-slate-950">
              Workspace
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="font-semibold text-slate-800">
              {domain.domain}
            </span>
          </nav>

          <header className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  {workspace?.name ?? "Workspace"} /{" "}
                  {domain.client?.name ?? "Unassigned client"}
                </p>
                <h2 className="mt-2 break-words text-3xl font-semibold tracking-normal">
                  {domain.domain}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  A simple workspace for this website. Start with the next
                  helpful action, then open deeper audit, page, report, and
                  integration details when you need them.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action="/api/domains/start-crawl" method="post">
                  <input type="hidden" name="domainId" value={domain.id} />
                  <input
                    type="hidden"
                    name="returnTo"
                    value={`/domains/${domain.id}/workspace`}
                  />
                  <button
                    disabled={!isVerified}
                    className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Play className="size-4" aria-hidden="true" />
                    Run new check
                    <InfoTooltip
                      label="Run a fresh domain crawl and update pages, issues, scores, and fix verification."
                      passive
                      side="left"
                    />
                  </button>
                </form>
                <form action={generateReport}>
                  <input type="hidden" name="domainId" value={domain.id} />
                  <input
                    type="hidden"
                    name="title"
                    value={`${domain.domain} SEO report`}
                  />
                  <button className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <FileText className="size-4" aria-hidden="true" />
                    Create report
                  </button>
                </form>
                <ActionLink
                  disabled={!latestReport}
                  href={
                    latestReport
                      ? `/reports/${latestReport.id}/pdf`
                      : `/reports?domainId=${domain.id}`
                  }
                  label="Download PDF"
                >
                  <Download className="size-4" aria-hidden="true" />
                </ActionLink>
                <ActionLink
                  href={`/api/exports/pages?domainId=${domain.id}`}
                  label="Pages CSV"
                >
                  <Download className="size-4" aria-hidden="true" />
                </ActionLink>
                <ActionLink
                  href={`/api/exports/issues?domainId=${domain.id}`}
                  label="Issues CSV"
                >
                  <Download className="size-4" aria-hidden="true" />
                </ActionLink>
                <ActionLink href={shareHref} label="Share">
                  <ExternalLink className="size-4" aria-hidden="true" />
                </ActionLink>
                <ActionLink
                  href={`/reports?domainId=${domain.id}#schedule-report`}
                  label="Schedule"
                >
                  <CalendarClock className="size-4" aria-hidden="true" />
                </ActionLink>
                <ActionLink href={`/domains/${domain.id}`} label="Settings">
                  <Settings className="size-4" aria-hidden="true" />
                </ActionLink>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2 xl:grid-cols-7">
              <ContextItem label="Domain" value={domain.domain} />
              <ContextItem
                label="Client"
                value={domain.client?.name ?? "Unassigned"}
              />
              <ContextItem
                label="Last updated"
                value={formatDate(lastUpdatedAt)}
              />
              <ContextItem
                label="Pages crawled"
                value={`${latestCrawl?.pagesCrawled ?? 0} / ${domain.pages.length}`}
              />
              <ContextItem
                label="Platform"
                value={formatEnum(domain.platform)}
              />
              <ContextItem label="JS rendering" value={jsRenderingStatus} />
              <ContextItem
                label="Verification"
                value={
                  isVerified
                    ? "Verified"
                    : formatEnum(domain.verificationStatus)
                }
              />
            </dl>

            <div className="mt-5 flex items-center gap-2 overflow-x-auto border-b border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 border-b-2 px-3 text-sm font-semibold transition ${
                      item.active
                        ? "border-blue-600 text-slate-950"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          {error ? (
            <StatusNotice message={getDomainErrorMessage(error)} />
          ) : null}

          <ProjectFocusPlan items={projectFocusItems} />

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700">
                  Today&apos;s project plan
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-normal">
                  What needs attention now
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Health, search visibility, crawl coverage, and priority work
                  stay together here. Each card opens the next useful place to
                  review or fix.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {commandQueue.slice(0, 3).map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
                  >
                    {item.label}
                    <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-xs text-slate-500">
                      {item.count}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <AnalyticsMetricCard
                delta={auditOverview.healthDelta}
                help="Latest site health score"
                href={`/issues?domainId=${domain.id}`}
                icon={ShieldCheck}
                label="Site health"
                points={scorePoints}
                value={domain.healthScore ?? latestScore?.score ?? 0}
              />
              <AnalyticsMetricCard
                help="Search Console visibility"
                href={`/search-performance?domainId=${domain.id}`}
                icon={BarChart3}
                label="Search visibility"
                points={searchPoints}
                suffix="%"
                value={searchSummary.visibility}
              />
              <AnalyticsMetricCard
                help="Pages crawled in the latest crawl"
                href={`/pages?domainId=${domain.id}`}
                icon={ClipboardList}
                label="Crawl coverage"
                suffix="%"
                value={calculateCoverage(
                  latestCrawl?.pagesCrawled ?? 0,
                  domain.pages.length,
                )}
              />
              <AnalyticsMetricCard
                help="Open critical and warning issues"
                href={`/issues?domainId=${domain.id}`}
                icon={AlertTriangle}
                label="Priority issues"
                value={`${criticalIssues} / ${warningIssues}`}
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <h4 className="text-sm font-semibold text-slate-500">
                  Page health mix
                </h4>
                <div className="mt-4 grid gap-4">
                  <HorizontalBar
                    label="Healthy pages"
                    max={Math.max(1, domain.pages.length)}
                    value={auditOverview.pageBreakdown.healthy}
                  />
                  <HorizontalBar
                    label="Pages with issues"
                    max={Math.max(1, domain.pages.length)}
                    value={auditOverview.pageBreakdown.haveIssues}
                  />
                  <HorizontalBar
                    label="Broken pages"
                    max={Math.max(1, domain.pages.length)}
                    value={auditOverview.pageBreakdown.broken}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-500">
                  Next actions
                </h4>
                <div className="mt-4 grid gap-2">
                  {commandQueue.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm transition hover:bg-white"
                    >
                      <span className="font-semibold text-slate-700">
                        {item.label}
                      </span>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-500">
                        {item.count}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              help="Latest site health score for this domain."
              label="Health score"
              value={domain.healthScore ?? latestScore?.score ?? "Pending"}
            />
            <Metric
              help="Pages known for this domain from crawler discovery."
              label="Pages"
              value={domain.pages.length}
            />
            <Metric
              help="Critical problems first, warnings second."
              label="Critical / warnings"
              value={`${criticalIssues} / ${warningIssues}`}
            />
            <Metric
              help="Most recent crawl run state."
              label="Last crawl"
              value={
                latestCrawl ? formatEnum(latestCrawl.status) : "Not started"
              }
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Gauge-style score from the latest site health value and crawl score history.">
                      Site Health
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest technical audit score.
                  </p>
                </div>
                <Link
                  href={`/issues?domainId=${domain.id}`}
                  className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                >
                  View all issues
                </Link>
              </div>
              <div className="mt-5 flex items-center gap-5">
                <div
                  className="grid size-32 place-items-center rounded-full"
                  style={{
                    background: `conic-gradient(${auditOverview.healthColor} ${
                      auditOverview.healthScore
                    }%, #e2e8f0 0)`,
                  }}
                >
                  <div className="grid size-24 place-items-center rounded-full bg-white">
                    <span className="text-3xl font-semibold">
                      {auditOverview.healthScore}
                    </span>
                  </div>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-700">
                    {auditOverview.healthLabel}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {auditOverview.healthTrend}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Breakdown of crawled pages by latest snapshot status, issue load, redirects, and robots directives.">
                  Pages crawled
                </HelpLabel>
              </h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-5">
                <BreakdownItem
                  label="Healthy"
                  tone="success"
                  value={auditOverview.pageBreakdown.healthy}
                />
                <BreakdownItem
                  label="Broken"
                  tone="error"
                  value={auditOverview.pageBreakdown.broken}
                />
                <BreakdownItem
                  label="Have issues"
                  tone="warning"
                  value={auditOverview.pageBreakdown.haveIssues}
                />
                <BreakdownItem
                  label="Redirects"
                  tone="info"
                  value={auditOverview.pageBreakdown.redirects}
                />
                <BreakdownItem
                  label="Blocked"
                  tone="muted"
                  value={auditOverview.pageBreakdown.blocked}
                />
              </div>
            </div>

            <div className="grid gap-4">
              <SignalCard
                detail={auditOverview.errorTrend}
                label="Errors"
                tone="error"
                value={criticalIssues}
              />
              <SignalCard
                detail={`${auditOverview.topWarnings.length} top warning categories`}
                label="Warnings"
                tone="warning"
                value={warningIssues}
              />
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="A search-AI accessibility score based on robots.txt and page-level robots directives.">
                      AI Search Health
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    AI crawler and search bot accessibility.
                  </p>
                </div>
                <span className="rounded-md border border-blue-200 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                  {auditOverview.aiSearchHealth}%
                </span>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {auditOverview.botAccess.map((bot) => (
                  <div
                    key={bot.name}
                    className={`rounded-md border p-3 ${
                      bot.blocked
                        ? "border-red-200 bg-red-50 text-red-800"
                        : "border-emerald-200 bg-emerald-50 text-emerald-800"
                    }`}
                  >
                    <p className="text-sm font-semibold">{bot.name}</p>
                    <p className="mt-1 text-xs">
                      {bot.blocked ? "Blocked" : "Allowed"}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Most common warning issues for this website.">
                  Top warnings
                </HelpLabel>
              </h3>
              <div className="mt-4 grid gap-3">
                {auditOverview.topWarnings.length ? (
                  auditOverview.topWarnings.map((warning) => (
                    <Link
                      key={warning.issueType}
                      href={`/issues?domainId=${domain.id}&issueType=${encodeURIComponent(
                        warning.issueType,
                      )}`}
                      className="flex items-center justify-between gap-3 rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                    >
                      <span className="min-w-0 truncate text-sm font-semibold">
                        {formatIssueType(warning.issueType)}
                      </span>
                      <span className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                        {warning.count}
                      </span>
                    </Link>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No warning categories in the current issue sample.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="Focused audit categories for this website, mapped from crawler artifacts, page snapshots, issues, and rendered crawl signals.">
                    Thematic Reports
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick health cards for the technical areas users usually
                  inspect first.
                </p>
              </div>
              <Link
                href={`/technical-audit?domainId=${domain.id}`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View audit details
              </Link>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">
              {thematicReports.map((report) => (
                <ThematicReportCard key={report.label} {...report} />
              ))}
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Domain-scoped work queue so one client site can be managed without cross-domain noise.">
                      Project work queue
                    </HelpLabel>
                  </h3>
                  <Link
                    href={`/issues?domainId=${domain.id}`}
                    className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                  >
                    View all issues
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <QueueCard
                    help="Open issues that should be triaged or assigned."
                    href={`/issues?domainId=${domain.id}`}
                    label="Open issues"
                    value={domain.issues.length}
                  />
                  <QueueCard
                    help="Fixes approved and waiting to be sent or applied."
                    href={`/fix-center?domainId=${domain.id}&status=APPROVED`}
                    label="Approved fixes"
                    value={approvedFixes}
                  />
                  <QueueCard
                    help="Fixes already sent or applied through the delivery workflow."
                    href={`/fix-center?domainId=${domain.id}`}
                    label="Sent / applied"
                    value={`${sentFixes} / ${appliedFixes}`}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <HelpLabel help="Imported Google Search Console visibility and demand signals for this website.">
                        Search performance
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Query and page demand from Google Search Console imports.
                    </p>
                  </div>
                  <Link
                    href={`/search-performance?domainId=${domain.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View performance
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-4">
                  <QueueCard
                    help="Impression-weighted visibility based on average search position."
                    href={`/search-performance?domainId=${domain.id}`}
                    label="Visibility"
                    value={`${searchSummary.visibility}%`}
                  />
                  <QueueCard
                    help="Organic clicks from imported Search Console metrics."
                    href={`/search-performance?domainId=${domain.id}`}
                    label="Clicks"
                    value={searchSummary.clicks.toLocaleString()}
                  />
                  <QueueCard
                    help="Organic impressions from imported Search Console metrics."
                    href={`/search-performance?domainId=${domain.id}`}
                    label="Impressions"
                    value={searchSummary.impressions.toLocaleString()}
                  />
                  <QueueCard
                    help="Distinct queries found in imported Search Console rows."
                    href={`/search-performance?domainId=${domain.id}`}
                    label="Queries"
                    value={searchSummary.queries}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <HelpLabel help="Highest-priority issues for this website only.">
                        Priority issues
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Critical and high-priority domain findings.
                    </p>
                  </div>
                  <Link
                    href={`/fix-center?domainId=${domain.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Open Fix Center
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {domain.issues.length ? (
                    domain.issues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/issues/${issue.id}`}
                        className="grid gap-2 px-5 py-4 transition hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_120px]"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold">{issue.title}</p>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {issue.page?.url ?? "Site-level issue"}
                          </p>
                        </div>
                        <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {formatEnum(issue.severity)}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      No active issues for this domain.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <HelpLabel help="Recently crawled pages for this website.">
                        Page inventory
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Latest URLs, titles, and page-level issue count.
                    </p>
                  </div>
                  <Link
                    href={`/pages?domainId=${domain.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View pages
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {domain.pages.length ? (
                    domain.pages.map((page) => {
                      const snapshot = page.snapshots.at(0);

                      return (
                        <Link
                          key={page.id}
                          href={`/pages/${page.id}`}
                          className="grid gap-2 px-5 py-4 transition hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_90px]"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {snapshot?.title || page.url}
                            </p>
                            <p className="mt-1 truncate text-sm text-slate-500">
                              {page.url}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-slate-600">
                            {page.issues.length} issues
                          </span>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      No pages crawled yet.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <aside className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Readiness signals for this website project.">
                    Project readiness
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  <ReadinessItem
                    complete={isVerified}
                    label="Domain verified"
                    value={
                      isVerified ? "Ownership confirmed" : "Verify ownership"
                    }
                  />
                  <ReadinessItem
                    complete={domain.scriptStatus === "DETECTED"}
                    label="Monitoring script"
                    value={formatEnum(domain.scriptStatus)}
                  />
                  <ReadinessItem
                    complete={wordpressReady}
                    label="Fix receiver"
                    value={
                      wordpressReady ? "Connected" : "Connect in Integrations"
                    }
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Latest crawl runs for this domain only.">
                    Recent crawls
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  {domain.crawlRuns.length ? (
                    domain.crawlRuns.map((crawl) => (
                      <Link
                        key={crawl.id}
                        href={`/crawl-runs/${crawl.id}`}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                      >
                        <p className="text-sm font-semibold">
                          {formatEnum(crawl.status)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {crawl.pagesCrawled} crawled / {crawl.pagesFailed}{" "}
                          failed
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No crawl runs yet.</p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Recent monitoring events from crawls, robots.txt, sitemap, templates, and page changes.">
                    Recent changes
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  {domain.changeEvents.length ? (
                    domain.changeEvents.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-sm font-semibold">
                          {formatEnum(event.changeType)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {event.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No changes detected yet.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Latest client-ready reports scoped to this domain.">
                    Reports
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  {domain.reports.length ? (
                    domain.reports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/reports/${report.id}`}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                      >
                        <p className="text-sm font-semibold">{report.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatEnum(report.status)}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No reports generated for this domain.
                    </p>
                  )}
                </div>
              </section>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}

function buildThematicReports(domain: DomainWorkspace): ThematicReport[] {
  const latestCrawl = domain.crawlRuns.at(0);
  const robotsArtifact = domain.artifacts.find(
    (artifact) => artifact.type === "ROBOTS_TXT",
  );
  const sitemapArtifact = domain.artifacts.find(
    (artifact) => artifact.type === "SITEMAP",
  );
  const pagesWithSnapshots = domain.pages.filter(
    (page) => page.snapshots.length > 0,
  );
  const healthyPages = pagesWithSnapshots.filter((page) => {
    const snapshot = page.snapshots.at(0);
    const robotsDirective = snapshot?.robotsDirective?.toLowerCase() ?? "";

    return (
      Boolean(snapshot) &&
      Number(snapshot?.statusCode) < 400 &&
      !robotsDirective.includes("noindex")
    );
  }).length;
  const httpsPages = domain.pages.filter((page) =>
    page.url.toLowerCase().startsWith("https://"),
  ).length;
  const schemaPages = pagesWithSnapshots.filter((page) =>
    hasStructuredData(page.snapshots.at(0)?.metadataJson),
  ).length;
  const noindexPages = pagesWithSnapshots.filter((page) =>
    page.snapshots.at(0)?.robotsDirective?.toLowerCase().includes("noindex"),
  ).length;
  const internalIssues = countIssuesByType(domain, [
    "deep_page:",
    "sitemap_url_not_internally_linked:",
    "internally_linked_url_missing_from_sitemap:",
    "internal_link",
    "sitemap",
  ]);
  const canonicalIssues = countIssuesByType(domain, [
    "missing_canonical",
    "broken_canonical",
    "canonical_non_200",
  ]);
  const performanceScore = latestCrawl
    ? percentage(
        Math.max(0, latestCrawl.pagesCrawled - latestCrawl.pagesFailed),
        Math.max(1, latestCrawl.pagesCrawled),
      )
    : null;
  const crawlabilityScore = pagesWithSnapshots.length
    ? percentage(healthyPages, pagesWithSnapshots.length)
    : null;
  const httpsScore = domain.pages.length
    ? percentage(httpsPages, domain.pages.length)
    : null;
  const markupScore = pagesWithSnapshots.length
    ? percentage(schemaPages, pagesWithSnapshots.length)
    : null;
  const indexabilityScore = pagesWithSnapshots.length
    ? percentage(
        pagesWithSnapshots.length - noindexPages,
        pagesWithSnapshots.length,
      )
    : null;
  const jsRenderingUsed = Boolean(latestCrawl?.renderedCaptures.length);
  const baseHref = `/technical-audit?domainId=${domain.id}`;

  return [
    {
      detail: robotsArtifact
        ? `Fetched ${formatDate(robotsArtifact.createdAt)}`
        : "Not fetched yet",
      href: baseHref,
      label: "Robots.txt",
      status: artifactStatus(robotsArtifact),
      value: robotsArtifact?.statusCode
        ? String(robotsArtifact.statusCode)
        : "Pending",
    },
    {
      detail: sitemapArtifact
        ? `Fetched ${formatDate(sitemapArtifact.createdAt)}`
        : "Not fetched yet",
      href: baseHref,
      label: "Sitemap",
      status: artifactStatus(sitemapArtifact),
      value: sitemapArtifact?.statusCode
        ? String(sitemapArtifact.statusCode)
        : "Pending",
    },
    {
      detail: `${healthyPages} crawlable pages checked`,
      href: `/pages?domainId=${domain.id}`,
      label: "Crawlability",
      status: scoreStatus(crawlabilityScore),
      value: formatPercent(crawlabilityScore),
    },
    {
      detail: `${httpsPages} HTTPS URLs found`,
      href: `/pages?domainId=${domain.id}`,
      label: "HTTPS",
      status: scoreStatus(httpsScore),
      value: formatPercent(httpsScore),
    },
    {
      detail: internalIssues
        ? `${internalIssues} internal SEO issues`
        : "No internal link issues in current sample",
      href: `/technical-audit?domainId=${domain.id}`,
      label: "Internal Linking",
      status: issueStatus(internalIssues),
      value: internalIssues ? String(internalIssues) : "Clear",
    },
    {
      detail: `${schemaPages} pages with schema detected`,
      href: `/pages?domainId=${domain.id}`,
      label: "Markup",
      status: scoreStatus(markupScore),
      value: formatPercent(markupScore),
    },
    {
      detail: latestCrawl
        ? `${latestCrawl.pagesFailed} failed pages in latest crawl`
        : "No crawl run yet",
      href: latestCrawl ? `/crawl-runs/${latestCrawl.id}` : baseHref,
      label: "Performance",
      status: scoreStatus(performanceScore),
      value: formatPercent(performanceScore),
    },
    {
      detail: noindexPages
        ? `${noindexPages} noindex pages`
        : "No noindex pages in current sample",
      href: `/pages?domainId=${domain.id}`,
      label: "Indexability",
      status: scoreStatus(indexabilityScore),
      value: formatPercent(indexabilityScore),
    },
    {
      detail: canonicalIssues
        ? `${canonicalIssues} canonical issues`
        : "No canonical issues in priority queue",
      href: `/issues?domainId=${domain.id}`,
      label: "Canonicals",
      status: issueStatus(canonicalIssues),
      value: canonicalIssues ? String(canonicalIssues) : "Clear",
    },
    {
      detail: jsRenderingUsed
        ? "Rendered crawl fallback was used"
        : "Standard crawler data",
      href: baseHref,
      label: "JS Rendering",
      status: jsRenderingUsed ? "warning" : "good",
      value: jsRenderingUsed ? "Used" : "Stable",
    },
  ];
}

function buildProjectTabs(domainId: string) {
  return [
    {
      active: true,
      href: `/domains/${domainId}/workspace`,
      icon: ShieldCheck,
      label: "Overview",
    },
    {
      active: false,
      href: `/issues?domainId=${domainId}`,
      icon: AlertTriangle,
      label: "Issues",
    },
    {
      active: false,
      href: `/pages?domainId=${domainId}`,
      icon: ClipboardList,
      label: "Pages",
    },
    {
      active: false,
      href: `/search-performance?domainId=${domainId}`,
      icon: BarChart3,
      label: "Search",
    },
    {
      active: false,
      href: `/technical-audit?domainId=${domainId}`,
      icon: Link2,
      label: "Internal Links",
    },
    {
      active: false,
      href: `/technical-audit?domainId=${domainId}`,
      icon: CalendarClock,
      label: "Changes",
    },
    {
      active: false,
      href: `/fix-center?domainId=${domainId}`,
      icon: Hammer,
      label: "Fixes",
    },
    {
      active: false,
      href: `/reports?domainId=${domainId}`,
      icon: FileText,
      label: "Reports",
    },
    {
      active: false,
      href: `/integrations?domainId=${domainId}`,
      icon: PlugZap,
      label: "Integrations",
    },
    {
      active: false,
      href: `/recommendations?domainId=${domainId}`,
      icon: Bot,
      label: "Ideas",
    },
  ];
}

function buildProjectFocusItems({
  criticalIssues,
  domainId,
  healthScore,
  isVerified,
  latestCrawlHref,
  latestCrawlStatus,
  latestReportHref,
  latestReportStatus,
  warningIssues,
}: {
  criticalIssues: number;
  domainId: string;
  healthScore: number;
  isVerified: boolean;
  latestCrawlHref: string;
  latestCrawlStatus: string;
  latestReportHref: string;
  latestReportStatus: string;
  warningIssues: number;
}): ProjectFocusItem[] {
  const firstAction = !isVerified
    ? {
        detail: "Confirm ownership so the portal can safely crawl and recommend fixes.",
        href: `/domains/${domainId}/verification`,
        label: "Do first",
        tone: "warning" as const,
        value: "Confirm ownership",
      }
    : criticalIssues > 0
      ? {
          detail: "These are the issues most likely to hurt visitors or search visibility.",
          href: `/issues?domainId=${domainId}&severity=CRITICAL`,
          label: "Do first",
          tone: "critical" as const,
          value: `${criticalIssues} critical fixes`,
        }
      : warningIssues > 0
        ? {
            detail: "No critical issues are blocking you. Review the warning list next.",
            href: `/issues?domainId=${domainId}&severity=WARNING`,
            label: "Do first",
            tone: "warning" as const,
            value: `${warningIssues} warnings`,
          }
        : {
            detail: "The project looks calm. Keep monitoring and share a fresh update.",
            href: `/reports?domainId=${domainId}`,
            label: "Do first",
            tone: "good" as const,
            value: "Share progress",
          };

  return [
    firstAction,
    {
      detail: `Site health is ${healthScore}/100. Open the latest crawl for what changed.`,
      href: latestCrawlHref,
      label: "Check health",
      tone: healthScore >= 80 ? "good" : healthScore >= 60 ? "warning" : "critical",
      value: latestCrawlStatus,
    },
    {
      detail: "Use the report when you need a client-friendly summary instead of raw data.",
      href: latestReportHref,
      label: "Share update",
      tone: latestReportStatus === "Published" ? "good" : "neutral",
      value: latestReportStatus,
    },
  ];
}

function ProjectFocusPlan({ items }: { items: ProjectFocusItem[] }) {
  const toneStyles = {
    critical: "border-red-200 bg-red-50 text-red-800",
    good: "border-emerald-200 bg-emerald-50 text-emerald-800",
    neutral: "border-slate-200 bg-slate-50 text-slate-800",
    warning: "border-orange-200 bg-orange-50 text-orange-800",
  };

  return (
    <section className="mt-6 rounded-lg border border-orange-200 bg-orange-50/70 p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Website focus plan
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            Start with these three steps
          </h3>
        </div>
        <p className="max-w-xl text-sm leading-6 text-slate-600">
          A shorter path through the project: fix what matters, check the last
          crawl, then share the update.
        </p>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`rounded-md border p-4 transition hover:bg-white ${toneStyles[item.tone]}`}
          >
            <p className="text-sm font-medium opacity-80">{item.label}</p>
            <p className="mt-2 text-lg font-semibold">{item.value}</p>
            <p className="mt-2 text-sm leading-5 opacity-80">{item.detail}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

function buildSearchSummary(metrics: DomainWorkspace["gscMetrics"]) {
  const clicks = metrics.reduce((total, metric) => total + metric.clicks, 0);
  const impressions = metrics.reduce(
    (total, metric) => total + metric.impressions,
    0,
  );
  const visibleWeight = metrics.reduce((total, metric) => {
    const positionScore = Math.max(0, 101 - metric.position) / 100;

    return total + metric.impressions * positionScore;
  }, 0);
  const queries = new Set(metrics.map((metric) => metric.query).filter(Boolean));

  return {
    clicks,
    impressions,
    queries: queries.size,
    visibility: impressions
      ? Math.round((visibleWeight / impressions) * 1000) / 10
      : 0,
  };
}

function buildCommandQueue({
  approvedFixes,
  criticalIssues,
  domainId,
  isVerified,
  latestReportId,
  warningIssues,
}: {
  approvedFixes: number;
  criticalIssues: number;
  domainId: string;
  isVerified: boolean;
  latestReportId?: string;
  warningIssues: number;
}) {
  return [
    {
      count: criticalIssues,
      href: `/issues?domainId=${domainId}&severity=CRITICAL`,
      label: "Fix critical issues",
    },
    {
      count: warningIssues,
      href: `/issues?domainId=${domainId}&severity=WARNING`,
      label: "Review warnings",
    },
    {
      count: approvedFixes,
      href: `/fix-center?domainId=${domainId}`,
      label: "Ship approved fixes",
    },
    {
      count: isVerified ? 1 : 0,
      href: `/domains/${domainId}/verification`,
      label: isVerified ? "Verification ready" : "Verify domain",
    },
    {
      count: latestReportId ? 1 : 0,
      href: latestReportId ? `/reports/${latestReportId}` : `/reports?domainId=${domainId}`,
      label: latestReportId ? "Review latest report" : "Create report",
    },
  ];
}

function calculateCoverage(crawled: number, known: number) {
  if (!known) {
    return 0;
  }

  return Math.min(100, Math.round((crawled / known) * 100));
}

function buildAuditOverview(domain: DomainWorkspace) {
  const latestScore = domain.healthScore ?? domain.scoreHistory.at(0)?.score ?? 0;
  const previousScore = domain.scoreHistory.at(1)?.score;
  const pagesWithSnapshots = domain.pages.filter(
    (page) => page.snapshots.length > 0,
  );
  const pageBreakdown = pagesWithSnapshots.reduce(
    (summary, page) => {
      const snapshot = page.snapshots.at(0);
      const statusCode = snapshot?.statusCode ?? 0;
      const robotsDirective = snapshot?.robotsDirective?.toLowerCase() ?? "";

      if (statusCode >= 300 && statusCode < 400) {
        summary.redirects += 1;
      }

      if (statusCode >= 400) {
        summary.broken += 1;
      }

      if (robotsDirective.includes("noindex")) {
        summary.blocked += 1;
      }

      if (page.issues.length) {
        summary.haveIssues += 1;
      }

      if (
        statusCode > 0 &&
        statusCode < 300 &&
        !robotsDirective.includes("noindex") &&
        !page.issues.length
      ) {
        summary.healthy += 1;
      }

      return summary;
    },
    { blocked: 0, broken: 0, haveIssues: 0, healthy: 0, redirects: 0 },
  );
  const warningCounts = new Map<string, number>();

  for (const issue of domain.issues) {
    if (issue.severity !== "WARNING") {
      continue;
    }

    warningCounts.set(issue.issueType, (warningCounts.get(issue.issueType) ?? 0) + 1);
  }

  const robotsText = domain.artifacts
    .filter((artifact) => artifact.type === "ROBOTS_TXT")
    .map((artifact) => JSON.stringify(artifact.metadataJson ?? "").toLowerCase())
    .join("\n");
  const botAccess = ["ChatGPT-User", "OAI-SearchBot", "Googlebot", "Google-Extended"].map(
    (name) => ({
      blocked:
        robotsText.includes(name.toLowerCase()) &&
        robotsText.includes("disallow"),
      name,
    }),
  );
  const blockedBotCount = botAccess.filter((bot) => bot.blocked).length;
  const pageBlockRate = pagesWithSnapshots.length
    ? pageBreakdown.blocked / pagesWithSnapshots.length
    : 0;
  const aiSearchHealth = Math.max(
    0,
    Math.round(100 - blockedBotCount * 20 - pageBlockRate * 30),
  );

  return {
    aiSearchHealth,
    botAccess,
    errorTrend:
      previousScore === undefined
        ? "No previous score for trend yet"
        : latestScore >= previousScore
          ? `Health improved by ${latestScore - previousScore} points`
          : `Health declined by ${previousScore - latestScore} points`,
    healthColor:
      latestScore >= 85 ? "#059669" : latestScore >= 65 ? "#d97706" : "#dc2626",
    healthLabel:
      latestScore >= 85
        ? "Healthy"
        : latestScore >= 65
          ? "Needs attention"
          : "High risk",
    healthDelta:
      previousScore === undefined ? undefined : latestScore - previousScore,
    healthScore: latestScore,
    healthTrend:
      previousScore === undefined
        ? "Run another crawl to compare score movement."
        : latestScore >= previousScore
          ? "The latest score is holding or improving."
          : "The latest score moved down and should be reviewed.",
    pageBreakdown,
    topWarnings: Array.from(warningCounts.entries())
      .map(([issueType, count]) => ({ count, issueType }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
  };
}

function BreakdownItem({
  label,
  tone,
  value,
}: {
  label: string;
  tone: "error" | "info" | "muted" | "success" | "warning";
  value: number;
}) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    info: "border-blue-200 bg-blue-50 text-blue-700",
    muted: "border-slate-200 bg-slate-100 text-slate-600",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-700",
  };

  return (
    <div className={`rounded-md border p-3 ${styles[tone]}`}>
      <p className="text-sm font-medium">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function SignalCard({
  detail,
  label,
  tone,
  value,
}: {
  detail: string;
  label: string;
  tone: "error" | "warning";
  value: number;
}) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-800"
      : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className={`rounded-lg border p-5 ${styles}`}>
      <p className="text-sm font-semibold">{label}</p>
      <p className="mt-2 text-3xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-6">{detail}</p>
    </div>
  );
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 truncate text-sm font-semibold text-slate-700">
        {value}
      </dd>
    </div>
  );
}

function ActionLink({
  children,
  disabled,
  href,
  label,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  href: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex h-10 cursor-not-allowed items-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-300"
      >
        {children}
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      {children}
      {label}
    </Link>
  );
}

function ThematicReportCard({
  detail,
  href,
  label,
  status,
  value,
}: ThematicReport) {
  const tone = getThematicTone(status);

  return (
    <Link
      href={href}
      className="min-w-0 rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:border-slate-300 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-semibold text-slate-800">{label}</p>
        <span
          className={`mt-1 size-2 shrink-0 rounded-full ${tone.dot}`}
          aria-hidden="true"
        />
      </div>
      <p className={`mt-3 text-2xl font-semibold ${tone.text}`}>{value}</p>
      <p className="mt-2 min-h-10 text-sm leading-5 text-slate-500">{detail}</p>
    </Link>
  );
}

function getThematicTone(status: ThematicReport["status"]) {
  const tones = {
    critical: { dot: "bg-red-500", text: "text-red-700" },
    good: { dot: "bg-emerald-500", text: "text-emerald-700" },
    neutral: { dot: "bg-slate-400", text: "text-slate-700" },
    warning: { dot: "bg-amber-500", text: "text-amber-700" },
  };

  return tones[status];
}

function Metric({
  help,
  label,
  value,
}: {
  help: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function QueueCard({
  help,
  href,
  label,
  value,
}: {
  help: string;
  href: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:bg-white"
    >
      <p className="text-sm font-medium text-slate-500">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Link>
  );
}

function ReadinessItem({
  complete,
  label,
  value,
}: {
  complete: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <CheckCircle2
        className={`mt-0.5 size-4 ${
          complete ? "text-emerald-600" : "text-slate-300"
        }`}
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{value}</p>
      </div>
    </div>
  );
}

function StatusNotice({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="text-sm font-semibold">Crawl could not finish</p>
      <p className="mt-1 text-sm leading-6">{message}</p>
    </div>
  );
}

function artifactStatus(
  artifact: DomainWorkspace["artifacts"][number] | undefined,
): ThematicReport["status"] {
  if (!artifact) {
    return "neutral";
  }

  if (
    artifact.statusCode &&
    artifact.statusCode >= 200 &&
    artifact.statusCode < 400
  ) {
    return "good";
  }

  return artifact.statusCode ? "critical" : "warning";
}

function countIssuesByType(domain: DomainWorkspace, patterns: string[]) {
  return domain.issues.filter((issue) =>
    patterns.some((pattern) =>
      pattern.endsWith(":")
        ? issue.issueType.startsWith(pattern)
        : issue.issueType.includes(pattern),
    ),
  ).length;
}

function formatPercent(value: number | null) {
  return value === null ? "Pending" : `${value}%`;
}

function hasStructuredData(metadataJson: unknown) {
  if (!metadataJson || typeof metadataJson !== "object") {
    return false;
  }

  const metadata = metadataJson as Record<string, unknown>;
  const schemaCount = metadata.schemaCount;
  const schemaTypes = metadata.schemaTypes;
  const jsonLdCount = metadata.jsonLdCount;

  return (
    (typeof schemaCount === "number" && schemaCount > 0) ||
    (typeof jsonLdCount === "number" && jsonLdCount > 0) ||
    (Array.isArray(schemaTypes) && schemaTypes.length > 0)
  );
}

function issueStatus(count: number): ThematicReport["status"] {
  if (count === 0) {
    return "good";
  }

  return count >= 3 ? "critical" : "warning";
}

function percentage(part: number, total: number) {
  return Math.round((part / total) * 100);
}

function scoreStatus(value: number | null): ThematicReport["status"] {
  if (value === null) {
    return "neutral";
  }

  if (value >= 90) {
    return "good";
  }

  return value >= 70 ? "warning" : "critical";
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatIssueType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getDomainErrorMessage(error: string) {
  const messages: Record<string, string> = {
    "crawl-failed": "The crawler could not complete this site.",
    "crawl-invalid": "The crawl request was missing a valid domain.",
    "crawl-not-verified": "Verify the domain before starting a full crawl.",
    "crawl-page-limit":
      "This workspace has reached its page crawl limit for the current plan.",
    "crawl-plan-limit":
      "This crawl cadence is not available on the current workspace plan.",
    "domain-access": "You do not have access to that domain.",
  };

  return messages[error] ?? "Please try again or inspect the domain settings.";
}

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
import {
  formatProductProblemArea,
  formatProductWorkspaceProblemSeverity,
  formatProductReportTitle,
  getProductWorkspaceToolLabel,
  getProductReportTitle,
  PRODUCT_BEGINNER_COPY,
} from "@/lib/product-copy";
import {
  formatWebsiteClient,
  formatWebsiteHealth,
  formatWebsitePercent,
  formatWebsiteResponse,
} from "@/lib/website-display-labels";

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
    ? "Browser check used"
    : "Standard check";
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
  const visibleWorkspacePages = domain.pages.slice(0, 8);
  const hiddenWorkspacePages = Math.max(
    0,
    domain.pages.length - visibleWorkspacePages.length,
  );
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
    latestCrawlStatus: latestCrawl
      ? formatCheckStatus(latestCrawl.status)
      : "Not checked",
    latestReportHref: shareHref,
    latestReportStatus: latestReport
      ? formatReportStatus(latestReport.status)
      : "No report yet",
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
              Websites
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
                  {formatWebsiteClient(domain.client?.name)}
                </p>
                <h2 className="mt-2 break-words text-3xl font-semibold tracking-normal">
                  {domain.domain}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  A simple workspace for this website. Start with the next
                  helpful action, then open deeper page, report, and connection
                  details when you need them.
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
                      decorative
                      label="Check this website again and refresh pages, problems, health, and fix progress."
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
                    value={getProductReportTitle(domain.domain)}
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
                  label="Problems CSV"
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
              <ContextItem label="Website" value={domain.domain} />
              <ContextItem
                label="Client"
                value={formatWebsiteClient(domain.client?.name)}
              />
              <ContextItem
                label="Last updated"
                value={formatDate(lastUpdatedAt)}
              />
              <ContextItem
                label="Pages checked"
                value={`${latestCrawl?.pagesCrawled ?? 0} / ${domain.pages.length}`}
              />
              <ContextItem
                label="Platform"
                value={formatWebsitePlatform(domain.platform)}
              />
              <ContextItem label="Browser check" value={jsRenderingStatus} />
              <ContextItem
                label="Verification"
                value={
                  isVerified
                    ? "Ownership confirmed"
                    : formatOwnershipStatus(domain.verificationStatus)
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
                  Today&apos;s website plan
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-normal">
                  What needs attention now
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Health, search visibility, checked pages, and care work
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
                help={PRODUCT_BEGINNER_COPY.workspaceHealthDetail}
                href={`/issues?domainId=${domain.id}`}
                icon={ShieldCheck}
                label={PRODUCT_BEGINNER_COPY.workspaceHealthLabel}
                points={scorePoints}
                value={domain.healthScore ?? latestScore?.score ?? 0}
              />
              <AnalyticsMetricCard
                help={PRODUCT_BEGINNER_COPY.workspaceSearchVisibilityHelp}
                href={`/search-performance?domainId=${domain.id}`}
                icon={BarChart3}
                label="Search visibility"
                points={searchPoints}
                suffix="%"
                value={searchSummary.visibility}
              />
              <AnalyticsMetricCard
                help="Pages checked in the latest website check"
                href={`/pages?domainId=${domain.id}`}
                icon={ClipboardList}
                label="Page coverage"
                suffix="%"
                value={calculateCoverage(
                  latestCrawl?.pagesCrawled ?? 0,
                  domain.pages.length,
                )}
              />
              <AnalyticsMetricCard
                help={PRODUCT_BEGINNER_COPY.workspaceCareProblemsHelp}
                href={`/issues?domainId=${domain.id}`}
                icon={AlertTriangle}
                label={PRODUCT_BEGINNER_COPY.workspaceCareProblemsLabel}
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
                    label="Pages with problems"
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
              help={PRODUCT_BEGINNER_COPY.workspaceHealthDetail}
              label="Health score"
              value={formatWebsiteHealth(
                domain.healthScore ?? latestScore?.score,
              )}
            />
            <Metric
              help="Pages known for this website."
              label="Pages"
              value={domain.pages.length}
            />
            <Metric
              help={PRODUCT_BEGINNER_COPY.workspaceCareProblemsMetricHelp}
              label={PRODUCT_BEGINNER_COPY.workspaceCareProblemsMetricLabel}
              value={`${criticalIssues} / ${warningIssues}`}
            />
            <Metric
              help="Most recent website check state."
              label="Last check"
              value={
                latestCrawl
                  ? formatCheckStatus(latestCrawl.status)
                  : "Not started"
              }
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help={PRODUCT_BEGINNER_COPY.workspaceHealthHelp}>
                      Website Health
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {PRODUCT_BEGINNER_COPY.workspaceHealthDetail}
                  </p>
                </div>
                <Link
                  href={`/issues?domainId=${domain.id}`}
                  className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                >
                  View all problems
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
                <HelpLabel help="Breakdown of checked pages by response, problem load, redirects, and Google visibility.">
                  Pages checked
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
                  label="Have problems"
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
                label={PRODUCT_BEGINNER_COPY.workspaceQuickCareSignalLabel}
                tone="error"
                value={criticalIssues}
              />
              <SignalCard
                detail={`${auditOverview.topWarnings.length} planned-work categories`}
                label="Planned"
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
                    <HelpLabel help="A search-AI visibility score based on access-helper files and page-level visibility settings.">
                      AI Search Health
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    AI search and Google access.
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
                <HelpLabel help="Most common planned problems for this website.">
                  Top planned work
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
                    No planned-work categories in the current problem sample.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="Focused health areas for this website, mapped from setup files, checked pages, problems, and browser-check signals.">
                    Health areas
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Quick health cards for the website areas users usually check
                  first.
                </p>
              </div>
              <Link
                href={`/technical-audit?domainId=${domain.id}`}
                className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                View health details
              </Link>
            </div>
            <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-5">
              {thematicReports.map((report) => (
                <ThematicReportCard key={report.label} {...report} />
              ))}
            </div>
          </section>

          <details className="group mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="flex cursor-pointer list-none flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700">
                  More website detail
                </p>
                <h3 className="mt-1 text-xl font-semibold tracking-normal text-slate-950">
                  Open the deeper work queue when you need it
                </h3>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                  Problems, page previews, check history, reports, and search
                  metrics stay here, but they no longer make the main workspace
                  feel endless.
                </p>
              </div>
              <span className="inline-flex h-9 w-fit items-center justify-center rounded-md border border-orange-200 bg-orange-50 px-3 text-sm font-semibold text-orange-700 transition group-open:bg-orange-600 group-open:text-white">
                <span className="group-open:hidden">Show details</span>
                <span className="hidden group-open:inline">Hide details</span>
              </span>
            </summary>
            <div className="grid gap-6 border-t border-slate-200 p-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Website-scoped work queue so one client site can be managed without cross-website noise.">
                      Website work queue
                    </HelpLabel>
                  </h3>
                  <Link
                    href={`/issues?domainId=${domain.id}`}
                    className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                  >
                    View all problems
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <QueueCard
                    help="Open problems that should be reviewed or assigned."
                    href={`/issues?domainId=${domain.id}`}
                    label="Open problems"
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
                      <HelpLabel
                        help={PRODUCT_BEGINNER_COPY.workspaceSearchTitleHelp}
                      >
                        Search performance
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {PRODUCT_BEGINNER_COPY.workspaceSearchIntro}
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
                    help={PRODUCT_BEGINNER_COPY.workspaceSearchVisibilityHelp}
                    href={`/search-performance?domainId=${domain.id}`}
                    label="Visibility"
                    value={`${searchSummary.visibility}%`}
                  />
                  <QueueCard
                    help={PRODUCT_BEGINNER_COPY.workspaceSearchClicksHelp}
                    href={`/search-performance?domainId=${domain.id}`}
                    label="Clicks"
                    value={searchSummary.clicks.toLocaleString()}
                  />
                  <QueueCard
                    help={PRODUCT_BEGINNER_COPY.workspaceSearchImpressionsHelp}
                    href={`/search-performance?domainId=${domain.id}`}
                    label="Impressions"
                    value={searchSummary.impressions.toLocaleString()}
                  />
                  <QueueCard
                    help={PRODUCT_BEGINNER_COPY.workspaceSearchTermsHelp}
                    href={`/search-performance?domainId=${domain.id}`}
                    label={PRODUCT_BEGINNER_COPY.workspaceSearchLabel}
                    value={searchSummary.queries}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <HelpLabel
                        help={
                          PRODUCT_BEGINNER_COPY.workspaceCareProblemsSectionHelp
                        }
                      >
                        {PRODUCT_BEGINNER_COPY.workspaceCareProblemsSectionTitle}
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {PRODUCT_BEGINNER_COPY.workspaceCareProblemsSectionIntro}
                    </p>
                  </div>
                  <Link
                    href={`/fix-center?domainId=${domain.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Open fixes
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
                            {issue.page?.url ?? "Whole website problem"}
                          </p>
                        </div>
                        <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {formatProblemSeverity(issue.severity)}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      No active problems for this website.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <HelpLabel help="Recently checked pages for this website.">
                        Page inventory
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      A short preview of pages that need attention. Open the
                      full page view for filters and exports.
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
                    <>
                      {visibleWorkspacePages.map((page) => {
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
                              {page.issues.length} problems
                            </span>
                          </Link>
                        );
                      })}
                      {hiddenWorkspacePages > 0 ? (
                        <div className="flex flex-col gap-3 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
                          <span>
                            {hiddenWorkspacePages} more pages are kept in the
                            full page inventory.
                          </span>
                          <Link
                            href={`/pages?domainId=${domain.id}`}
                            className="inline-flex h-9 w-fit items-center justify-center rounded-md bg-orange-600 px-3 font-semibold text-white transition hover:bg-orange-700"
                          >
                            View all pages
                          </Link>
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      No pages checked yet.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <aside className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Readiness signals for this website.">
                    Website readiness
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  <ReadinessItem
                    complete={isVerified}
                    label="Website verified"
                    value={
                      isVerified ? "Ownership confirmed" : "Verify ownership"
                    }
                  />
                  <ReadinessItem
                    complete={domain.scriptStatus === "DETECTED"}
                    label="Monitoring script"
                    value={formatWebsiteTagStatus(domain.scriptStatus)}
                  />
                  <ReadinessItem
                    complete={wordpressReady}
                    label="Fix receiver"
                    value={
                      wordpressReady
                        ? "Connected"
                        : PRODUCT_BEGINNER_COPY.connectInConnections
                    }
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Latest website checks for this website only.">
                    Recent checks
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
                          {formatCheckStatus(crawl.status)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {crawl.pagesCrawled} checked / {crawl.pagesFailed}{" "}
                          need another look
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No checks yet.</p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Recent monitoring events from website checks, setup files, templates, and page changes.">
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
                          {formatChangeType(event.changeType)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {event.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No important changes found yet.
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
                        <p className="text-sm font-semibold">
                          {formatProductReportTitle(report.title)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatReportStatus(report.status)}
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
            </div>
          </details>
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
        ? `Checked ${formatDate(robotsArtifact.createdAt)}`
        : "Not checked yet",
      href: baseHref,
      label: "Access file",
      status: artifactStatus(robotsArtifact),
      value: robotsArtifact?.statusCode
        ? formatWebsiteResponse(robotsArtifact.statusCode)
        : "Not checked yet",
    },
    {
      detail: sitemapArtifact
        ? `Checked ${formatDate(sitemapArtifact.createdAt)}`
        : "Not checked yet",
      href: baseHref,
      label: "Page list",
      status: artifactStatus(sitemapArtifact),
      value: sitemapArtifact?.statusCode
        ? formatWebsiteResponse(sitemapArtifact.statusCode)
        : "Not checked yet",
    },
    {
      detail: `${healthyPages} pages ready for Google`,
      href: `/pages?domainId=${domain.id}`,
      label: "Google access",
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
        ? `${internalIssues} link problems`
        : "No link problems in current sample",
      href: `/technical-audit?domainId=${domain.id}`,
      label: getProductWorkspaceToolLabel("technical"),
      status: issueStatus(internalIssues),
      value: internalIssues ? String(internalIssues) : "Clear",
    },
    {
      detail: `${schemaPages} pages with Google details detected`,
      href: `/pages?domainId=${domain.id}`,
      label: "Google details",
      status: scoreStatus(markupScore),
      value: formatPercent(markupScore),
    },
    {
      detail: latestCrawl
        ? `${latestCrawl.pagesFailed} pages need another look`
        : "No website check yet",
      href: latestCrawl ? `/crawl-runs/${latestCrawl.id}` : baseHref,
      label: "Page response",
      status: scoreStatus(performanceScore),
      value: formatPercent(performanceScore),
    },
    {
      detail: noindexPages
        ? `${noindexPages} pages hidden from Google`
        : "No hidden pages in current sample",
      href: `/pages?domainId=${domain.id}`,
      label: "Google visibility",
      status: scoreStatus(indexabilityScore),
      value: formatPercent(indexabilityScore),
    },
    {
      detail: canonicalIssues
        ? `${canonicalIssues} preferred-page problems`
        : "No preferred-page problems in priority queue",
      href: `/issues?domainId=${domain.id}`,
      label: "Preferred pages",
      status: issueStatus(canonicalIssues),
      value: canonicalIssues ? String(canonicalIssues) : "Clear",
    },
    {
      detail: jsRenderingUsed
        ? "Browser check was used"
        : "Standard page check",
      href: baseHref,
      label: "Browser check",
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
      label: "Problems",
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
      label: getProductWorkspaceToolLabel("search"),
    },
    {
      active: false,
      href: `/technical-audit?domainId=${domainId}`,
      icon: Link2,
      label: getProductWorkspaceToolLabel("technical"),
    },
    {
      active: false,
      href: `/technical-audit?domainId=${domainId}`,
      icon: CalendarClock,
      label: "Updates",
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
      label: getProductWorkspaceToolLabel("integrations"),
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
        detail: "Confirm ownership so the portal can safely check the website and recommend fixes.",
        href: `/domains/${domainId}/verification`,
        label: "Do first",
        tone: "warning" as const,
        value: "Confirm ownership",
      }
    : criticalIssues > 0
      ? {
          detail: PRODUCT_BEGINNER_COPY.workspaceFocusQuickCareDetail,
          href: `/issues?domainId=${domainId}&severity=CRITICAL`,
          label: "Do first",
          tone: "critical" as const,
          value: `${criticalIssues} ${PRODUCT_BEGINNER_COPY.workspaceFocusQuickCareValueSuffix}`,
        }
      : warningIssues > 0
        ? {
            detail: PRODUCT_BEGINNER_COPY.workspaceFocusPlannedDetail,
            href: `/issues?domainId=${domainId}&severity=WARNING`,
            label: "Do first",
            tone: "warning" as const,
            value: `${warningIssues} ${PRODUCT_BEGINNER_COPY.workspaceFocusPlannedValueSuffix}`,
          }
        : {
            detail: "The website looks calm. Keep watching it and share a fresh update.",
            href: `/reports?domainId=${domainId}`,
            label: "Do first",
            tone: "good" as const,
            value: "Share progress",
          };

  return [
    firstAction,
    {
      detail: `${PRODUCT_BEGINNER_COPY.workspaceHealthFocusPrefix} ${healthScore}/100. Open the latest check for what changed.`,
      href: latestCrawlHref,
      label: "Check health",
      tone: healthScore >= 80 ? "good" : healthScore >= 60 ? "warning" : "critical",
      value: latestCrawlStatus,
    },
    {
      detail: "Use the report when you need a client-friendly summary.",
      href: latestReportHref,
      label: "Share update",
      tone: latestReportStatus === "Ready to share" ? "good" : "neutral",
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
          A shorter path through the website: fix what matters, check the last
          website update, then share progress.
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
      label: PRODUCT_BEGINNER_COPY.workspaceCommandQuickCareLabel,
    },
    {
      count: warningIssues,
      href: `/issues?domainId=${domainId}&severity=WARNING`,
      label: "Review planned work",
    },
    {
      count: approvedFixes,
      href: `/fix-center?domainId=${domainId}`,
      label: "Ship approved fixes",
    },
    {
      count: isVerified ? 1 : 0,
      href: `/domains/${domainId}/verification`,
      label: isVerified ? "Verification ready" : "Verify website",
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
        ? "Run another website check to compare score movement."
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
      <p className="text-sm font-semibold">Website check could not finish</p>
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
  return formatWebsitePercent(value);
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

function formatCheckStatus(value: string) {
  const labels: Record<string, string> = {
    CANCELLED: "Stopped",
    COMPLETED: "Finished",
    FAILED: "Needs another try",
    QUEUED: "Waiting to start",
    RUNNING: "Checking now",
  };

  return labels[value] ?? formatEnum(value);
}

function formatWebsitePlatform(value: string) {
  const labels: Record<string, string> = {
    CUSTOM: "Custom website",
    OTHER: "Other website",
    SHOPIFY: "Shopify store",
    UNKNOWN: "Not sure yet",
    WEBFLOW: "Webflow site",
    WORDPRESS: "WordPress site",
  };

  return labels[value] ?? formatEnum(value);
}

function formatOwnershipStatus(value: string) {
  const labels: Record<string, string> = {
    FAILED: "Needs another try",
    PENDING: "Waiting for setup",
    UNVERIFIED: "Needs setup",
    VERIFIED: "Ownership confirmed",
  };

  return labels[value] ?? formatEnum(value);
}

function formatWebsiteTagStatus(value: string) {
  const labels: Record<string, string> = {
    DETECTED: "Monitoring connected",
    ERROR: "Needs another try",
    MISSING: "Not installed yet",
    NOT_INSTALLED: "Not installed yet",
    PENDING: "Waiting to detect",
  };

  return labels[value] ?? formatEnum(value);
}

function formatReportStatus(value: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft update",
    FAILED: "Needs another try",
    GENERATING: "Being prepared",
    PUBLISHED: "Ready to share",
  };

  return labels[value] ?? formatEnum(value);
}

function formatChangeType(value: string) {
  const labels: Record<string, string> = {
    CANONICAL_CHANGED: "Preferred page changed",
    H1_CHANGED: "Main heading changed",
    META_DESCRIPTION_CHANGED: "Page description changed",
    NOINDEX_CHANGED: "Google visibility changed",
    ROBOTS_CHANGED: "Access file changed",
    SITEMAP_CHANGED: "Page list changed",
    STATUS_CHANGED: "Page response changed",
    TITLE_CHANGED: "Page title changed",
  };

  return labels[value] ?? formatEnum(value);
}

function formatProblemSeverity(value: string) {
  return formatProductWorkspaceProblemSeverity(value);
}

function formatIssueType(value: string) {
  return formatProductProblemArea(value);
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
    "crawl-failed": "The website check could not finish.",
    "crawl-invalid": "The check request was missing a valid website.",
    "crawl-not-verified": "Verify the website before starting a full check.",
    "crawl-page-limit":
      "This workspace has reached its page-check limit for the current plan.",
    "crawl-plan-limit":
      "This check rhythm is not available on the current workspace plan.",
    "domain-access": "You do not have access to that website.",
  };

  return messages[error] ?? "Please try again or inspect the website settings.";
}

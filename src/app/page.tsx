import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CircleDot,
  FileText,
  Play,
  Plus,
} from "lucide-react";
import Link from "next/link";
import {
  AnalyticsMetricCard,
  HorizontalBar,
} from "@/components/analytics-widgets";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import {
  mvpModules,
  type Issue,
  type Severity,
  type Site,
} from "@/lib/dashboard-data";
import { getDashboardData } from "@/lib/dashboard-queries";

const severityStyles: Record<Severity, string> = {
  critical: "border-red-200 bg-red-50 text-red-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  suggestion: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

const statusStyles = {
  complete: "border-emerald-200 bg-emerald-50 text-emerald-700",
  "ready to build": "border-emerald-200 bg-emerald-50 text-emerald-700",
  planned: "border-slate-200 bg-slate-100 text-slate-600",
  "in progress": "border-blue-200 bg-blue-50 text-blue-700",
};

export const dynamic = "force-dynamic";

export default async function Home() {
  const {
    agencyStats,
    issues,
    sites,
    isDatabaseConfigured,
    workspaceName,
    workspaceType,
  } = await getDashboardData();
  const isAgency = workspaceType === "AGENCY";
  const nextSteps = buildDashboardNextSteps({
    isDatabaseConfigured,
    issues,
    sites,
  });
  const priorityIssues = issues.slice(0, 5);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Overview" />

        <section id="main-content" className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-semibold text-orange-600">
                {isAgency ? "Agency workspace" : "SEO workspace"}
              </p>
              <h2 className="mt-2 max-w-4xl text-3xl font-semibold tracking-normal text-slate-950">
                {isAgency
                  ? `Here is what needs attention across ${workspaceName}`
                  : `Here is what needs attention for ${workspaceName}`}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Start with the plan below. The detailed charts are still here
                when you need them, but the next step stays at the top.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/domains"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
              >
                <Play className="size-4" aria-hidden="true" />
                Scan project
                <InfoTooltip
                  label="Go to Projects to manually scan a verified website."
                  passive
                  side="left"
                />
              </Link>
              <Link
                href="/domains/new"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add website
                <InfoTooltip
                  label="Add a new website to verify, scan, monitor, and report on."
                  passive
                  side="left"
                />
              </Link>
            </div>
          </header>

          <section className="mt-6 overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm">
            <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
              <div className="rounded-lg border border-orange-100 bg-orange-50 p-5">
                <p className="text-sm font-semibold text-orange-700">
                  Start here
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
                  Today&apos;s SEO plan
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Follow these in order. Each card takes you to one focused
                  screen, so you do not need to understand every SEO term first.
                </p>
                <div className="mt-5 grid gap-2 text-sm text-slate-700">
                  <span className="rounded-md bg-white/80 px-3 py-2">
                    Fix urgent problems before browsing reports.
                  </span>
                  <span className="rounded-md bg-white/80 px-3 py-2">
                    Use reports when you are ready to share progress.
                  </span>
                  <span className="rounded-md bg-white/80 px-3 py-2">
                    Open analytics only when you want deeper detail.
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                {nextSteps.map((step, index) => {
                  const Icon = step.icon;

                  return (
                    <Link
                      key={step.title}
                      href={step.href}
                      className="group grid gap-3 rounded-lg border border-slate-200 bg-white p-4 transition hover:border-orange-200 hover:bg-orange-50/40 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                    >
                      <span className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-sm font-semibold text-slate-700">
                        {index + 1}
                      </span>
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <Icon
                            className="size-4 text-orange-600"
                            aria-hidden="true"
                          />
                          <span className="font-semibold text-slate-950">
                            {step.title}
                          </span>
                          <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600">
                            {step.badge}
                          </span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-slate-600">
                          {step.detail}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 self-center text-sm font-semibold text-orange-700">
                        {step.action}
                        <ArrowRight
                          className="size-4 transition group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="mt-6">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-950">
                  Quick health snapshot
                </h3>
                <p className="text-sm text-slate-500">
                  A calm overview before the detailed charts.
                </p>
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {agencyStats.map((stat) => {
                const Icon = stat.icon;

                return (
                  <article
                    key={stat.label}
                    className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/30"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-slate-500">
                        <HelpLabel help={getStatHelp(stat.label)}>
                          {stat.label}
                        </HelpLabel>
                      </p>
                      <Icon
                        className="size-5 text-slate-400"
                        aria-hidden="true"
                      />
                    </div>
                    <p className="mt-4 text-3xl font-semibold tracking-normal">
                      {stat.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">{stat.detail}</p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-600">
                  Deeper analytics
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-normal">
                  Website health details
                </h3>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Use this when you want to compare projects, review search
                  visibility, or prepare a report after the top plan is handled.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-4">
                <QuickLink href="/domains" label="Projects" />
                <QuickLink href="/issues" label="Problems" />
                <QuickLink href="/search-performance" label="Search" />
                <QuickLink href="/reports" label="Reports" />
              </div>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <AnalyticsMetricCard
                href="/domains"
                icon={CheckCircle2}
                label="Healthy sites"
                points={sites.map((site) => ({ value: site.score }))}
                value={sites.filter((site) => site.score >= 80).length}
              />
              <AnalyticsMetricCard
                href="/issues?severity=CRITICAL"
                icon={AlertTriangle}
                label="Critical workload"
                value={sites.reduce((total, site) => total + site.critical, 0)}
              />
              <AnalyticsMetricCard
                href="/issues"
                icon={CircleDot}
                label="Warning load"
                value={sites.reduce((total, site) => total + site.warnings, 0)}
              />
              <AnalyticsMetricCard
                href="/reports"
                icon={FileText}
                label="Reports queue"
                value={
                  agencyStats.find((stat) => stat.label === "Reports due")
                    ?.value ?? "0"
                }
              />
            </div>

            <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div>
                <h4 className="text-sm font-semibold text-slate-600">
                  Site health distribution
                </h4>
                <div className="mt-4 grid gap-4">
                  <HorizontalBar
                    label="80+ healthy"
                    max={Math.max(1, sites.length)}
                    value={sites.filter((site) => site.score >= 80).length}
                  />
                  <HorizontalBar
                    label="60-79 needs attention"
                    max={Math.max(1, sites.length)}
                    value={
                      sites.filter((site) => site.score >= 60 && site.score < 80)
                        .length
                    }
                  />
                  <HorizontalBar
                    label="Below 60 high risk"
                    max={Math.max(1, sites.length)}
                    value={sites.filter((site) => site.score < 60).length}
                  />
                </div>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-600">
                  Helpful shortcuts
                </h4>
                <div className="mt-4 grid gap-2">
                  <QuickAction href="/domains/new" label="Add website" />
                  <QuickAction href="/domains" label="Scan project" />
                  <QuickAction href="/recommendations" label="Generate briefs" />
                  <QuickAction href="/rank-tracking" label="Track keywords" />
                </div>
              </div>
            </div>
          </section>

          {!isDatabaseConfigured ? (
            <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">
              <h3 className="font-semibold">PostgreSQL is not connected yet</h3>
              <p className="mt-1 text-sm leading-6">
                Add `DATABASE_URL`, run the Prisma migration, and seed the
                database to switch this dashboard from empty states to live MVP
                data.
              </p>
            </section>
          ) : null}

          <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Portfolio table showing verification, crawl status, pages, and issue volume across monitored domains.">
                      {isAgency ? "All client sites" : "Monitored sites"}
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Verification, scan status, and issue volume across your
                    active projects.
                  </p>
                </div>
                <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  <FileText className="size-4" aria-hidden="true" />
                  Export
                  <InfoTooltip
                    label="Prepare this table for client or internal reporting."
                    passive
                    side="left"
                  />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Client</th>
                      <th className="px-5 py-3 font-semibold">Domain</th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Latest site health score calculated from crawler and analyzer results.">
                          Score
                        </HelpLabel>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Number of URLs currently known for this monitored domain.">
                          Pages
                        </HelpLabel>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Critical issues first, warnings second. Use this to prioritize work.">
                          Issues
                        </HelpLabel>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Most recent crawler run state for this domain.">
                          Last crawl
                        </HelpLabel>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sites.length ? (
                      sites.map((site) => (
                        <tr key={site.domain} className="align-middle">
                          <td className="px-5 py-4 font-medium text-slate-950">
                            {site.client}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex flex-col">
                              <span className="font-medium">{site.domain}</span>
                              <span className="text-xs text-slate-500">
                                {site.platform}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {site.verification === "verified" ? (
                              <span className="font-semibold">
                                {site.score}
                              </span>
                            ) : (
                              <span className="text-slate-400">Pending</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {site.pages.toLocaleString()}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-medium text-red-600">
                              {site.critical}
                            </span>
                            <span className="text-slate-400"> / </span>
                            <span className="font-medium text-amber-600">
                              {site.warnings}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {site.lastCrawl}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          className="px-5 py-8 text-center text-slate-500"
                          colSpan={6}
                        >
                          No websites yet. Add your first website and we will
                          guide you through the setup.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="A quick view of completed SaaS capability areas from the source-of-truth plan.">
                      Production build map
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Completed product capabilities mapped to the source of
                    truth.
                  </p>
                </div>
                <CheckCircle2
                  className="size-5 text-emerald-500"
                  aria-hidden="true"
                />
              </div>

              <div className="mt-5 grid gap-3">
                {mvpModules.map((module) => {
                  const Icon = module.icon;

                  return (
                    <article
                      key={module.name}
                      className="rounded-md border border-slate-200 p-4"
                    >
                      <div className="flex items-start gap-3">
                        <Icon
                          className="mt-0.5 size-5 text-slate-500"
                          aria-hidden="true"
                        />
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h4 className="font-medium">{module.name}</h4>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-xs font-medium ${statusStyles[module.status]}`}
                            >
                              {module.status}
                            </span>
                          </div>
                          <p className="mt-1 text-sm leading-6 text-slate-500">
                            {module.description}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="The highest-impact SEO work across clients, ranked by severity and analyzer priority.">
                    Top problems to review
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  A short list of the most important work. Open all problems
                  when you want the full queue.
                </p>
              </div>
              <Link
                href="/issues"
                className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                <CircleDot className="size-4" aria-hidden="true" />
                Open all problems
                <InfoTooltip
                  label="Open the full Problems page with filters and all current SEO findings."
                  passive
                  side="left"
                />
              </Link>
            </div>

            <div className="grid divide-y divide-slate-100">
              {priorityIssues.length ? (
                priorityIssues.map((issue) => (
                  <article
                    key={`${issue.domain}-${issue.title}`}
                    className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_170px_130px_130px]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${severityStyles[issue.severity]}`}
                        >
                          {issue.severity}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {issue.pages} page{issue.pages === 1 ? "" : "s"}
                        </span>
                      </div>
                      <h4 className="mt-3 font-semibold">{issue.title}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {issue.client} - {issue.domain}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Owner
                      </p>
                      <p className="mt-2 text-sm font-medium">{issue.owner}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-400">
                        Status
                      </p>
                      <p className="mt-2 text-sm font-medium capitalize">
                        {issue.status}
                      </p>
                    </div>
                    <div className="flex items-center lg:justify-end">
                      <Link
                        href="/issues"
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800"
                      >
                        <AlertTriangle className="size-4" aria-hidden="true" />
                        Review
                      </Link>
                    </div>
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No open SEO issues yet. Run a crawl to generate the first
                  friendly action plan.
                </div>
              )}
            </div>
            {issues.length > priorityIssues.length ? (
              <div className="border-t border-slate-100 p-4 text-center">
                <Link
                  href="/issues"
                  className="text-sm font-semibold text-orange-700 transition hover:text-orange-800"
                >
                  Show all {issues.length.toLocaleString()} problems
                </Link>
              </div>
            ) : null}
          </section>
        </section>
      </div>
    </main>
  );
}

function getStatHelp(label: string) {
  const help: Record<string, string> = {
    "Avg. health":
      "Average SEO health across websites that have finished setup.",
    "Active clients":
      "Clients managed inside this workspace, useful for agency portfolio tracking.",
    "Clients":
      "Clients managed inside this workspace, useful for agency portfolio tracking.",
    "Critical issues":
      "Problems that can meaningfully hurt search visibility and should be fixed first.",
    "Verified domains":
      "Domains with ownership confirmed, eligible for full production crawls.",
    "Pages crawled":
      "Pages collected by the crawler and available for technical SEO analysis.",
    "Open issues":
      "Analyzer findings that still need review, assignment, or resolution.",
    "Reports due":
      "Reports that are ready for review or still need a clean client update.",
  };

  return (
    help[label] ?? "Key workspace metric used to understand SEO operations."
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-center text-sm font-semibold text-slate-700 transition [overflow-wrap:normal] hover:bg-white hover:text-slate-950"
    >
      {label}
    </Link>
  );
}

function QuickAction({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 p-3 text-sm font-semibold text-slate-700 transition hover:bg-white hover:text-slate-950"
    >
      {label}
      <ArrowRight className="size-4" aria-hidden="true" />
    </Link>
  );
}

function buildDashboardNextSteps({
  isDatabaseConfigured,
  issues,
  sites,
}: {
  isDatabaseConfigured: boolean;
  issues: Issue[];
  sites: Site[];
}) {
  if (!isDatabaseConfigured) {
    return [
      {
        action: "Connect database",
        badge: "Required",
        detail:
          "The app needs a database before it can show real websites, issues, and reports.",
        href: "/settings",
        icon: AlertTriangle,
        title: "Connect the product data",
      },
      {
        action: "Add project",
        badge: "Next",
        detail:
          "Once data is connected, add the first website you want to monitor.",
        href: "/domains/new",
        icon: Plus,
        title: "Add your first website",
      },
      {
        action: "Create report",
        badge: "Later",
        detail:
          "After the first crawl, turn the findings into a simple client-ready report.",
        href: "/reports",
        icon: FileText,
        title: "Share the results",
      },
    ];
  }

  if (!sites.length) {
    return [
      {
        action: "Add project",
        badge: "First step",
        detail:
          "Add the website you care about. We will guide you through verification and crawling after that.",
        href: "/domains/new",
        icon: Plus,
        title: "Add your first website",
      },
      {
        action: "View projects",
        badge: "Easy",
        detail:
          "Projects keep each website, crawl, issue, and report in one place.",
        href: "/domains",
        icon: CheckCircle2,
        title: "Keep work organized by project",
      },
      {
        action: "Open reports",
        badge: "Share",
        detail:
          "Reports are where finished SEO work becomes simple updates for clients or teammates.",
        href: "/reports",
        icon: FileText,
        title: "Prepare to share progress",
      },
    ];
  }

  const pendingVerification = sites.find(
    (site) => site.verification === "pending",
  );
  const criticalIssue = issues.find((issue) => issue.severity === "critical");
  const warningIssue = issues.find((issue) => issue.severity === "warning");

  return [
    pendingVerification
      ? {
          action: "Verify site",
          badge: "Needed",
          detail: `${pendingVerification.domain} needs verification before it can be fully monitored.`,
          href: "/domains",
          icon: AlertTriangle,
          title: "Finish website setup",
        }
      : {
          action: "Open projects",
          badge: "Healthy habit",
          detail:
            "Start with your project list to see which websites need attention today.",
          href: "/domains",
          icon: CheckCircle2,
          title: "Check website health",
        },
    criticalIssue
      ? {
          action: "Fix now",
          badge: "Important",
          detail: `${criticalIssue.domain} has a critical issue. Open the problem and follow the recommended solution.`,
          href: "/issues?severity=CRITICAL",
          icon: AlertTriangle,
          title: "Fix the most urgent problem",
        }
      : warningIssue
        ? {
            action: "Review",
            badge: "Recommended",
            detail: `${warningIssue.domain} has a warning worth reviewing before it becomes a bigger issue.`,
            href: "/issues?severity=WARNING",
            icon: CircleDot,
            title: "Review the next warning",
          }
        : {
            action: "Run crawl",
            badge: "Refresh",
            detail:
              "No urgent issues are showing. Refresh crawl data to keep monitoring current.",
            href: "/domains",
            icon: Play,
            title: "Refresh the latest scan",
          },
    {
      action: "Create report",
      badge: "Share",
      detail:
        "Turn the latest health, issues, and fixes into a simple report for someone else.",
      href: "/reports",
      icon: FileText,
      title: "Send a clear update",
    },
  ];
}

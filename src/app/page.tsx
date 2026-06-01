import {
  AlertTriangle,
  CheckCircle2,
  CircleDot,
  FileText,
  Play,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { mvpModules, type Severity } from "@/lib/dashboard-data";
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

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Overview" />

        <section id="main-content" className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {isAgency ? "Agency command center" : "Business command center"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
                {isAgency
                  ? `Continuous SEO monitoring across ${workspaceName}`
                  : `Continuous SEO monitoring for ${workspaceName}`}
              </h2>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/domains"
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Play className="size-4" aria-hidden="true" />
                Start crawl
                <InfoTooltip
                  label="Go to Sites to manually run a crawler pass for a verified domain."
                  passive
                  side="left"
                />
              </Link>
              <Link
                href="/domains/new"
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
              >
                <Plus className="size-4" aria-hidden="true" />
                Add domain
                <InfoTooltip
                  label="Add a new website to verify, crawl, monitor, and report on."
                  passive
                  side="left"
                />
              </Link>
            </div>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {agencyStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <article
                  key={stat.label}
                  className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
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
                    Verification, crawl status, and issue volume across the full
                    active site portfolio.
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
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
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
                          No domains found. Add and verify a domain to begin
                          monitoring.
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
                    Priority issues
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Cross-client issue queue for agency operators.
                </p>
              </div>
              <button className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                <CircleDot className="size-4" aria-hidden="true" />
                Assign selected
                <InfoTooltip
                  label="Bulk ownership action for selected issues once selection controls are active."
                  passive
                  side="left"
                />
              </button>
            </div>

            <div className="grid divide-y divide-slate-100">
              {issues.length ? (
                issues.map((issue) => (
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
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Owner
                      </p>
                      <p className="mt-2 text-sm font-medium">{issue.owner}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
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
                  audit.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function getStatHelp(label: string) {
  const help: Record<string, string> = {
    "Active clients":
      "Clients managed inside this workspace, useful for agency portfolio tracking.",
    "Verified domains":
      "Domains with ownership confirmed, eligible for full production crawls.",
    "Pages crawled":
      "Pages collected by the crawler and available for technical SEO analysis.",
    "Open issues":
      "Analyzer findings that still need review, assignment, or resolution.",
  };

  return (
    help[label] ?? "Key workspace metric used to understand SEO operations."
  );
}

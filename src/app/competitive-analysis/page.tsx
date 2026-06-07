import Link from "next/link";
import type React from "react";
import { BarChart3, Globe2, Trophy } from "lucide-react";
import { addCompetitorDomainAction } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { SavedViewsBar } from "@/components/saved-views-bar";
import { getCompetitiveAnalysisData } from "@/lib/product-seo-groups";
import type { SearchPerformanceGroup } from "@/lib/search-performance";

export const dynamic = "force-dynamic";

type CompetitiveAnalysisPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function CompetitiveAnalysisPage({
  searchParams,
}: CompetitiveAnalysisPageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedDomainId = getSingle(params.domainId);
  const country = getSingle(params.country);
  const device = getSingle(params.device);
  const startDate = getSingle(params.startDate);
  const endDate = getSingle(params.endDate);
  const data = await getCompetitiveAnalysisData({
    country,
    device,
    domainId: selectedDomainId,
    endDate,
    startDate,
  });
  const topDomain = data.domainRows.at(0);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Competitive Analysis" activeDomainId={selectedDomainId} />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {data.workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Competitive analysis
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Domain overview, organic search visibility, and top-page
                comparisons across your managed SEO projects.
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <Trophy className="size-4" aria-hidden="true" />
              {topDomain ? `${topDomain.domain} leads visibility` : "No search data yet"}
            </div>
          </header>

          <ProjectWorkspaceBar
            active="competitive"
            domainId={selectedDomainId}
            note="Competitive analysis uses imported Search Console, crawl, page, and issue data."
            returnPath="/competitive-analysis"
          />

          <SavedViewsBar
            filters={{
              country: country ?? "",
              device: device ?? "",
              domainId: selectedDomainId ?? "",
              endDate: endDate ?? "",
              startDate: startDate ?? "",
            }}
            route="/competitive-analysis"
          />

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              help="Impression-weighted organic visibility across compared projects."
              label="Visibility"
              suffix="%"
              value={data.summary.visibility}
            />
            <Metric
              help="Organic impressions imported from Google Search Console."
              label="Impressions"
              value={data.summary.impressions}
            />
            <Metric
              help="Crawled pages included in the compared project set."
              label="Pages"
              value={data.domainRows.reduce((total, row) => total + row.pageCount, 0)}
            />
            <Metric
              help="Open technical and content issues across compared projects."
              label="Open issues"
              value={data.domainRows.reduce((total, row) => total + row.issueCount, 0)}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">Add competitor</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Track external domains against a selected project.
                </p>
              </div>
              <form action={addCompetitorDomainAction} className="grid gap-4 p-5">
                <FilterLabel label="Project">
                  <select
                    name="domainId"
                    defaultValue={selectedDomainId ?? ""}
                    required
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">Choose project</option>
                    {data.domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.domain}
                      </option>
                    ))}
                  </select>
                </FilterLabel>
                <FilterLabel label="Competitor domain">
                  <input
                    name="competitorDomain"
                    placeholder="competitor.com"
                    required
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </FilterLabel>
                <FilterLabel label="Label">
                  <input
                    name="label"
                    placeholder="Direct competitor"
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </FilterLabel>
                <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                  Save competitor
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">External competitors</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Ranking visibility from tracked competitor observations.
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {data.competitorRows.length ? (
                  data.competitorRows.map((row) => (
                    <article
                      key={row.domain}
                      className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_120px_110px]"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{row.domain}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {row.label ?? row.bestKeyword ?? "Awaiting rank data"}
                        </p>
                      </div>
                      <Meta
                        label="Avg. position"
                        value={row.avgPosition?.toString() ?? "Pending"}
                      />
                      <Meta label="Top 10 wins" value={row.keywordWins.toString()} />
                    </article>
                  ))
                ) : (
                  <p className="p-8 text-center text-sm text-slate-500">
                    Add competitor domains, then record competitor ranks from
                    Rank Tracking.
                  </p>
                )}
              </div>
            </section>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Domain overview</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Compare owned domains by organic visibility, crawl depth, and
                  issue load.
                </p>
              </div>
              <form className="grid gap-3 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
                <FilterLabel label="Project">
                  <select
                    name="domainId"
                    defaultValue={selectedDomainId ?? ""}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">All projects</option>
                    {data.domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.domain}
                      </option>
                    ))}
                  </select>
                </FilterLabel>
                <FilterLabel label="From">
                  <input
                    name="startDate"
                    type="date"
                    defaultValue={formatInputDate(data.dateRange.start)}
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </FilterLabel>
                <FilterLabel label="To">
                  <input
                    name="endDate"
                    type="date"
                    defaultValue={formatInputDate(data.dateRange.end)}
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </FilterLabel>
                <FilterLabel label="Device">
                  <select
                    name="device"
                    defaultValue={device ?? ""}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">All</option>
                    {data.devices.map((item) => (
                      <option key={item} value={item}>
                        {formatEnum(item)}
                      </option>
                    ))}
                  </select>
                </FilterLabel>
                <div className="flex items-end">
                  <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Compare
                  </button>
                </div>
              </form>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Domain</th>
                    <th className="px-5 py-3 font-semibold">Visibility</th>
                    <th className="px-5 py-3 font-semibold">Clicks</th>
                    <th className="px-5 py-3 font-semibold">Impressions</th>
                    <th className="px-5 py-3 font-semibold">Avg. position</th>
                    <th className="px-5 py-3 font-semibold">Health</th>
                    <th className="px-5 py-3 font-semibold">Pages</th>
                    <th className="px-5 py-3 font-semibold">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.domainRows.length ? (
                    data.domainRows.map((row) => (
                      <tr key={row.id}>
                        <td className="px-5 py-4">
                          <Link
                            href={`/domains/${row.id}/workspace`}
                            className="font-semibold underline-offset-4 hover:underline"
                          >
                            {row.domain}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">
                            {row.clientName ?? "Unassigned"}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {row.visibility}%
                        </td>
                        <td className="px-5 py-4">{row.clicks.toLocaleString()}</td>
                        <td className="px-5 py-4">
                          {row.impressions.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          {row.avgPosition || "Pending"}
                        </td>
                        <td className="px-5 py-4">
                          {row.healthScore ?? "Pending"}
                        </td>
                        <td className="px-5 py-4">{row.pageCount}</td>
                        <td className="px-5 py-4">{row.issueCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="px-5 py-8 text-center text-slate-500" colSpan={8}>
                        No competitive project data yet. Add domains, run
                        crawls, and import Search Console metrics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <TopList
              items={data.topPages}
              label="Page"
              title="Top pages"
              type="page"
            />
            <TopList
              items={data.topQueries}
              label="Query"
              title="Organic Search Console"
              type="query"
            />
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({
  help,
  label,
  suffix = "",
  value,
}: {
  help: string;
  label: string;
  suffix?: string;
  value: number;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-2xl font-semibold">
        {value.toLocaleString()}
        {suffix}
      </p>
    </article>
  );
}

function TopList({
  items,
  label,
  title,
  type,
}: {
  items: SearchPerformanceGroup[];
  label: string;
  title: string;
  type: "page" | "query";
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 p-5">
        {type === "page" ? (
          <Globe2 className="size-5 text-blue-700" aria-hidden="true" />
        ) : (
          <BarChart3 className="size-5 text-blue-700" aria-hidden="true" />
        )}
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {items.length ? (
          items.slice(0, 8).map((item) => (
            <article
              key={item.key}
              className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_100px_120px]"
            >
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {label}
                </p>
                <p className="mt-1 line-clamp-2 font-semibold">{item.key}</p>
              </div>
              <Meta label="Clicks" value={item.clicks.toLocaleString()} />
              <Meta
                label="Impressions"
                value={item.impressions.toLocaleString()}
              />
            </article>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            No Search Console metrics match this view.
          </p>
        )}
      </div>
    </section>
  );
}

function FilterLabel({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </span>
      {children}
    </label>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatInputDate(value: Date) {
  return value.toISOString().slice(0, 10);
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

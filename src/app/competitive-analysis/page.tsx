import Link from "next/link";
import type React from "react";
import {
  ArrowUpRight,
  BarChart3,
  Eye,
  Globe2,
  Plus,
  Search,
  ShieldCheck,
  Trophy,
} from "lucide-react";
import { addCompetitorDomainAction } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { SavedViewsBar } from "@/components/saved-views-bar";
import {
  formatCompetitorHealth,
  formatCompetitorOwner,
  formatCompetitorPosition,
  formatCompetitorRankNote,
} from "@/lib/competitor-display-labels";
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
  const competitorPlan = buildCompetitorPlan({ data, selectedDomainId });
  const visibleCompetitors = data.competitorRows.slice(0, 6);
  const hiddenCompetitorCount = Math.max(
    data.competitorRows.length - visibleCompetitors.length,
    0,
  );
  const visibleDomainRows = data.domainRows.slice(0, 6);
  const hiddenDomainCount = Math.max(
    data.domainRows.length - visibleDomainRows.length,
    0,
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar
          active="Competitive Analysis"
          activeDomainId={selectedDomainId}
        />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {data.workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Competitor insights
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                See who is ahead, what they are winning, and the next small
                improvement to make on your own site.
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <Trophy className="size-4" aria-hidden="true" />
              {topDomain
                ? `${topDomain.domain} leads visibility`
                : "No search data yet"}
            </div>
          </header>

          <ProjectWorkspaceBar
            active="competitive"
            domainId={selectedDomainId}
            note="Competitor insights use search, page, and problem data already connected to this website."
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

          <section className="mt-6 overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm">
            <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="rounded-lg border border-orange-100 bg-orange-50 p-5">
                <p className="text-sm font-semibold text-orange-700">
                  Start here
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-normal">
                  Competitor action plan
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Compare only what helps the next decision: who is ahead, what
                  page or keyword is worth learning from, and what to improve
                  next on your own site.
                </p>
              </div>

              <div className="grid gap-3">
                {competitorPlan.map((step, index) => {
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
                          <span className={step.badgeClass}>{step.badge}</span>
                        </span>
                        <span className="mt-1 block text-sm leading-6 text-slate-600">
                          {step.detail}
                        </span>
                      </span>
                      <span className="flex items-center gap-2 self-center text-sm font-semibold text-orange-700">
                        {step.action}
                        <ArrowUpRight
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

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              help="A simple visibility estimate across the websites in this comparison."
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
              help="Checked pages included in the compared website set."
              label="Pages checked"
              value={data.domainRows.reduce(
                (total, row) => total + row.pageCount,
                0,
              )}
            />
            <Metric
              help="Open content and website problems across compared websites."
              label="Problems"
              value={data.domainRows.reduce(
                (total, row) => total + row.issueCount,
                0,
              )}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">Competitors to watch</h3>
                <p className="mt-1 text-sm text-slate-500">
                  A short list of competitors that are already showing up in
                  tracked rankings.
                </p>
              </div>
              <div className="divide-y divide-slate-100">
                {data.competitorRows.length ? (
                  visibleCompetitors.map((row) => (
                    <article
                      key={row.domain}
                      className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_120px_110px]"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold">{row.domain}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatCompetitorRankNote(
                            row.label ?? row.bestKeyword,
                          )}
                        </p>
                      </div>
                      <Meta
                        label="Avg. spot"
                        value={formatCompetitorPosition(row.avgPosition)}
                      />
                      <Meta
                        label="Top 10 wins"
                        value={row.keywordWins.toString()}
                      />
                    </article>
                  ))
                ) : (
                  <p className="p-8 text-center text-sm text-slate-500">
                    Add one competitor when you are ready to see who is ahead.
                  </p>
                )}
              </div>
              {hiddenCompetitorCount > 0 ? (
                <PreviewLimitNote
                  body={`${hiddenCompetitorCount} more competitors are hidden so this view stays easy to scan.`}
                />
              ) : null}
            </section>

            <details className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <summary className="cursor-pointer list-none border-b border-slate-100 p-5 marker:hidden">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">Add competitor</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Open this when you want to compare another website.
                    </p>
                  </div>
                  <span className="mt-2 text-sm font-semibold text-orange-700 sm:mt-0">
                    Show form
                  </span>
                </div>
              </summary>
              <form
                action={addCompetitorDomainAction}
                className="grid gap-4 p-5"
              >
                <FilterLabel label="Your website">
                  <select
                    name="domainId"
                    defaultValue={selectedDomainId ?? ""}
                    required
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">Choose website</option>
                    {data.domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.domain}
                      </option>
                    ))}
                  </select>
                </FilterLabel>
                <FilterLabel label="Competitor website">
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
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
                  <Plus className="size-4" aria-hidden="true" />
                  Save competitor
                </button>
              </form>
            </details>
          </section>

          <details className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="cursor-pointer list-none border-b border-slate-100 p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Adjust comparison</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Open this when you want to compare a specific website, date
                    range, or device.
                  </p>
                </div>
                <span className="mt-2 text-sm font-semibold text-orange-700 sm:mt-0">
                  Show options
                </span>
              </div>
            </summary>
            <form className="grid gap-3 p-5 md:grid-cols-[repeat(4,minmax(0,1fr))_auto]">
              <FilterLabel label="Website">
                <select
                  name="domainId"
                  defaultValue={selectedDomainId ?? ""}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">All websites</option>
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
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
                  <Search className="size-4" aria-hidden="true" />
                  Compare
                </button>
              </div>
            </form>
          </details>

          <details className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="cursor-pointer list-none border-b border-slate-100 p-5 marker:hidden">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    More comparison detail
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Optional website table for visibility, checked pages,
                    health, and problems.
                  </p>
                </div>
                <span className="mt-2 text-sm font-semibold text-orange-700 sm:mt-0">
                  Open details
                </span>
              </div>
            </summary>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Website</th>
                    <th className="px-5 py-3 font-semibold">Visibility</th>
                    <th className="px-5 py-3 font-semibold">Clicks</th>
                    <th className="px-5 py-3 font-semibold">Impressions</th>
                    <th className="px-5 py-3 font-semibold">Avg. spot</th>
                    <th className="px-5 py-3 font-semibold">Health</th>
                    <th className="px-5 py-3 font-semibold">Pages checked</th>
                    <th className="px-5 py-3 font-semibold">Problems</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.domainRows.length ? (
                    visibleDomainRows.map((row) => (
                      <tr key={row.id}>
                        <td className="px-5 py-4">
                          <Link
                            href={`/domains/${row.id}/workspace`}
                            className="font-semibold underline-offset-4 hover:underline"
                          >
                            {row.domain}
                          </Link>
                          <p className="mt-1 text-xs text-slate-500">
                            {formatCompetitorOwner(row.clientName)}
                          </p>
                        </td>
                        <td className="px-5 py-4 font-semibold">
                          {row.visibility}%
                        </td>
                        <td className="px-5 py-4">
                          {row.clicks.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          {row.impressions.toLocaleString()}
                        </td>
                        <td className="px-5 py-4">
                          {formatCompetitorPosition(row.avgPosition)}
                        </td>
                        <td className="px-5 py-4">
                          {formatCompetitorHealth(row.healthScore)}
                        </td>
                        <td className="px-5 py-4">{row.pageCount}</td>
                        <td className="px-5 py-4">{row.issueCount}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-slate-500"
                        colSpan={8}
                      >
                        No comparison data yet. Add your website, run a website
                        check, and connect Search Console metrics.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {hiddenDomainCount > 0 ? (
              <PreviewLimitNote
                body={`${hiddenDomainCount} more websites are available in the full Websites view when you need the complete comparison.`}
                href="/domains"
                label="Open websites"
              />
            ) : null}
          </details>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <TopList
              items={data.topPages}
              label="Page"
              title="Top pages"
              type="page"
            />
            <TopList
              items={data.topQueries}
              label="Search term"
              title="Top search terms"
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
      <p className="text-sm font-medium text-slate-500">
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
                <p className="text-sm font-medium text-slate-500">{label}</p>
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
      <span className="text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}

function PreviewLimitNote({
  body,
  href,
  label = "Keep going",
}: {
  body: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>{body}</p>
      {href ? (
        <Link
          href={href}
          className="inline-flex w-fit items-center justify-center rounded-md border border-orange-200 bg-orange-50 px-3 py-2 font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
        >
          {label}
        </Link>
      ) : null}
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

function buildCompetitorPlan({
  data,
  selectedDomainId,
}: {
  data: Awaited<ReturnType<typeof getCompetitiveAnalysisData>>;
  selectedDomainId?: string;
}) {
  const domainSuffix = selectedDomainId ? `?domainId=${selectedDomainId}` : "";
  const topOwnedDomain = data.domainRows[0];
  const competitorWinner = data.competitorRows[0];
  const topQuery = data.topQueries[0];

  if (!data.domainRows.length) {
    return [
      {
        action: "Add website",
        badge: "Setup",
        badgeClass:
          "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700",
        detail:
          "Add and check at least one website so competitor comparisons have a real baseline.",
        href: "/domains/new",
        icon: Plus,
        title: "Start with your website",
      },
      {
        action: "Connect data",
        badge: "Next",
        badgeClass:
          "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600",
        detail:
          "Connect Search Console so visibility, clicks, and impressions can power fair comparisons.",
        href: "/integrations",
        icon: Search,
        title: "Import search data",
      },
    ];
  }

  return [
    {
      action: "Open website",
      badge: "Leader",
      badgeClass:
        "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700",
      detail: topOwnedDomain
        ? `${topOwnedDomain.domain} has the strongest visibility in this view. Keep its best pages fresh.`
        : "Use your strongest website as the reference point before changing lower-performing sites.",
      href: topOwnedDomain
        ? `/domains/${topOwnedDomain.id}/workspace`
        : `/domains${domainSuffix}`,
      icon: ShieldCheck,
      title: "Protect your strongest website",
    },
    {
      action: "Review terms",
      badge: competitorWinner ? "Competitor" : "Add competitor",
      badgeClass: competitorWinner
        ? "rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700"
        : "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700",
      detail: competitorWinner
        ? `${competitorWinner.domain} is visible in tracked rankings. Check which terms they win, then improve your matching pages.`
        : "Add one competitor website so the portal can show where they are ahead.",
      href: `/rank-tracking${domainSuffix}`,
      icon: Eye,
      title: "See who is ahead",
    },
    {
      action: "Find keywords",
      badge: "Opportunity",
      badgeClass:
        "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600",
      detail: topQuery
        ? `"${topQuery.key}" is one of the strongest organic queries in this comparison. Use it to plan the next content improvement.`
        : "Review keyword opportunities once search data is imported.",
      href: `/keyword-research${domainSuffix}`,
      icon: BarChart3,
      title: "Choose the next search win",
    },
  ];
}

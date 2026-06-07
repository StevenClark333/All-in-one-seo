import Link from "next/link";
import type React from "react";
import { Lightbulb, Search, Target } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { HorizontalBar } from "@/components/analytics-widgets";
import { HelpLabel } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { SavedViewsBar } from "@/components/saved-views-bar";
import {
  getKeywordResearchData,
  type KeywordContentGap,
  type KeywordOpportunity,
} from "@/lib/product-seo-groups";
import type { SearchPerformanceGroup } from "@/lib/search-performance";

export const dynamic = "force-dynamic";

type KeywordResearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function KeywordResearchPage({
  searchParams,
}: KeywordResearchPageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedDomainId = getSingle(params.domainId);
  const query = getSingle(params.query);
  const country = getSingle(params.country);
  const device = getSingle(params.device);
  const startDate = getSingle(params.startDate);
  const endDate = getSingle(params.endDate);
  const data = await getKeywordResearchData({
    country,
    device,
    domainId: selectedDomainId,
    endDate,
    query,
    startDate,
  });
  const maxIntentImpressions = Math.max(
    1,
    ...data.intentGroups.map((item) => item.impressions),
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Keyword Research" activeDomainId={selectedDomainId} />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {data.workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Keyword research
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Search Console queries, keyword opportunities, and content gaps
                prioritized from real impressions, clicks, and position.
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <Target className="size-4" aria-hidden="true" />
              {data.opportunities.length} opportunities
            </div>
          </header>

          <ProjectWorkspaceBar
            active="keywords"
            domainId={selectedDomainId}
            note="Keyword research uses imported Google Search Console query data."
            returnPath="/keyword-research"
          />

          <SavedViewsBar
            filters={{
              country: country ?? "",
              device: device ?? "",
              domainId: selectedDomainId ?? "",
              endDate: endDate ?? "",
              query: query ?? "",
              startDate: startDate ?? "",
            }}
            route="/keyword-research"
          />

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              help="Unique query groups with imported Search Console metrics."
              label="Queries"
              value={data.topQueries.length}
            />
            <Metric
              help="Demand-weighted keyword opportunities detected from current and declining queries."
              label="Opportunities"
              value={data.opportunities.length}
            />
            <Metric
              help="Queries with impressions but weak clicks or rankings."
              label="Content gaps"
              value={data.contentGaps.length}
            />
            <Metric
              help="Organic visibility for the selected keyword set."
              label="Visibility"
              suffix="%"
              value={data.summary.visibility}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Demand cockpit</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Fast read on where query demand is concentrated.
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-600">
                  {data.summary.impressions.toLocaleString()} impressions
                </span>
              </div>
              <div className="mt-5 grid gap-4">
                {data.intentGroups.length ? (
                  data.intentGroups.slice(0, 6).map((item) => (
                    <HorizontalBar
                      key={item.intent}
                      label={`${formatIntent(item.intent)} intent`}
                      max={maxIntentImpressions}
                      value={item.impressions}
                    />
                  ))
                ) : (
                  <p className="rounded-md bg-slate-50 p-5 text-sm text-slate-500">
                    Import Search Console query data to populate intent demand.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Workflow queue</h3>
              <div className="mt-5 grid gap-3">
                <QueueRow label="Briefs to create" value={data.contentGaps.length} />
                <QueueRow
                  label="Competitor gaps"
                  value={data.competitorContentGaps.length}
                />
                <QueueRow
                  label="High-score opportunities"
                  value={
                    data.opportunities.filter(
                      (item) => item.opportunityScore >= 60,
                    ).length
                  }
                />
              </div>
            </section>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Search Console queries</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Filter by project, query, market, device, and reporting range.
                </p>
              </div>
              <form className="grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,230px)_repeat(5,minmax(0,1fr))_auto]">
                <FilterLabel label="Project">
                  <select
                    name="domainId"
                    defaultValue={selectedDomainId ?? ""}
                    className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">All projects</option>
                    {data.domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.domain}
                      </option>
                    ))}
                  </select>
                </FilterLabel>
                <FilterLabel label="Query">
                  <input
                    name="query"
                    defaultValue={query ?? ""}
                    placeholder="topic, product, brand"
                    className="h-10 min-w-0 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </FilterLabel>
                <FilterLabel label="From">
                  <input
                    name="startDate"
                    type="date"
                    defaultValue={formatInputDate(data.dateRange.start)}
                    className="h-10 min-w-0 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </FilterLabel>
                <FilterLabel label="To">
                  <input
                    name="endDate"
                    type="date"
                    defaultValue={formatInputDate(data.dateRange.end)}
                    className="h-10 min-w-0 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </FilterLabel>
                <FilterLabel label="Country">
                  <select
                    name="country"
                    defaultValue={country ?? ""}
                    className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">All</option>
                    {data.countries.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </FilterLabel>
                <FilterLabel label="Device">
                  <select
                    name="device"
                    defaultValue={device ?? ""}
                    className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
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
                  <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <Search className="size-4" aria-hidden="true" />
                    Apply
                  </button>
                </div>
              </form>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <OpportunityList items={data.opportunities} />
            <IntentPanel items={data.intentGroups} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <CompetitorGapList items={data.competitorContentGaps} />
            <ContentGapList items={data.contentGaps} />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <QueryTable items={data.topQueries} />
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

function OpportunityList({ items }: { items: KeywordOpportunity[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 p-5">
        <Lightbulb className="size-5 text-amber-600" aria-hidden="true" />
        <h3 className="text-lg font-semibold">Keyword opportunities</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {items.length ? (
          items.map((item) => (
            <article
              key={item.key}
              className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_130px_120px]"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold">{item.key}</p>
                <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
                <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  {formatIntent(item.intent)}
                </p>
              </div>
              <Meta label="Score" value={item.opportunityScore.toString()} />
              <Meta
                label="Position"
                value={item.avgPosition ? item.avgPosition.toString() : "Pending"}
              />
            </article>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            No keyword opportunities are available for this filter set.
          </p>
        )}
      </div>
    </section>
  );
}

function IntentPanel({
  items,
}: {
  items: Array<{
    clicks: number;
    impressions: number;
    intent: string;
    queries: number;
  }>;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold">Intent groups</h3>
        <p className="mt-1 text-sm text-slate-500">
          Query demand grouped by likely search intent.
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {items.length ? (
          items.map((item) => (
            <article
              key={item.intent}
              className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_90px_120px]"
            >
              <div>
                <p className="font-semibold">{formatIntent(item.intent)}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.queries} query groups
                </p>
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
            No query intents to group yet.
          </p>
        )}
      </div>
    </section>
  );
}

function ContentGapList({ items }: { items: KeywordContentGap[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold">Content gap</h3>
        <p className="mt-1 text-sm text-slate-500">
          Queries with demand that need better pages, titles, snippets, or links.
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {items.length ? (
          items.map((item) => (
            <article key={item.key} className="grid gap-4 p-5">
              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold">{item.key}</p>
                <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span>{item.impressions.toLocaleString()} impressions</span>
                <span>{formatCtr(item.ctr)} CTR</span>
                <span>Position {item.avgPosition || "Pending"}</span>
                <Link
                  href={item.actionHref}
                  className="font-semibold underline-offset-4 hover:underline"
                >
                  Create brief
                </Link>
              </div>
            </article>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            No content gaps match this range.
          </p>
        )}
      </div>
    </section>
  );
}

function CompetitorGapList({
  items,
}: {
  items: Awaited<ReturnType<typeof getKeywordResearchData>>["competitorContentGaps"];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold">Competitor content gap</h3>
        <p className="mt-1 text-sm text-slate-500">
          Tracked keywords where a competitor ranks and this project trails or
          has no owned position.
        </p>
      </div>
      <div className="divide-y divide-slate-100">
        {items.length ? (
          items.map((item) => (
            <article
              key={`${item.keyword}:${item.competitorDomain}`}
              className="grid gap-4 p-5"
            >
              <div className="min-w-0">
                <p className="line-clamp-2 font-semibold">{item.keyword}</p>
                <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
              </div>
              <div className="flex flex-wrap gap-3 text-sm">
                <span>{item.competitorDomain}</span>
                <span>Competitor #{item.competitorPosition}</span>
                <span>Owned {item.ownedPosition ?? "not ranking"}</span>
                <span>{item.volume?.toLocaleString() ?? "Unknown"} volume</span>
              </div>
            </article>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            Add competitors and competitor rank observations in Rank Tracking to
            reveal competitor gaps.
          </p>
        )}
      </div>
    </section>
  );
}

function QueryTable({ items }: { items: SearchPerformanceGroup[] }) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold">Top query inventory</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Query</th>
              <th className="px-5 py-3 font-semibold">Clicks</th>
              <th className="px-5 py-3 font-semibold">Impressions</th>
              <th className="px-5 py-3 font-semibold">CTR</th>
              <th className="px-5 py-3 font-semibold">Position</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length ? (
              items.map((item) => (
                <tr key={item.key}>
                  <td className="max-w-sm px-5 py-4">
                    <span className="line-clamp-2 font-medium">
                      {item.key}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {item.clicks.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    {item.impressions.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">{formatCtr(item.ctr)}</td>
                  <td className="px-5 py-4">
                    {item.avgPosition || "Pending"}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="px-5 py-8 text-center text-slate-500" colSpan={5}>
                  No Search Console queries match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
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

function QueueRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-4 py-3">
      <span className="text-sm font-medium text-slate-600">{label}</span>
      <span className="text-lg font-semibold">{value.toLocaleString()}</span>
    </div>
  );
}

function formatCtr(value: number) {
  return `${(value * 100).toFixed(1)}%`;
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

function formatIntent(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

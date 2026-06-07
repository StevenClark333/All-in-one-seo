import Link from "next/link";
import type React from "react";
import { ArrowDown, ArrowUp, BarChart3, Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { SavedViewsBar } from "@/components/saved-views-bar";
import {
  getSearchPerformanceData,
  type SearchPerformanceGroup,
} from "@/lib/search-performance";

export const dynamic = "force-dynamic";

type SearchPerformancePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPerformancePage({
  searchParams,
}: SearchPerformancePageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedDomainId = getSingle(params.domainId);
  const query = getSingle(params.query);
  const page = getSingle(params.page);
  const country = getSingle(params.country);
  const device = getSingle(params.device);
  const startDate = getSingle(params.startDate);
  const endDate = getSingle(params.endDate);
  const data = await getSearchPerformanceData({
    country,
    device,
    domainId: selectedDomainId,
    endDate,
    page,
    query,
    startDate,
  });
  const selectedDomain = data.selectedDomain;
  const visibilityDelta =
    data.summary.visibility - data.previousSummary.visibility;
  const clickDelta = data.summary.clicks - data.previousSummary.clicks;
  const impressionDelta =
    data.summary.impressions - data.previousSummary.impressions;
  const positionDelta =
    data.previousSummary.avgPosition && data.summary.avgPosition
      ? data.previousSummary.avgPosition - data.summary.avgPosition
      : 0;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar
          active="Search Performance"
          activeDomainId={selectedDomainId}
        />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {data.workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Search performance
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Google Search Console visibility, queries, pages, and movement
                for imported organic search data.
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <BarChart3 className="size-4" aria-hidden="true" />
              {data.latestImportedAt
                ? `Imported ${formatDate(data.latestImportedAt)}`
                : "No import yet"}
            </div>
          </header>

          <ProjectWorkspaceBar
            active="search"
            domainId={selectedDomainId}
            note="Search Console queries, pages, visibility, and movement are filtered to this domain."
            returnPath="/search-performance"
          />

          <SavedViewsBar
            filters={{
              country: country ?? "",
              device: device ?? "",
              domainId: selectedDomainId ?? "",
              endDate: endDate ?? "",
              page: page ?? "",
              query: query ?? "",
              startDate: startDate ?? "",
            }}
            route="/search-performance"
          />

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              delta={visibilityDelta}
              help="Impression-weighted visibility derived from Search Console average position."
              label="Visibility"
              suffix="%"
              value={data.summary.visibility}
            />
            <Metric
              delta={clickDelta}
              help="Organic clicks imported from Google Search Console."
              label="Clicks"
              value={data.summary.clicks}
            />
            <Metric
              delta={impressionDelta}
              help="Organic search impressions imported from Google Search Console."
              label="Impressions"
              value={data.summary.impressions}
            />
            <Metric
              delta={positionDelta}
              help="Impression-weighted average search result position. Positive movement means the average position improved."
              label="Avg. position"
              value={data.summary.avgPosition || "Pending"}
            />
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Filters</h3>
              <p className="mt-1 text-sm text-slate-500">
                {selectedDomain
                  ? `Focused on ${selectedDomain.domain}.`
                  : "Use a project, date range, query, page, country, or device to narrow imported GSC rows."}
              </p>
            </div>
            <form className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,260px)_repeat(6,minmax(0,1fr))_auto]">
              <FilterLabel label="Project">
                <select
                  name="domainId"
                  defaultValue={selectedDomainId ?? ""}
                  className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">All projects</option>
                  {data.domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {formatDomainOption(domain)}
                    </option>
                  ))}
                </select>
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
              <FilterLabel label="Query">
                <input
                  name="query"
                  defaultValue={query ?? ""}
                  placeholder="brand, topic"
                  className="h-10 min-w-0 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </FilterLabel>
              <FilterLabel label="Page">
                <input
                  name="page"
                  defaultValue={page ?? ""}
                  placeholder="/pricing"
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
              <div className="flex items-end gap-2">
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                  <Search className="size-4" aria-hidden="true" />
                  Apply
                </button>
              </div>
            </form>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <MovementPanel
              empty="No improving queries in the selected range."
              items={data.improvedQueries}
              title="Improved queries"
              tone="up"
            />
            <MovementPanel
              empty="No declining queries in the selected range."
              items={data.declinedQueries}
              title="Declined queries"
              tone="down"
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <RankingTable
              items={data.topQueries}
              label="Query"
              title="Top queries"
            />
            <RankingTable items={data.topPages} label="Page" title="Top pages" />
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({
  delta,
  help,
  label,
  suffix = "",
  value,
}: {
  delta: number;
  help: string;
  label: string;
  suffix?: string;
  value: React.ReactNode;
}) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-2xl font-semibold">
        {typeof value === "number" ? value.toLocaleString() : value}
        {suffix}
      </p>
      <p
        className={`mt-2 text-sm font-medium ${
          delta >= 0 ? "text-emerald-700" : "text-red-700"
        }`}
      >
        {delta >= 0 ? "+" : ""}
        {Number.isInteger(delta) ? delta.toLocaleString() : delta.toFixed(1)}{" "}
        vs previous period
      </p>
    </article>
  );
}

function MovementPanel({
  empty,
  items,
  title,
  tone,
}: {
  empty: string;
  items: SearchPerformanceGroup[];
  title: string;
  tone: "down" | "up";
}) {
  const Icon = tone === "up" ? ArrowUp : ArrowDown;
  const toneClass = tone === "up" ? "text-emerald-700" : "text-red-700";

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 p-5">
        <Icon className={`size-5 ${toneClass}`} aria-hidden="true" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid divide-y divide-slate-100">
        {items.length ? (
          items.map((item) => (
            <article
              key={item.key}
              className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_120px_110px]"
            >
              <div className="min-w-0">
                <p className="truncate font-semibold">{item.key}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.impressions.toLocaleString()} impressions
                </p>
              </div>
              <Meta label="Clicks" value={item.clicks.toLocaleString()} />
              <Meta
                label="Position"
                value={`${item.avgPosition} (${formatMovement(
                  item.positionChange,
                )})`}
              />
            </article>
          ))
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">{empty}</div>
        )}
      </div>
    </section>
  );
}

function RankingTable({
  items,
  label,
  title,
}: {
  items: SearchPerformanceGroup[];
  label: string;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">{label}</th>
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
                  No Search Console metrics match these filters. Import GSC
                  metrics from{" "}
                  <Link
                    href="/integrations"
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    Integrations
                  </Link>
                  .
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

function formatCtr(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
}

function formatDomainOption(domain: {
  client: { name: string } | null;
  domain: string;
}) {
  return `${domain.client?.name ? `${domain.client.name} - ` : ""}${
    domain.domain
  }`;
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

function formatMovement(value: number | null) {
  if (value === null) {
    return "new";
  }

  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}`;
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

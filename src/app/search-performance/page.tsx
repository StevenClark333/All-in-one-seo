import Link from "next/link";
import type React from "react";
import {
  ArrowDown,
  ArrowUp,
  BarChart3,
  MousePointerClick,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
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
  const growthSteps = buildSearchGrowthSteps({
    data,
    selectedDomainId,
  });

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
                Google search growth
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                See what people searched, which pages earned clicks, and what
                needs a little care before the next Google update.
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
            note="Google search terms, pages, and movement are filtered to this website."
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

          <section className="mt-6 overflow-hidden rounded-lg border border-orange-100 bg-white shadow-sm">
            <div className="grid gap-5 p-5 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
              <div className="rounded-lg border border-orange-100 bg-orange-50 p-5">
                <p className="text-sm font-semibold text-orange-700">
                  Start here
                </p>
                <h3 className="mt-2 text-2xl font-semibold tracking-normal">
                  Search growth plan
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-700">
                  Start with the easiest next move: protect the searches that
                  already work, fix what slipped, and turn more Google views
                  into visits.
                </p>
              </div>

              <div className="grid gap-3">
                {growthSteps.map((step, index) => {
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
                        <ArrowUp
                          className="size-4 rotate-45 transition group-hover:translate-x-0.5"
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
              delta={visibilityDelta}
              help="A simple score for how visible this website is in Google search results."
              label="Search visibility"
              suffix="%"
              value={data.summary.visibility}
            />
            <Metric
              delta={clickDelta}
              help="Visits from Google search results."
              label="Visits from Google"
              value={data.summary.clicks}
            />
            <Metric
              delta={impressionDelta}
              help="How often people saw this website in Google results."
              label="Times seen"
              value={data.summary.impressions}
            />
            <Metric
              delta={positionDelta}
              help="The average Google result spot. Positive movement means the website moved closer to the top."
              label="Average spot"
              value={data.summary.avgPosition || "Pending"}
            />
          </section>

          <details className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="cursor-pointer list-none border-b border-slate-100 p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Narrow the view</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {selectedDomain
                      ? `Focused on ${selectedDomain.domain}.`
                      : "Open this only when you want a specific website, date, search term, country, or device."}
                  </p>
                </div>
                <span className="mt-2 text-sm font-semibold text-orange-700 sm:mt-0">
                  Show filters
                </span>
              </div>
            </summary>
            <form className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,260px)_repeat(6,minmax(0,1fr))_auto]">
              <FilterLabel label="Website">
                <select
                  name="domainId"
                  defaultValue={selectedDomainId ?? ""}
                  className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">All websites</option>
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
              <FilterLabel label="Search term">
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
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
                  <Search className="size-4" aria-hidden="true" />
                  Apply
                </button>
              </div>
            </form>
          </details>

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <MovementPanel
              empty="No search terms moved up in the selected range."
              items={data.improvedQueries}
              title="Search terms moving up"
              tone="up"
            />
            <MovementPanel
              empty="No search terms slipped in the selected range."
              items={data.declinedQueries}
              title="Search terms slipping"
              tone="down"
            />
          </section>

          <details className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="cursor-pointer list-none border-b border-slate-100 p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">More search data</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Open the full search-term and page tables when you want to
                    compare the deeper numbers.
                  </p>
                </div>
                <span className="mt-2 text-sm font-semibold text-orange-700 sm:mt-0">
                  Show tables
                </span>
              </div>
            </summary>
            <div className="grid gap-6 p-5 xl:grid-cols-2">
              <RankingTable
                items={data.topQueries}
                label="Search term"
                title="Top search terms"
              />
              <RankingTable
                items={data.topPages}
                label="Page"
                title="Top pages"
              />
            </div>
          </details>
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
      <p className="text-sm font-medium text-slate-500">
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
        {Number.isInteger(delta) ? delta.toLocaleString() : delta.toFixed(1)} vs
        previous period
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
  const visibleItems = items.slice(0, 5);
  const hiddenItems = items.slice(5);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 p-5">
        <Icon className={`size-5 ${toneClass}`} aria-hidden="true" />
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="grid divide-y divide-slate-100">
        {visibleItems.length ? (
          <>
            {visibleItems.map((item) => (
              <SearchMovementRow key={item.key} item={item} />
            ))}
            {hiddenItems.length ? (
              <details className="px-5 py-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700 marker:text-slate-400">
                  More {tone === "up" ? "rising" : "slipping"} search terms (
                  {hiddenItems.length})
                </summary>
                <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-100">
                  {hiddenItems.map((item) => (
                    <SearchMovementRow key={item.key} item={item} />
                  ))}
                </div>
              </details>
            ) : null}
          </>
        ) : (
          <div className="p-8 text-center text-sm text-slate-500">{empty}</div>
        )}
      </div>
    </section>
  );
}

function SearchMovementRow({ item }: { item: SearchPerformanceGroup }) {
  return (
    <article className="grid gap-3 p-5 sm:grid-cols-[minmax(0,1fr)_120px_110px]">
      <div className="min-w-0">
        <p className="truncate font-semibold">{item.key}</p>
        <p className="mt-1 text-sm text-slate-500">
          {item.impressions.toLocaleString()} times seen
        </p>
      </div>
      <Meta label="Visits" value={item.clicks.toLocaleString()} />
      <Meta
        label="Spot"
        value={`${item.avgPosition || "Pending"} (${formatMovement(
          item.positionChange,
        )})`}
      />
    </article>
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
  const visibleItems = items.slice(0, 8);
  const hiddenCount = Math.max(items.length - visibleItems.length, 0);

  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">{label}</th>
              <th className="px-5 py-3 font-semibold">Visits</th>
              <th className="px-5 py-3 font-semibold">Times seen</th>
              <th className="px-5 py-3 font-semibold">CTR</th>
              <th className="px-5 py-3 font-semibold">Spot</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {visibleItems.length ? (
              <>
                {visibleItems.map((item) => (
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
                ))}
                {hiddenCount ? (
                  <tr>
                    <td
                      className="px-5 py-4 text-sm text-slate-500"
                      colSpan={5}
                    >
                      {hiddenCount} more rows are available through filters or
                      saved reporting.
                    </td>
                  </tr>
                ) : null}
              </>
            ) : (
              <tr>
                <td
                  className="px-5 py-8 text-center text-slate-500"
                  colSpan={5}
                >
                  No Google search data matches this view. Connect Google from{" "}
                  <Link
                    href="/integrations"
                    className="font-semibold underline-offset-4 hover:underline"
                  >
                    Connections
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

function buildSearchGrowthSteps({
  data,
  selectedDomainId,
}: {
  data: Awaited<ReturnType<typeof getSearchPerformanceData>>;
  selectedDomainId?: string;
}) {
  const querySuffix = selectedDomainId ? `?domainId=${selectedDomainId}` : "";
  const topQuery = data.topQueries[0];
  const declinedQuery = data.declinedQueries[0];
  const improvedQuery = data.improvedQueries[0];
  const topPage = data.topPages[0];

  if (!data.latestImportedAt) {
    return [
      {
        action: "Connect data",
        badge: "Setup",
        badgeClass:
          "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700",
        detail:
          "Connect Google Search Console so this page can show clicks, impressions, rankings, and easy growth opportunities.",
        href: "/integrations",
        icon: Search,
        title: "Import search data",
      },
      {
        action: "Add keywords",
        badge: "Next",
        badgeClass:
          "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600",
        detail:
          "Track the search terms you care about first, then compare them with Search Console data after import.",
        href: `/keyword-research${querySuffix}`,
        icon: Sparkles,
        title: "Choose keywords to watch",
      },
    ];
  }

  return [
    {
      action: "Review wins",
      badge: "Healthy",
      badgeClass:
        "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700",
      detail: topQuery
        ? `"${topQuery.key}" is already bringing search demand. Keep that page fresh and easy to click.`
        : "Your strongest search terms will appear here once there is enough data.",
      href: `/keyword-research${querySuffix}`,
      icon: ShieldCheck,
      title: "Protect what is working",
    },
    {
      action: "Improve page",
      badge: declinedQuery ? "Needs care" : "Watch",
      badgeClass: declinedQuery
        ? "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
        : "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600",
      detail: declinedQuery
        ? `"${declinedQuery.key}" slipped by ${Math.abs(
            declinedQuery.positionChange ?? 0,
          ).toFixed(
            1,
          )} positions. Refresh the page title, headings, and answer quality.`
        : "No clear ranking drop in this range. Keep watching the next import.",
      href: `/pages${querySuffix}`,
      icon: ArrowDown,
      title: "Fix search terms that slipped",
    },
    {
      action: "Find ideas",
      badge: improvedQuery ? "Opportunity" : "Plan",
      badgeClass:
        "rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700",
      detail: topPage
        ? `${topPage.key} has ${topPage.impressions.toLocaleString()} impressions. Improve the title and intro to earn more clicks.`
        : "Use keyword ideas to create or improve pages before the next search import.",
      href: `/keyword-research${querySuffix}`,
      icon: MousePointerClick,
      title: "Turn impressions into clicks",
    },
  ];
}

import Link from "next/link";
import type React from "react";
import {
  ArrowUpRight,
  FileText,
  Lightbulb,
  MousePointerClick,
  Search,
  Sparkles,
  Target,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { HorizontalBar } from "@/components/analytics-widgets";
import { HelpLabel } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { SavedViewsBar } from "@/components/saved-views-bar";
import {
  formatKeywordIntent,
  formatKeywordPosition,
  formatKeywordPositionInline,
} from "@/lib/keyword-display-labels";
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
  const keywordPlan = buildKeywordPlan({ data, selectedDomainId });
  const visibleOpportunities = data.opportunities.slice(0, 8);
  const hiddenOpportunityCount = Math.max(
    data.opportunities.length - visibleOpportunities.length,
    0,
  );
  const visibleCompetitorGaps = data.competitorContentGaps.slice(0, 6);
  const hiddenCompetitorGapCount = Math.max(
    data.competitorContentGaps.length - visibleCompetitorGaps.length,
    0,
  );
  const visibleContentGaps = data.contentGaps.slice(0, 6);
  const hiddenContentGapCount = Math.max(
    data.contentGaps.length - visibleContentGaps.length,
    0,
  );
  const visibleQueries = data.topQueries.slice(0, 10);
  const hiddenQueryCount = Math.max(
    data.topQueries.length - visibleQueries.length,
    0,
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar
          active="Keyword Research"
          activeDomainId={selectedDomainId}
        />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {data.workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Search ideas
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Find one search term worth improving next, then turn it into a
                brief, page update, or competitor comparison.
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
            note="Search ideas use imported Google Search Console query data."
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
                  Pick one useful search idea, create a simple brief, then
                  compare pages only when it helps. Deeper query data is
                  optional.
                </p>
              </div>

              <div className="grid gap-3">
                {keywordPlan.map((step, index) => {
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
                  <h3 className="text-lg font-semibold">Search demand</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    A quick read on what people are searching for most.
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-600">
                  {data.summary.impressions.toLocaleString()} impressions
                </span>
              </div>
              <div className="mt-5 grid gap-4">
                {data.intentGroups.length ? (
                  data.intentGroups
                    .slice(0, 6)
                    .map((item) => (
                      <HorizontalBar
                        key={item.intent}
                        label={formatKeywordIntent(item.intent)}
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
              <h3 className="text-lg font-semibold">Writing queue</h3>
              <div className="mt-5 grid gap-3">
                <QueueRow
                  label="Briefs to create"
                  value={data.contentGaps.length}
                />
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

          <details className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="cursor-pointer list-none border-b border-slate-100 p-5">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    Adjust keyword filters
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Open this only when you want a specific website, search
                    term, country, device, or date range.
                  </p>
                </div>
                <span className="mt-2 text-sm font-semibold text-orange-700 sm:mt-0">
                  Show options
                </span>
              </div>
            </summary>
            <form className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-[minmax(0,230px)_repeat(5,minmax(0,1fr))_auto]">
              <FilterLabel label="Website">
                <select
                  name="domainId"
                  defaultValue={selectedDomainId ?? ""}
                  className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">All websites</option>
                  {data.domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain}
                    </option>
                  ))}
                </select>
              </FilterLabel>
              <FilterLabel label="Search term">
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
                <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
                  <Search className="size-4" aria-hidden="true" />
                  Apply
                </button>
              </div>
            </form>
          </details>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <OpportunityList
              hiddenCount={hiddenOpportunityCount}
              items={visibleOpportunities}
            />
            <ContentGapList
              hiddenCount={hiddenContentGapCount}
              items={visibleContentGaps}
            />
          </section>

          <details className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="cursor-pointer list-none border-b border-slate-100 p-5 marker:hidden">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">More search detail</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Optional competitor gaps, intent groups, and search-term
                    detail for deeper review.
                  </p>
                </div>
                <span className="mt-2 text-sm font-semibold text-orange-700 sm:mt-0">
                  Open details
                </span>
              </div>
            </summary>
            <div className="grid gap-6 p-5 xl:grid-cols-2">
              <CompetitorGapList
                hiddenCount={hiddenCompetitorGapCount}
                items={visibleCompetitorGaps}
              />
              <IntentPanel items={data.intentGroups.slice(0, 6)} />
              <QueryTable
                hiddenCount={hiddenQueryCount}
                items={visibleQueries}
              />
            </div>
          </details>
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

function OpportunityList({
  hiddenCount,
  items,
}: {
  hiddenCount: number;
  items: KeywordOpportunity[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center gap-3 border-b border-slate-200 p-5">
        <Lightbulb className="size-5 text-amber-600" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-semibold">Best search ideas</h3>
          <p className="mt-1 text-sm text-slate-500">
            Start with one idea that has enough search demand to matter.
          </p>
        </div>
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
                <p className="mt-2 text-sm font-medium text-slate-500">
                  {formatKeywordIntent(item.intent)}
                </p>
              </div>
              <Meta label="Score" value={item.opportunityScore.toString()} />
              <Meta
                label="Position"
                value={formatKeywordPosition(item.avgPosition)}
              />
            </article>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            No keyword opportunities are available for this filter set.
          </p>
        )}
      </div>
      {hiddenCount > 0 ? (
        <PreviewLimitNote
          body={`${hiddenCount} more ideas are kept out of the first view so you can choose without scrolling forever.`}
        />
      ) : null}
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
          Search-term demand grouped by likely search intent.
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
                <p className="font-semibold">
                  {formatKeywordIntent(item.intent)}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {item.queries} search-term groups
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
            No search-term intents to group yet.
          </p>
        )}
      </div>
    </section>
  );
}

function ContentGapList({
  hiddenCount,
  items,
}: {
  hiddenCount: number;
  items: KeywordContentGap[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold">Pages to improve</h3>
        <p className="mt-1 text-sm text-slate-500">
          Searches that may need a clearer page, title, snippet, or link.
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
                <span>{formatKeywordPositionInline(item.avgPosition)}</span>
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
      {hiddenCount > 0 ? (
        <PreviewLimitNote
          body={`${hiddenCount} more page ideas are available when you want a longer writing queue.`}
          href="/recommendations"
          label="Open ideas"
        />
      ) : null}
    </section>
  );
}

function CompetitorGapList({
  hiddenCount,
  items,
}: {
  hiddenCount: number;
  items: Awaited<
    ReturnType<typeof getKeywordResearchData>
  >["competitorContentGaps"];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold">Competitor content gap</h3>
        <p className="mt-1 text-sm text-slate-500">
          Tracked keywords where a competitor ranks and your website trails or
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
      {hiddenCount > 0 ? (
        <PreviewLimitNote
          body={`${hiddenCount} more competitor gaps are hidden until you need the deeper comparison.`}
        />
      ) : null}
    </section>
  );
}

function QueryTable({
  hiddenCount,
  items,
}: {
  hiddenCount: number;
  items: SearchPerformanceGroup[];
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h3 className="text-lg font-semibold">Search-term detail</h3>
        <p className="mt-1 text-sm text-slate-500">
          Search Console rows kept for deeper review.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Search term</th>
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
                    <span className="line-clamp-2 font-medium">{item.key}</span>
                  </td>
                  <td className="px-5 py-4 font-medium">
                    {item.clicks.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">
                    {item.impressions.toLocaleString()}
                  </td>
                  <td className="px-5 py-4">{formatCtr(item.ctr)}</td>
                  <td className="px-5 py-4">
                    {formatKeywordPosition(item.avgPosition)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  className="px-5 py-8 text-center text-slate-500"
                  colSpan={5}
                >
                  No Search Console queries match this view.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hiddenCount > 0 ? (
        <PreviewLimitNote
          body={`${hiddenCount} more queries are available through filters or exported reporting.`}
        />
      ) : null}
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

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildKeywordPlan({
  data,
  selectedDomainId,
}: {
  data: Awaited<ReturnType<typeof getKeywordResearchData>>;
  selectedDomainId?: string;
}) {
  const domainSuffix = selectedDomainId ? `?domainId=${selectedDomainId}` : "";
  const bestOpportunity = data.opportunities[0];
  const contentGap = data.contentGaps[0];
  const competitorGap = data.competitorContentGaps[0];

  if (!data.topQueries.length) {
    return [
      {
        action: "Connect data",
        badge: "Setup",
        badgeClass:
          "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700",
        detail:
          "Connect Google Search Console so keyword ideas come from real searches instead of guesswork.",
        href: "/integrations",
        icon: Search,
        title: "Import keyword data",
      },
      {
        action: "Track terms",
        badge: "Next",
        badgeClass:
          "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600",
        detail:
          "Add the search terms that matter to your business, then compare them with new Search Console imports.",
        href: `/rank-tracking${domainSuffix}`,
        icon: Target,
        title: "Choose keywords to watch",
      },
    ];
  }

  return [
    {
      action: "Open ideas",
      badge: "Best bet",
      badgeClass:
        "rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700",
      detail: bestOpportunity
        ? `"${bestOpportunity.key}" has a strong opportunity score. Use it for the next page update or brief.`
        : "Use the best demand signals to choose the next page or post to improve.",
      href: `/recommendations${domainSuffix}`,
      icon: Sparkles,
      title: "Pick one keyword to improve",
    },
    {
      action: "Create brief",
      badge: contentGap ? "Missing content" : "Watch",
      badgeClass: contentGap
        ? "rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
        : "rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600",
      detail: contentGap
        ? `"${contentGap.key}" gets impressions but needs a better answer, page title, or internal links.`
        : "No clear content gap in this view. Keep monitoring the next import.",
      href: contentGap?.actionHref ?? `/recommendations${domainSuffix}`,
      icon: FileText,
      title: "Turn a gap into a brief",
    },
    {
      action: "Compare",
      badge: competitorGap ? "Competitor" : "Optional",
      badgeClass:
        "rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700",
      detail: competitorGap
        ? `${competitorGap.competitorDomain} is ahead for "${competitorGap.keyword}". Use that page as a reference, then make yours clearer.`
        : "Add competitors in Rank Tracking to reveal search terms they win and you can target.",
      href: `/competitive-analysis${domainSuffix}`,
      icon: MousePointerClick,
      title: "Learn from competitor wins",
    },
  ];
}

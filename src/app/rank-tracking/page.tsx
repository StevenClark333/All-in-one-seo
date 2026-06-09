import Link from "next/link";
import type React from "react";
import { Crosshair, LineChart, Plus } from "lucide-react";
import {
  addTrackedKeywordAction,
  importKeywordMetricAction,
  recordRankObservationAction,
} from "@/app/actions";
import { HorizontalBar } from "@/components/analytics-widgets";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { SavedViewsBar } from "@/components/saved-views-bar";
import { SeoFilterBar } from "@/components/seo-filter-bar";
import { getRankTrackingData } from "@/lib/product-seo-groups";
import {
  formatRankClient,
  formatRankDifficulty,
  formatRankPosition,
  formatRankVolume,
} from "@/lib/rank-display-labels";

export const dynamic = "force-dynamic";

type RankTrackingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type RankKeyword = Awaited<
  ReturnType<typeof getRankTrackingData>
>["keywords"][number];

export default async function RankTrackingPage({
  searchParams,
}: RankTrackingPageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedDomainId = getSingle(params.domainId);
  const query = getSingle(params.query);
  const data = await getRankTrackingData({
    domainId: selectedDomainId,
    query,
  });
  const maxRankBucket = Math.max(1, data.summary.keywords);
  const outsideTopTen = Math.max(
    0,
    data.summary.keywords - data.summary.topTen,
  );
  const visibleKeywords = data.keywords.slice(0, 8);
  const hiddenKeywordCount = Math.max(
    data.keywords.length - visibleKeywords.length,
    0,
  );
  const visibleCompetitorGaps = data.competitorContentGaps.slice(0, 6);
  const hiddenCompetitorGapCount = Math.max(
    data.competitorContentGaps.length - visibleCompetitorGaps.length,
    0,
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Rank Tracking" activeDomainId={selectedDomainId} />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {data.workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Rank movement
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                See which keywords moved, what dropped, and where one page can
                be improved next.
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <LineChart className="size-4" aria-hidden="true" />
              {data.summary.keywords} tracked keywords
            </div>
          </header>

          <RankMovementPlan
            averagePosition={data.summary.averagePosition}
            keywordCount={data.summary.keywords}
            needsRankDataCount={
              data.keywords.filter(
                (keyword) => !getOwnedRank(keyword)?.position,
              ).length
            }
            topTenCount={data.summary.topTen}
            worsenedCount={data.summary.worsened}
          />

          <ProjectWorkspaceBar
            active="rank"
            domainId={selectedDomainId}
            note="Rank movement keeps owned and competitor positions scoped to this project."
            returnPath="/rank-tracking"
          />

          <details className="group mt-5 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="flex items-center justify-between gap-4 p-5">
              <div>
                <h3 className="text-lg font-semibold">Adjust rank view</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Save this view or narrow the page by project and keyword.
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                Show filters
              </span>
              <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                Hide
              </span>
            </summary>
            <div className="grid gap-4 border-t border-slate-100 p-5">
              <SavedViewsBar
                filters={{
                  domainId: selectedDomainId ?? "",
                  query: query ?? "",
                }}
                route="/rank-tracking"
              />

              <SeoFilterBar
                action="/rank-tracking"
                domainId={selectedDomainId}
                domains={data.domains}
                query={query}
                resetHref="/rank-tracking"
              />
            </div>
          </details>

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              help="Active and paused keywords currently configured for tracking."
              label="Tracked keywords"
              value={data.summary.keywords}
            />
            <Metric
              help="Latest owned ranking positions in the top three organic results."
              label="Top 3"
              value={data.summary.topThree}
            />
            <Metric
              help="Latest owned ranking positions in the top ten organic results."
              label="Top 10"
              value={data.summary.topTen}
            />
            <Metric
              help="Average latest owned position across tracked keywords with rank data."
              label="Avg. spot"
              value={formatRankPosition(data.summary.averagePosition)}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <section
              id="rank-distribution"
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-col gap-2 border-b border-slate-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Rank distribution</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Latest owned positions grouped for quick portfolio scanning.
                  </p>
                </div>
                <span className="text-sm font-semibold text-slate-600">
                  {formatRankPosition(data.summary.averagePosition)} avg.
                </span>
              </div>
              <div className="mt-5 grid gap-4">
                <HorizontalBar
                  label="Top 3"
                  max={maxRankBucket}
                  value={data.summary.topThree}
                />
                <HorizontalBar
                  label="Top 10"
                  max={maxRankBucket}
                  value={data.summary.topTen}
                />
                <HorizontalBar
                  label="Outside top 10 or not ranking yet"
                  max={maxRankBucket}
                  value={outsideTopTen}
                />
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">Movement monitor</h3>
              <div className="mt-5 grid gap-3">
                <QueueRow label="Improved" value={data.summary.improved} />
                <QueueRow label="Worsened" value={data.summary.worsened} />
                <QueueRow
                  label="Needs rank data"
                  value={
                    data.keywords.filter(
                      (keyword) => !getOwnedRank(keyword)?.position,
                    ).length
                  }
                />
              </div>
            </section>
          </section>

          <details
            id="manage-rank-data"
            className="group mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <summary className="flex items-center justify-between gap-4 p-5">
              <div>
                <h3 className="text-lg font-semibold">Manage tracking data</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add keywords, record a rank, or import search volume when you
                  need to update the tracker manually.
                </p>
              </div>
              <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                Add data
              </span>
              <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                Hide
              </span>
            </summary>
            <div className="grid gap-6 border-t border-slate-100 p-5 xl:grid-cols-3">
              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h3 className="text-lg font-semibold">Track keyword</h3>
                </div>
                <form
                  action={addTrackedKeywordAction}
                  className="grid gap-4 p-5"
                >
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
                  <FilterLabel label="Keyword">
                    <input
                      name="keyword"
                      placeholder="seo audit software"
                      required
                      className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </FilterLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FilterLabel label="Country">
                      <input
                        name="country"
                        placeholder="US"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </FilterLabel>
                    <FilterLabel label="Device">
                      <select
                        name="device"
                        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      >
                        <option value="">Any</option>
                        <option value="DESKTOP">Desktop</option>
                        <option value="MOBILE">Mobile</option>
                      </select>
                    </FilterLabel>
                  </div>
                  <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                    <Plus className="size-4" aria-hidden="true" />
                    Add keyword
                  </button>
                </form>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h3 className="text-lg font-semibold">Record rank</h3>
                </div>
                <form
                  action={recordRankObservationAction}
                  className="grid gap-4 p-5"
                >
                  <FilterLabel label="Keyword">
                    <select
                      name="trackedKeywordId"
                      required
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    >
                      <option value="">Choose keyword</option>
                      {data.keywords.map((keyword) => (
                        <option key={keyword.id} value={keyword.id}>
                          {keyword.keyword}
                        </option>
                      ))}
                    </select>
                  </FilterLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FilterLabel label="Position">
                      <input
                        name="position"
                        min="1"
                        step="0.1"
                        type="number"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </FilterLabel>
                    <FilterLabel label="Date">
                      <input
                        name="date"
                        type="date"
                        defaultValue={new Date().toISOString().slice(0, 10)}
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </FilterLabel>
                  </div>
                  <FilterLabel label="Competitor domain">
                    <input
                      name="competitorDomain"
                      placeholder="Leave blank for owned rank"
                      className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </FilterLabel>
                  <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Save rank
                  </button>
                </form>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h3 className="text-lg font-semibold">Import metric</h3>
                </div>
                <form
                  action={importKeywordMetricAction}
                  className="grid gap-4 p-5"
                >
                  <FilterLabel label="Keyword">
                    <input
                      name="keyword"
                      placeholder="seo audit software"
                      required
                      className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </FilterLabel>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <FilterLabel label="Volume">
                      <input
                        name="searchVolume"
                        min="0"
                        type="number"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </FilterLabel>
                    <FilterLabel label="Difficulty">
                      <input
                        name="difficulty"
                        max="100"
                        min="0"
                        type="number"
                        className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      />
                    </FilterLabel>
                  </div>
                  <FilterLabel label="Provider">
                    <input
                      name="provider"
                      placeholder="Semrush, Ahrefs, DataForSEO"
                      className="h-10 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </FilterLabel>
                  <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                    Save metric
                  </button>
                </form>
              </section>
            </div>
          </details>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <CompetitorGapList
              gaps={visibleCompetitorGaps}
              hiddenCount={hiddenCompetitorGapCount}
            />
            <details
              id="tracked-keywords"
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <summary className="cursor-pointer list-none border-b border-slate-100 p-5 marker:hidden">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      More keyword detail
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional keyword inventory for rank, volume, difficulty,
                      and status.
                    </p>
                  </div>
                  <span className="mt-2 text-sm font-semibold text-orange-700 sm:mt-0">
                    Open details
                  </span>
                </div>
              </summary>
              <KeywordTable
                hiddenCount={hiddenKeywordCount}
                keywords={visibleKeywords}
              />
            </details>
          </section>
        </section>
      </div>
    </main>
  );
}

function KeywordTable({
  hiddenCount,
  keywords,
}: {
  hiddenCount: number;
  keywords: RankKeyword[];
}) {
  return (
    <section>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">Keyword</th>
              <th className="px-5 py-3 font-semibold">Project</th>
              <th className="px-5 py-3 font-semibold">Owned rank</th>
              <th className="px-5 py-3 font-semibold">Volume</th>
              <th className="px-5 py-3 font-semibold">Difficulty</th>
              <th className="px-5 py-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {keywords.length ? (
              keywords.map((keyword) => {
                const ownedRank = getOwnedRank(keyword);
                const metric = keyword.metrics.at(0);

                return (
                  <tr key={keyword.id}>
                    <td className="px-5 py-4 font-semibold">
                      {keyword.keyword}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/domains/${keyword.domain.id}/workspace`}
                        className="font-medium underline-offset-4 hover:underline"
                      >
                        {keyword.domain.domain}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatRankClient(keyword.domain.client?.name)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      {formatRankPosition(ownedRank?.position)}
                    </td>
                    <td className="px-5 py-4">
                      {formatRankVolume(metric?.searchVolume)}
                    </td>
                    <td className="px-5 py-4">
                      {formatRankDifficulty(metric?.difficulty)}
                    </td>
                    <td className="px-5 py-4">
                      {formatKeywordStatus(keyword.status)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  className="px-5 py-8 text-center text-slate-500"
                  colSpan={6}
                >
                  No tracked keywords yet. Add one above to begin rank tracking.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {hiddenCount > 0 ? (
        <PreviewLimitNote
          body={`${hiddenCount} more keywords are hidden so the first view stays focused on movement.`}
        />
      ) : null}
    </section>
  );
}

function CompetitorGapList({
  gaps,
  hiddenCount,
}: {
  gaps: Awaited<
    ReturnType<typeof getRankTrackingData>
  >["competitorContentGaps"];
  hiddenCount: number;
}) {
  return (
    <section
      id="competitor-gaps"
      className="rounded-lg border border-slate-200 bg-white shadow-sm"
    >
      <div className="flex items-center gap-3 border-b border-slate-200 p-5">
        <Crosshair className="size-5 text-blue-700" aria-hidden="true" />
        <div>
          <h3 className="text-lg font-semibold">Competitor rank gaps</h3>
          <p className="mt-1 text-sm text-slate-500">
            Keywords where someone else is ahead and your page may need work.
          </p>
        </div>
      </div>
      <div className="divide-y divide-slate-100">
        {gaps.length ? (
          gaps.map((gap) => (
            <article
              key={`${gap.keyword}:${gap.competitorDomain}`}
              className="p-5"
            >
              <p className="font-semibold">{gap.keyword}</p>
              <p className="mt-1 text-sm text-slate-500">{gap.reason}</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Meta label="Competitor" value={gap.competitorDomain} />
                <Meta
                  label="Ranks"
                  value={`${gap.competitorPosition} vs ${
                    gap.ownedPosition ?? "none"
                  }`}
                />
                <Meta label="Priority" value={gap.priority.toString()} />
              </div>
            </article>
          ))
        ) : (
          <p className="p-8 text-center text-sm text-slate-500">
            Record competitor ranks to reveal competitor-led content gaps.
          </p>
        )}
      </div>
      {hiddenCount > 0 ? (
        <PreviewLimitNote
          body={`${hiddenCount} more competitor gaps are available when you want deeper rank review.`}
        />
      ) : null}
    </section>
  );
}

function RankMovementPlan({
  averagePosition,
  keywordCount,
  needsRankDataCount,
  topTenCount,
  worsenedCount,
}: {
  averagePosition: number | null;
  keywordCount: number;
  needsRankDataCount: number;
  topTenCount: number;
  worsenedCount: number;
}) {
  const plan = [
    {
      detail: keywordCount
        ? "Watch the keywords that already have movement before adding more data."
        : "Add one important keyword so the tracker can start showing progress.",
      href: keywordCount ? "#rank-distribution" : "#manage-rank-data",
      label: keywordCount ? "See what moved" : "Add your first keyword",
      value: keywordCount ? `${keywordCount} tracked` : "Start here",
    },
    {
      detail: worsenedCount
        ? "Review the keywords that dropped and decide whether a page needs a content refresh."
        : "No tracked keyword drops are showing right now.",
      href: "#competitor-gaps",
      label: worsenedCount ? "Recover lost positions" : "No drops to fix",
      value: worsenedCount ? `${worsenedCount} dropped` : "Stable",
    },
    {
      detail: needsRankDataCount
        ? "Add a rank observation so averages and top position groups become useful."
        : "Rank data is ready, so focus on the best keywords near page one.",
      href: needsRankDataCount ? "#manage-rank-data" : "#tracked-keywords",
      label: needsRankDataCount
        ? "Fill missing rank data"
        : "Push page-one wins",
      value: needsRankDataCount
        ? `${needsRankDataCount} need ranks`
        : `${topTenCount} top 10`,
    },
  ];

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-600">
            Rank movement plan
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-normal">
            Know which keyword needs attention next.
          </h3>
        </div>
        <div className="inline-flex w-fit items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
          {averagePosition
            ? `${averagePosition} average spot`
            : "Waiting for ranks"}
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {plan.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <span className="text-sm font-semibold text-slate-950">
              {item.label}
            </span>
            <span className="mt-2 block text-sm font-medium text-orange-600">
              {item.value}
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-500">
              {item.detail}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
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
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </article>
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
      <span className="text-sm font-medium text-slate-500">{label}</span>
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

function PreviewLimitNote({ body }: { body: string }) {
  return (
    <div className="border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm text-slate-600">
      {body}
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

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatKeywordStatus(value: string) {
  const labels: Record<string, string> = {
    ACTIVE: "Watching",
    ARCHIVED: "Set aside",
    PAUSED: "Paused for now",
  };

  return labels[value] ?? formatEnum(value);
}

function getOwnedRank(keyword: RankKeyword) {
  return keyword.rankings.find((ranking) => !ranking.competitorDomain);
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

import { notFound } from "next/navigation";
import { formatChangeType, getPublicReportData } from "@/lib/reporting";
import { PRODUCT_REPORT_UPDATE_COPY } from "@/lib/product-copy";
import { formatWebsiteHealth } from "@/lib/website-display-labels";

export const dynamic = "force-dynamic";

type PublicReportPageProps = {
  params: Promise<{ shareToken: string }>;
};

export default async function PublicReportPage({
  params,
}: PublicReportPageProps) {
  const { shareToken } = await params;
  const { report, summary } = await getPublicReportData(shareToken);

  if (!report || !summary) {
    notFound();
  }

  const topRecommendation = summary.recommendations.at(0);
  const healthLabel =
    summary.score === null || summary.score === undefined
      ? "Website health needs a fresh score"
      : summary.score >= 85
        ? "Website health looks strong"
        : summary.score >= 70
          ? "Website health needs a little care"
          : "Website health needs attention";

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-medium text-slate-500">
            {summary.brand.agencyName} for {summary.brand.clientName} -
            {` ${PRODUCT_REPORT_UPDATE_COPY.sharedHeaderLabel}`}
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal">
            {report.title}
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {report.periodStart.toLocaleDateString()} -{" "}
            {report.periodEnd.toLocaleDateString()}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Scope: {summary.brand.reportScope}
          </p>
        </header>

        <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
          <p className="text-sm font-semibold text-orange-700">
            Client summary
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            Start with the takeaway, then share the details.
          </h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <StoryTile
              label="Main takeaway"
              title={healthLabel}
              detail={
                summary.score === null || summary.score === undefined
                  ? PRODUCT_REPORT_UPDATE_COPY.freshScoreDetail
                  : `${summary.openIssues.length} ${pluralize(summary.openIssues.length, "item")} need attention and ${summary.fixedIssues.length} ${pluralize(summary.fixedIssues.length, "fix", "fixes")} are included in this update.`
              }
            />
            <StoryTile
              label="What changed"
              title={
                summary.changeEvents.length
                  ? `${summary.changeEvents.length} tracked changes`
                  : "No major tracked changes"
              }
              detail={
                summary.changeEvents.length
                  ? "The most important changes are summarized below."
                  : "This period is quiet, so the update is intentionally short."
              }
            />
            <StoryTile
              label="Next fix"
              title={topRecommendation?.title ?? "No urgent fix to highlight"}
              detail={
                topRecommendation?.recommendation ??
                "There are no active recommendations in this report scope."
              }
            />
          </div>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-5">
          {summary.sections.healthScore ? (
            <Metric
              label="Website health"
              value={formatWebsiteHealth(summary.score)}
            />
          ) : null}
          <Metric label="Pages" value={summary.pageCount} />
          <Metric label="Needs attention" value={summary.openIssues.length} />
          <Metric label="Fixed this period" value={summary.fixedIssues.length} />
          {summary.sections.changeSummary ? (
            <Metric label="Changes" value={summary.changeEvents.length} />
          ) : null}
        </section>

        {summary.sections.changeSummary ? (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Change summary</h2>
            </div>
            <div className="grid divide-y divide-slate-100">
              {summary.changeEvents.length ? (
                summary.changeEvents.slice(0, 8).map((change) => (
                  <article key={change.id} className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {formatImportance(change.severity)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {change.createdAt.toLocaleDateString()}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold">
                      {formatChangeType(change.changeType)}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      {change.domainName}
                      {change.page ? ` - ${change.page.url}` : ""}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {change.previousValue ?? "empty"} to{" "}
                      {change.newValue ?? "empty"}
                    </p>
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No tracked changes during this report period.
                </div>
              )}
            </div>
          </section>
        ) : null}

        {summary.sections.priorityRecommendations ? (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold">Next steps</h2>
              <p className="mt-1 text-sm text-slate-500">
                Client-readable fixes pulled from the current problem list.
              </p>
            </div>
            <div className="grid divide-y divide-slate-100">
              {summary.recommendations.length ? (
                summary.recommendations.map((item) => (
                  <article key={`${item.domain}-${item.title}`} className="p-5">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-1 text-sm text-slate-500">{item.domain}</p>
                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {item.recommendation}
                    </p>
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No active next steps for this report scope.
                </div>
              )}
            </div>
          </section>
        ) : null}

        <section className="mt-6 grid gap-6 lg:grid-cols-2">
          {summary.sections.crawlSummary ? (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Website check summary</h2>
              <div className="mt-4 grid gap-3">
                {summary.crawls.length ? (
                  summary.crawls.map((crawl) => (
                    <div
                      key={crawl.id}
                      className="rounded-md border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold">
                        {formatWebsiteCheckStatus(crawl.status)}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {crawl.pagesCrawled} pages checked /{" "}
                        {crawl.pagesFailed} need another look
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No website checks are included in this update yet.
                  </p>
                )}
              </div>
            </div>
          ) : null}

          {summary.sections.issueMovement ? (
            <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-semibold">Fix movement</h2>
              <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                <Meta label="New items" value={summary.newIssues.length} />
                <Meta label="Fixed items" value={summary.fixedIssues.length} />
                <Meta label="Urgent open" value={summary.criticalIssues.length} />
                <Meta label="Planned open" value={summary.warningIssues.length} />
                {summary.sections.changeSummary ? (
                  <Meta
                    label="Important changes"
                    value={summary.criticalChanges.length}
                  />
                ) : null}
              </dl>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatImportance(value: string) {
  if (value === "CRITICAL") {
    return "Urgent";
  }

  if (value === "WARNING") {
    return "Planned";
  }

  return formatEnum(value);
}

function formatWebsiteCheckStatus(value: string) {
  const labels: Record<string, string> = {
    CANCELLED: "Stopped",
    COMPLETED: "Finished",
    FAILED: "Needs review",
    QUEUED: "Waiting to start",
    RUNNING: "Checking now",
  };

  return labels[value] ?? formatEnum(value);
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function StoryTile({
  detail,
  label,
  title,
}: {
  detail: string;
  label: string;
  title: string;
}) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <h3 className="mt-2 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { publishReportAction } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import {
  buildReportShareUrl,
  formatChangeType,
  getReportDetailData,
} from "@/lib/reporting";

export const dynamic = "force-dynamic";

type ReportDetailPageProps = {
  params: Promise<{ reportId: string }>;
};

export default async function ReportDetailPage({
  params,
}: ReportDetailPageProps) {
  const { reportId } = await params;
  const { report, summary } = await getReportDetailData(reportId);

  if (!report || !summary) {
    notFound();
  }

  const sharePath = buildReportShareUrl(report);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Reports" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <Link
            href="/reports"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Reports
          </Link>

          <header className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {summary.brand.agencyName} for {summary.brand.clientName} -{" "}
                {formatEnum(report.status)}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                {report.title}
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                {report.periodStart.toLocaleDateString()} -{" "}
                {report.periodEnd.toLocaleDateString()}
              </p>
              <p className="mt-1 text-sm text-slate-500">
                Scope: {summary.brand.reportScope}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              {report.status !== "PUBLISHED" ? (
                <form action={publishReportAction}>
                  <input type="hidden" name="reportId" value={report.id} />
                  <button className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
                    <Share2 className="size-4" aria-hidden="true" />
                    Publish share link
                  </button>
                </form>
              ) : null}
              <Link
                href={`/reports/${report.id}/pdf`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Download className="size-4" aria-hidden="true" />
                PDF
              </Link>
            </div>
          </header>

          {sharePath ? (
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                Share link
              </p>
              <Link
                href={sharePath}
                className="mt-2 block break-all text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
              >
                {sharePath}
              </Link>
            </section>
          ) : null}

          <section className="mt-6 grid gap-4 md:grid-cols-5">
            {summary.sections.healthScore ? (
              <Metric label="Health score" value={summary.score ?? "Pending"} />
            ) : null}
            <Metric label="Pages" value={summary.pageCount} />
            <Metric label="Open issues" value={summary.openIssues.length} />
            <Metric
              label="Fixed this period"
              value={summary.fixedIssues.length}
            />
            {summary.sections.changeSummary ? (
              <Metric label="Changes" value={summary.changeEvents.length} />
            ) : null}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="grid gap-6">
              {summary.sections.changeSummary ? (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <h3 className="text-lg font-semibold">Change summary</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Important SEO changes detected during this report period.
                    </p>
                  </div>
                  <div className="grid divide-y divide-slate-100">
                    {summary.changeEvents.length ? (
                      summary.changeEvents.slice(0, 8).map((change) => (
                        <article key={change.id} className="p-5">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                              {formatEnum(change.severity)}
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
                </div>
              ) : null}

              {summary.sections.priorityRecommendations ? (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <h3 className="text-lg font-semibold">
                      Priority recommendations
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Client-readable fixes pulled from the active issue queue.
                    </p>
                  </div>
                  <div className="grid divide-y divide-slate-100">
                    {summary.recommendations.length ? (
                      summary.recommendations.map((item) => (
                        <article
                          key={`${item.domain}-${item.title}`}
                          className="p-5"
                        >
                          <p className="font-semibold">{item.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {item.domain}
                            {item.pageUrl ? ` - ${item.pageUrl}` : ""}
                          </p>
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {item.recommendation}
                          </p>
                        </article>
                      ))
                    ) : (
                      <div className="p-8 text-center text-sm text-slate-500">
                        No active recommendations for this report scope.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="grid gap-6">
              {summary.sections.crawlSummary ? (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold">Crawl summary</h3>
                  <div className="mt-4 grid gap-3">
                    {summary.crawls.length ? (
                      summary.crawls.map((crawl) => (
                        <div
                          key={crawl.id}
                          className="rounded-md border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-sm font-semibold">
                            {formatEnum(crawl.status)}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {crawl.pagesCrawled} crawled / {crawl.pagesFailed}{" "}
                            failed
                          </p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-slate-500">
                        No crawls in scope.
                      </p>
                    )}
                  </div>
                </section>
              ) : null}

              {summary.sections.issueMovement ? (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold">Issue movement</h3>
                  <dl className="mt-4 grid gap-4">
                    <Meta label="New issues" value={summary.newIssues.length} />
                    <Meta
                      label="Fixed issues"
                      value={summary.fixedIssues.length}
                    />
                    <Meta
                      label="Critical open"
                      value={summary.criticalIssues.length}
                    />
                    <Meta
                      label="Warnings open"
                      value={summary.warningIssues.length}
                    />
                    {summary.sections.changeSummary ? (
                      <Meta
                        label="Critical changes"
                        value={summary.criticalChanges.length}
                      />
                    ) : null}
                  </dl>
                </section>
              ) : null}
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{value}</dd>
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

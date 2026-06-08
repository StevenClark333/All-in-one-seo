import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, Share2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import {
  buildReportShareUrl,
  formatChangeType,
  getReportDetailData,
} from "@/lib/reporting";

export const dynamic = "force-dynamic";

type ReportDetailPageProps = {
  params: Promise<{ reportId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportDetailPage({
  params,
  searchParams,
}: ReportDetailPageProps) {
  const { reportId } = await params;
  const query = searchParams ? await searchParams : {};
  const error = getSingle(query.error);
  const status = getSingle(query.status);
  const { report, summary } = await getReportDetailData(reportId);

  if (!report || !summary) {
    notFound();
  }

  const sharePath = buildReportShareUrl(report);
  const topRecommendation = summary.recommendations.at(0);
  const healthLabel =
    summary.score === null || summary.score === undefined
      ? "Website health pending"
      : summary.score >= 85
        ? "Website health looks strong"
        : summary.score >= 70
          ? "Website health needs a little care"
          : "Website health needs attention";

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar
          active="Reports"
          activeDomainId={report.domainId ?? undefined}
        />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <Link
            href={
              report.domainId
                ? `/domains/${report.domainId}/workspace`
                : "/reports"
            }
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {report.domainId ? "Website workspace" : "Client updates"}
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
                <form action="/api/reports/publish" method="post">
                  <input type="hidden" name="reportId" value={report.id} />
                  <button className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700">
                    <Share2 className="size-4" aria-hidden="true" />
                    Create client link
                  </button>
                </form>
              ) : null}
              <Link
                href={`/reports/${report.id}/pdf`}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
              >
                <Download className="size-4" aria-hidden="true" />
                Download PDF
              </Link>
            </div>
          </header>

          {status === "client-link-ready" ? (
            <StatusNotice
              tone="success"
              title="Client link is ready"
              message="You can copy the share link below or download the PDF."
            />
          ) : null}

          {error === "report-publish-failed" ? (
            <StatusNotice
              tone="error"
              title="Client link could not be created"
              message="Please try again. The report is still saved."
            />
          ) : null}

          {sharePath ? (
            <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/70 p-5 shadow-sm">
              <p className="text-sm font-semibold text-orange-700">
                Client link is ready
              </p>
              <Link
                href={sharePath}
                className="mt-2 block break-all text-sm font-medium text-slate-700 underline-offset-4 hover:underline"
              >
                {sharePath}
              </Link>
            </section>
          ) : null}

          <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-orange-700">
                  Client story
                </p>
                <h3 className="mt-1 text-2xl font-semibold tracking-normal">
                  Start with the takeaway, then share the details.
                </h3>
              </div>
              <span className="inline-flex w-fit rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
                {formatEnum(report.status)}
              </span>
            </div>
            <div className="mt-4 grid gap-3 lg:grid-cols-3">
              <StoryTile
                label="Main takeaway"
                title={healthLabel}
                detail={
                  summary.score === null || summary.score === undefined
                    ? "Run a fresh website check before sending this update."
                    : `${summary.openIssues.length} items need attention and ${summary.fixedIssues.length} fixes are included in this period.`
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
                    ? "Review the change summary before sending the client link."
                    : "This report period is quiet, so the update can stay short."
                }
              />
              <StoryTile
                label="Next fix to mention"
                title={topRecommendation?.title ?? "No urgent fix to highlight"}
                detail={
                  topRecommendation?.recommendation ??
                  "The report is ready to share once the summary looks right."
                }
              />
            </div>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-5">
            {summary.sections.healthScore ? (
              <Metric label="Website health" value={summary.score ?? "Pending"} />
            ) : null}
            <Metric label="Pages" value={summary.pageCount} />
            <Metric label="Needs attention" value={summary.openIssues.length} />
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
                </div>
              ) : null}

              {summary.sections.priorityRecommendations ? (
                <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
                  <div className="border-b border-slate-200 p-5">
                    <h3 className="text-lg font-semibold">Next steps</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Client-readable fixes pulled from the current problem
                      list.
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
                        No active next steps for this update.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            <aside className="grid gap-6">
              {summary.sections.crawlSummary ? (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold">Website check summary</h3>
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
                </section>
              ) : null}

              {summary.sections.issueMovement ? (
                <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="font-semibold">Fix movement</h3>
                  <dl className="mt-4 grid gap-4">
                    <Meta
                      label="New items"
                      value={summary.newIssues.length}
                    />
                    <Meta
                      label="Fixed items"
                      value={summary.fixedIssues.length}
                    />
                    <Meta
                      label="Urgent open"
                      value={summary.criticalIssues.length}
                    />
                    <Meta
                      label="Planned open"
                      value={summary.warningIssues.length}
                    />
                    {summary.sections.changeSummary ? (
                      <Meta
                        label="Important changes"
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
      <p className="text-sm font-medium text-slate-500">{label}</p>
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

function StatusNotice({
  message,
  title,
  tone,
}: {
  message: string;
  title: string;
  tone: "error" | "success";
}) {
  const styles =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
      : "border-red-200 bg-red-50 text-red-900";

  return (
    <div className={`mt-6 rounded-md border p-4 ${styles}`}>
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6">{message}</p>
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
      <h4 className="mt-2 text-base font-semibold text-slate-950">{title}</h4>
      <p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p>
    </article>
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
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

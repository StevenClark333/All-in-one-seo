import { notFound } from "next/navigation";
import { formatChangeType, getPublicReportData } from "@/lib/reporting";

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

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-8 text-slate-950 sm:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="border-b border-slate-200 pb-6">
          <p className="text-sm font-medium text-slate-500">
            {summary.brand.agencyName} for {summary.brand.clientName} -
            Published SEO report
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

        <section className="mt-6 grid gap-4 md:grid-cols-5">
          {summary.sections.healthScore ? (
            <Metric label="Health score" value={summary.score ?? "Pending"} />
          ) : null}
          <Metric label="Pages" value={summary.pageCount} />
          <Metric label="Open issues" value={summary.openIssues.length} />
          <Metric label="Fixed" value={summary.fixedIssues.length} />
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
          </section>
        ) : null}

        {summary.sections.priorityRecommendations ? (
          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="text-lg font-semibold">
                Priority recommendations
              </h2>
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
                  No active recommendations for this report scope.
                </div>
              )}
            </div>
          </section>
        ) : null}
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

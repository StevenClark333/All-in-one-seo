import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Globe2, Mail, NotebookText } from "lucide-react";
import {
  archiveClientAction,
  deleteClientAction,
  updateClientAction,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { getClientDetailData } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

type ClientDetailPageProps = {
  params: Promise<{ clientId: string }>;
};

export default async function ClientDetailPage({
  params,
}: ClientDetailPageProps) {
  const { clientId } = await params;
  const { workspace, client } = await getClientDetailData(clientId);

  if (!client) {
    notFound();
  }

  const totalPages = client.domains.reduce(
    (total, domain) => total + domain.pages.length,
    0,
  );
  const criticalIssues = client.domains.reduce(
    (total, domain) =>
      total +
      domain.issues.filter((issue) => issue.severity === "CRITICAL").length,
    0,
  );
  const warningIssues = client.domains.reduce(
    (total, domain) =>
      total +
      domain.issues.filter((issue) => issue.severity === "WARNING").length,
    0,
  );
  const averageHealth = averageScore(
    client.domains.map((domain) => domain.healthScore),
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Clients" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <Link
            href="/clients"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Clients
          </Link>

          <header className="mt-6 border-b border-slate-200 pb-6">
            <p className="text-sm font-medium text-slate-500">
              {workspace?.name ?? "Workspace"}
            </p>
            <h2 className="mt-2 text-3xl font-semibold tracking-normal">
              {client.name}
            </h2>
            <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
              <span className="inline-flex items-center gap-2">
                <Mail className="size-4" aria-hidden="true" />
                {client.contactEmail ?? "No contact email"}
              </span>
              <span className="inline-flex items-center gap-2">
                <NotebookText className="size-4" aria-hidden="true" />
                {client.notes ?? "No client notes yet"}
              </span>
            </div>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Average health" value={averageHealth ?? "Pending"} />
            <Metric label="Domains" value={client.domains.length} />
            <Metric label="Pages" value={totalPages} />
            <Metric
              label="Critical / warnings"
              value={`${criticalIssues} / ${warningIssues}`}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">Client domains</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Domains, crawl readiness, score trend, and open issue load.
                </p>
              </div>

              <div className="grid divide-y divide-slate-100">
                {client.domains.length ? (
                  client.domains.map((domain) => {
                    const latestCrawl = domain.crawlRuns.at(0);

                    return (
                      <article
                        key={domain.id}
                        className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_120px_130px_130px]"
                      >
                        <div className="flex gap-3">
                          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                            <Globe2 className="size-5" aria-hidden="true" />
                          </div>
                          <div>
                            <Link
                              href={`/domains/${domain.id}`}
                              className="font-semibold underline-offset-4 hover:underline"
                            >
                              {domain.domain}
                            </Link>
                            <p className="mt-1 text-sm text-slate-500">
                              {formatEnum(domain.platform)} -{" "}
                              {formatEnum(domain.verificationStatus)}
                            </p>
                          </div>
                        </div>

                        <Meta
                          label="Health"
                          value={domain.healthScore ?? "Pending"}
                        />
                        <Meta label="Pages" value={domain.pages.length} />
                        <Meta
                          label="Last crawl"
                          value={
                            latestCrawl
                              ? formatEnum(latestCrawl.status)
                              : "Not started"
                          }
                        />
                      </article>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No domains are attached to this client yet.
                  </div>
                )}
              </div>
            </div>

            <aside className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">Client settings</h3>
                <form action={updateClientAction} className="mt-4 grid gap-3">
                  <input type="hidden" name="clientId" value={client.id} />
                  <input
                    name="name"
                    defaultValue={client.name}
                    className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  />
                  <input
                    name="contactEmail"
                    defaultValue={client.contactEmail ?? ""}
                    placeholder="Contact email"
                    className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  />
                  <input
                    name="logoUrl"
                    defaultValue={client.logoUrl ?? ""}
                    placeholder="Logo URL"
                    className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  />
                  <input
                    name="tags"
                    defaultValue={client.tags ?? ""}
                    placeholder="Tags"
                    className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                  />
                  <select
                    name="crawlFrequency"
                    defaultValue={client.crawlFrequency}
                    className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                  >
                    <option value="MANUAL">Manual</option>
                    <option value="WEEKLY">Weekly</option>
                    <option value="DAILY">Daily</option>
                    <option value="CUSTOM">Custom</option>
                  </select>
                  <textarea
                    name="notes"
                    defaultValue={client.notes ?? ""}
                    rows={3}
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button className="h-10 rounded-md bg-slate-950 px-4 text-sm font-medium text-white">
                    Save client
                  </button>
                </form>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <form action={archiveClientAction}>
                    <input type="hidden" name="clientId" value={client.id} />
                    <button className="h-10 w-full rounded-md border border-slate-200 text-sm font-medium text-slate-700">
                      Archive
                    </button>
                  </form>
                  <form action={deleteClientAction}>
                    <input type="hidden" name="clientId" value={client.id} />
                    <button className="h-10 w-full rounded-md border border-red-200 text-sm font-medium text-red-700">
                      Delete
                    </button>
                  </form>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">Priority issues</h3>
                <div className="mt-4 grid gap-3">
                  {client.issues.length ? (
                    client.issues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/issues/${issue.id}`}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                      >
                        <p className="text-sm font-semibold">{issue.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatEnum(issue.severity)} - {issue.domain.domain}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No open issues.</p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">Recent reports</h3>
                <div className="mt-4 grid gap-3">
                  {client.reports.length ? (
                    client.reports.map((report) => (
                      <div
                        key={report.id}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-sm font-semibold">{report.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatEnum(report.status)} -{" "}
                          {report.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No reports generated yet.
                    </p>
                  )}
                </div>
              </section>
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
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function averageScore(scores: Array<number | null>) {
  const validScores = scores.filter((score): score is number => score !== null);

  if (!validScores.length) {
    return null;
  }

  return Math.round(
    validScores.reduce((total, score) => total + score, 0) / validScores.length,
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

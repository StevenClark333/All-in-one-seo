import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Globe2,
  Mail,
  NotebookText,
} from "lucide-react";
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
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Keep this client easy to manage: confirm their website setup,
              review urgent issues, then send a report when there is progress to
              share.
            </p>
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

          <ClientDetailPlan
            criticalIssues={criticalIssues}
            domainCount={client.domains.length}
            reportCount={client.reports.length}
          />

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Average health" value={averageHealth ?? "Pending"} />
            <Metric label="Websites" value={client.domains.length} />
            <Metric label="Pages checked" value={totalPages} />
            <Metric
              label="Urgent / planned"
              value={`${criticalIssues} / ${warningIssues}`}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div
              id="client-projects"
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">Client websites</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Open a website to review health, recent checks, and fixes.
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
                        <Meta
                          label="Pages checked"
                          value={domain.pages.length}
                        />
                        <Meta
                          label="Last check"
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
                  <EmptyState
                    title="No websites connected"
                    body="Connect this client's first website so the dashboard can begin checking pages and issues."
                  />
                )}
              </div>
            </div>

            <aside className="grid gap-6">
              <section
                id="client-settings"
                className="rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <details>
                  <summary className="p-5">
                    <h3 className="font-semibold">Client settings</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional details for contact, logo, tags, and check
                      rhythm.
                    </p>
                  </summary>
                  <div className="border-t border-slate-200 p-5">
                    <form action={updateClientAction} className="grid gap-3">
                      <input type="hidden" name="clientId" value={client.id} />
                      <input
                        aria-label="Client name"
                        name="name"
                        defaultValue={client.name}
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                      />
                      <input
                        aria-label="Contact email"
                        name="contactEmail"
                        defaultValue={client.contactEmail ?? ""}
                        placeholder="Contact email"
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                      />
                      <input
                        aria-label="Logo URL"
                        name="logoUrl"
                        defaultValue={client.logoUrl ?? ""}
                        placeholder="Logo URL"
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                      />
                      <input
                        aria-label="Tags"
                        name="tags"
                        defaultValue={client.tags ?? ""}
                        placeholder="Tags"
                        className="h-10 rounded-md border border-slate-200 px-3 text-sm"
                      />
                      <select
                        aria-label="Check rhythm"
                        name="crawlFrequency"
                        defaultValue={client.crawlFrequency}
                        className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
                      >
                        <option value="MANUAL">Only when I start it</option>
                        <option value="WEEKLY">Weekly</option>
                        <option value="DAILY">Daily</option>
                        <option value="CUSTOM">Custom rhythm</option>
                      </select>
                      <textarea
                        aria-label="Client notes"
                        name="notes"
                        defaultValue={client.notes ?? ""}
                        rows={3}
                        placeholder="What this client cares about, reporting preferences, or account notes."
                        className="rounded-md border border-slate-200 px-3 py-2 text-sm"
                      />
                      <button className="h-10 rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                        Save client
                      </button>
                    </form>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <form action={archiveClientAction}>
                        <input
                          type="hidden"
                          name="clientId"
                          value={client.id}
                        />
                        <button className="h-10 w-full rounded-md border border-slate-200 text-sm font-medium text-slate-700">
                          Archive
                        </button>
                      </form>
                      <form action={deleteClientAction}>
                        <input
                          type="hidden"
                          name="clientId"
                          value={client.id}
                        />
                        <button className="h-10 w-full rounded-md border border-red-200 text-sm font-medium text-red-700">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </details>
              </section>

              <section
                id="client-issues"
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold">Priority issues</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Start here when the client needs help today.
                </p>
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
                    <EmptyNote
                      title="No priority issues"
                      body="This client does not have urgent open issues right now."
                    />
                  )}
                </div>
              </section>

              <section
                id="client-reports"
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold">Recent reports</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Use client updates to show progress without sending extra
                  technical detail.
                </p>
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
                    <EmptyNote
                      title="No reports yet"
                      body="Generate a client report when there is meaningful progress to share."
                    />
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

function ClientDetailPlan({
  criticalIssues,
  domainCount,
  reportCount,
}: {
  criticalIssues: number;
  domainCount: number;
  reportCount: number;
}) {
  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Client next steps
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Keep this account moving without extra digging.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Check website setup first, then handle urgent issues, then use
            reports to show progress in plain language.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={
              domainCount ? (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              ) : (
                <Globe2 className="size-4" aria-hidden="true" />
              )
            }
            label="Websites"
            value={domainCount ? `${domainCount} connected` : "Connect one"}
            detail="A client needs at least one website before checks can help."
            href="#client-projects"
          />
          <PlanTile
            icon={
              criticalIssues ? (
                <AlertCircle className="size-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )
            }
            label="Issues"
            value={
              criticalIssues ? `${criticalIssues} urgent` : "No urgent issues"
            }
            detail="Open the highest-impact issue before reviewing details."
            href="#client-issues"
          />
          <PlanTile
            icon={<FileText className="size-4" aria-hidden="true" />}
            label="Reports"
            value={reportCount ? `${reportCount} prepared` : "No reports yet"}
            detail="Share progress only when the report has a clear story."
            href="#client-reports"
          />
        </div>
      </div>
    </section>
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
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function PlanTile({
  detail,
  href,
  icon,
  label,
  value,
}: {
  detail: string;
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Link
      href={href}
      className="block rounded-lg border border-orange-100 bg-white p-4 shadow-sm transition hover:border-orange-200"
    >
      <span className="inline-flex size-8 items-center justify-center rounded-md bg-orange-50 text-orange-700">
        {icon}
      </span>
      <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-6 text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{detail}</p>
    </Link>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="p-8 text-center text-sm text-slate-500">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md leading-6">{body}</p>
    </div>
  );
}

function EmptyNote({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 leading-5">{body}</p>
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

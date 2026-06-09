import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  Plus,
  UserRoundPlus,
  UsersRound,
} from "lucide-react";
import { bulkImportClientsAction } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { getClientManagementData } from "@/lib/management-queries";
import { formatWebsiteHealth } from "@/lib/website-display-labels";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { workspace, clients } = await getClientManagementData();
  const clientsWithoutDomains = clients.filter(
    (client) => client.domains.length === 0,
  ).length;
  const clientsWithCriticalIssues = clients.filter((client) =>
    client.issues.some((issue) => issue.severity === "CRITICAL"),
  ).length;
  const clientsWithReports = clients.filter((client) => client.reports.length)
    .length;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Clients" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Clients
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep every client account simple: finish setup, open the client
                that needs attention, and send a clear report when progress is
                ready.
              </p>
            </div>

            <Link
              href="/clients/new"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add client
            </Link>
          </header>

          <ClientCarePlan
            clientsWithCriticalIssues={clientsWithCriticalIssues}
            clientsWithReports={clientsWithReports}
            clientsWithoutDomains={clientsWithoutDomains}
            totalClients={clients.length}
          />

          <section
            id="client-list"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Client list</h3>
              <p className="mt-1 text-sm text-slate-500">
                Open one client to review their websites, today&apos;s attention
                items, and latest report.
              </p>
            </div>

            <div className="grid divide-y divide-slate-100">
              {clients.length ? (
                clients.map((client) => {
                  const critical = client.issues.filter(
                    (issue) => issue.severity === "CRITICAL",
                  ).length;
                  const warnings = client.issues.filter(
                    (issue) => issue.severity === "WARNING",
                  ).length;
                  const avgScore = averageScore(
                    client.domains.map((domain) => domain.healthScore),
                  );
                  const latestReport = client.reports.at(0);

                  return (
                    <article
                      key={client.id}
                      className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_130px_150px_180px]"
                    >
                      <div className="flex gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <UsersRound className="size-5" aria-hidden="true" />
                        </div>
                        <div>
                          <Link
                            href={`/clients/${client.id}`}
                            className="font-semibold underline-offset-4 hover:underline"
                          >
                            {client.name}
                          </Link>
                        <p className="mt-1 text-sm text-slate-500">
                            {client.contactEmail ?? "No contact email"} -{" "}
                            {client.domains.length} website
                            {client.domains.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Health
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          {formatWebsiteHealth(avgScore)}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Needs attention
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          <span className="text-red-600">{critical}</span>
                          <span className="text-slate-400"> / </span>
                          <span className="text-amber-600">{warnings}</span>
                        </p>
                      </div>

                      <div>
                        <p className="text-sm font-medium text-slate-500">
                          Latest report
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          {latestReport
                            ? formatReportStatus(latestReport.status)
                            : "Not prepared yet"}
                        </p>
                      </div>
                    </article>
                  );
                })
              ) : (
                <EmptyState
                  title="No clients yet"
                  body="Add your first client, then connect their website so the dashboard can build a simple care plan."
                />
              )}
            </div>
          </section>

          <section
            id="client-import"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <details>
              <summary className="p-5">
                <h3 className="text-lg font-semibold">
                  Add many clients at once
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Optional for migrations. Most teams can add clients one at a
                  time.
                </p>
              </summary>
              <form
                action={bulkImportClientsAction}
                className="grid gap-3 border-t border-slate-200 p-5"
              >
                <label className="grid gap-2 text-sm font-medium text-slate-700">
                  Client rows
                  <textarea
                    name="clients"
                    rows={4}
                    placeholder="Client name, contact@example.com, tag"
                    className="rounded-md border border-slate-200 px-3 py-2 text-sm font-normal"
                  />
                </label>
                <button className="h-10 w-fit rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                  Import clients
                </button>
              </form>
            </details>
          </section>
        </section>
      </div>
    </main>
  );
}

function ClientCarePlan({
  clientsWithCriticalIssues,
  clientsWithReports,
  clientsWithoutDomains,
  totalClients,
}: {
  clientsWithCriticalIssues: number;
  clientsWithReports: number;
  clientsWithoutDomains: number;
  totalClients: number;
}) {
  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Client care plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Know who needs setup, attention, or a report.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with the client that has no website connected or open urgent
            fixes. Keep the full client table as detail below.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={<UserRoundPlus className="size-4" aria-hidden="true" />}
            label="Setup"
            value={
              clientsWithoutDomains
                ? `${clientsWithoutDomains} need a website`
                : `${totalClients} clients set up`
            }
            detail="Connect a website before SEO checks can begin."
            href="/clients/new"
          />
          <PlanTile
            icon={
              clientsWithCriticalIssues ? (
                <AlertCircle className="size-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )
            }
            label="Attention"
            value={
              clientsWithCriticalIssues
                ? `${clientsWithCriticalIssues} need review`
                : "No urgent clients"
            }
            detail="Open the client with urgent work first."
            href="#client-list"
          />
          <PlanTile
            icon={<FileText className="size-4" aria-hidden="true" />}
            label="Reports"
            value={
              clientsWithReports
                ? `${clientsWithReports} have reports`
                : "No reports yet"
            }
            detail="Send a report when there is progress worth sharing."
            href="#client-list"
          />
        </div>
      </div>
    </section>
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

function averageScore(scores: Array<number | null>) {
  const validScores = scores.filter((score): score is number => score !== null);

  if (!validScores.length) {
    return null;
  }

  return Math.round(
    validScores.reduce((total, score) => total + score, 0) / validScores.length,
  );
}

function formatReportStatus(value: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    FAILED: "Needs review",
    GENERATED: "Ready to share",
    PUBLISHED: "Shared",
  };

  return labels[value] ?? value.toLowerCase();
}

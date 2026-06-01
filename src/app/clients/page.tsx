import Link from "next/link";
import { Plus, UsersRound } from "lucide-react";
import { bulkImportClientsAction } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { getClientManagementData } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const { workspace, clients } = await getClientManagementData();

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
            </div>

            <Link
              href="/clients/new"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add client
            </Link>
          </header>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Agency clients</h3>
              <p className="mt-1 text-sm text-slate-500">
                Client-level ownership, domain counts, issue load, and latest
                reporting status.
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
                            {client.domains.length} domain
                            {client.domains.length === 1 ? "" : "s"}
                          </p>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Health
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          {avgScore ?? "Pending"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Open issues
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          <span className="text-red-600">{critical}</span>
                          <span className="text-slate-400"> / </span>
                          <span className="text-amber-600">{warnings}</span>
                        </p>
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          Latest report
                        </p>
                        <p className="mt-2 text-sm font-medium">
                          {client.reports.at(0)?.status.toLowerCase() ??
                            "Not generated"}
                        </p>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No clients yet. Add the first client to begin agency
                  management.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold">Bulk import</h3>
            <form action={bulkImportClientsAction} className="mt-4 grid gap-3">
              <textarea
                name="clients"
                rows={4}
                placeholder="Client name, contact@example.com, tag"
                className="rounded-md border border-slate-200 px-3 py-2 text-sm"
              />
              <button className="h-10 w-fit rounded-md bg-slate-950 px-4 text-sm font-medium text-white">
                Import clients
              </button>
            </form>
          </section>
        </section>
      </div>
    </main>
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

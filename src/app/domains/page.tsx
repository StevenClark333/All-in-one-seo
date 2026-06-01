import Link from "next/link";
import { Globe2, Play, Plus, Upload } from "lucide-react";
import { bulkImportDomainsAction } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { getDomainManagementData } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

type DomainsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DomainsPage({ searchParams }: DomainsPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = getSingle(params.error);
  const { workspace, domains } = await getDomainManagementData();

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Sites" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Sites and domains
              </h2>
            </div>

            <Link
              href="/domains/new"
              className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add domain
              <InfoTooltip
                label="Register another website under this workspace so it can be verified, crawled, and monitored."
                passive
                side="left"
              />
            </Link>
          </header>

          {error ? (
            <StatusNotice
              tone="error"
              title="Domain action could not finish"
              message={getDomainErrorMessage(error)}
            />
          ) : null}

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="All domains currently managed in this workspace, including ownership and crawl readiness.">
                  Monitored domains
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Domain ownership, platform, crawl readiness, and current issue
                load.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[820px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Domain</th>
                    <th className="px-5 py-3 font-semibold">Client</th>
                    <th className="px-5 py-3 font-semibold">Platform</th>
                    <th className="px-5 py-3 font-semibold">
                      <HelpLabel help="Ownership state. Verified domains can run full production crawls.">
                        Verification
                      </HelpLabel>
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      <HelpLabel help="Pages discovered or crawled for this domain.">
                        Pages
                      </HelpLabel>
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      <HelpLabel help="Critical issue count followed by warning count.">
                        Issues
                      </HelpLabel>
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      <HelpLabel help="Latest crawl run status for this domain.">
                        Last crawl
                      </HelpLabel>
                    </th>
                    <th className="px-5 py-3 font-semibold">
                      <HelpLabel help="Verify ownership or manually start a crawl.">
                        Actions
                      </HelpLabel>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {domains.length ? (
                    domains.map((domain) => {
                      const latestCrawl = domain.crawlRuns.at(0);
                      const critical = domain.issues.filter(
                        (issue) => issue.severity === "CRITICAL",
                      ).length;
                      const warnings = domain.issues.filter(
                        (issue) => issue.severity === "WARNING",
                      ).length;

                      return (
                        <tr key={domain.id}>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                                <Globe2 className="size-4" aria-hidden="true" />
                              </div>
                              <div>
                                <Link
                                  href={`/domains/${domain.id}`}
                                  className="font-medium underline-offset-4 hover:underline"
                                >
                                  {domain.domain}
                                </Link>
                                <p className="text-xs text-slate-500">
                                  Score {domain.healthScore ?? "pending"}
                                  {domain.scoreHistory.at(0)
                                    ? " - updated after latest crawl"
                                    : ""}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {domain.client?.name ?? "Unassigned"}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {formatEnum(domain.platform)}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                                domain.verificationStatus === "VERIFIED"
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                  : "border-amber-200 bg-amber-50 text-amber-700"
                              }`}
                            >
                              {formatEnum(domain.verificationStatus)}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {domain.pages.length.toLocaleString()}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-medium text-red-600">
                              {critical}
                            </span>
                            <span className="text-slate-400"> / </span>
                            <span className="font-medium text-amber-600">
                              {warnings}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {latestCrawl
                              ? formatEnum(latestCrawl.status)
                              : "Not started"}
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex gap-2">
                              <Link
                                href={`/domains/${domain.id}/verification`}
                                className="inline-flex h-9 items-center rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                              >
                                Verify
                              </Link>
                              <form
                                action="/api/domains/start-crawl"
                                method="post"
                              >
                                <input
                                  type="hidden"
                                  name="domainId"
                                  value={domain.id}
                                />
                                <input
                                  type="hidden"
                                  name="returnTo"
                                  value="/domains"
                                />
                                <button
                                  disabled={
                                    domain.verificationStatus !== "VERIFIED"
                                  }
                                  className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                                >
                                  <Play className="size-4" aria-hidden="true" />
                                  Crawl
                                  <InfoTooltip
                                    label="Start a crawler pass for this verified domain and generate fresh SEO findings."
                                    passive
                                    side="left"
                                  />
                                </button>
                              </form>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-slate-500"
                        colSpan={8}
                      >
                        No domains yet. Add a domain to start ownership
                        verification.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                <Upload className="size-4" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="Add many domains at once using one row per site with optional client, platform, and cadence.">
                    Bulk import domains
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Add one domain per line as domain, client name, platform,
                  crawl cadence.
                </p>
              </div>
            </div>
            <form action={bulkImportDomainsAction} className="mt-4 grid gap-3">
              <textarea
                name="domains"
                required
                rows={4}
                placeholder="example.com, Acme Co, WordPress, Weekly"
                className="rounded-md border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
              <div className="flex justify-end">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Import domains
                </button>
              </div>
            </form>
          </section>
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

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getDomainErrorMessage(error: string) {
  const messages: Record<string, string> = {
    "crawl-failed":
      "The crawl request was captured, but the crawler could not finish this site from local development.",
    "crawl-invalid": "The crawl request was missing a valid domain.",
    "crawl-not-verified": "Verify the domain before starting a full crawl.",
    "crawl-page-limit":
      "This workspace has reached its page crawl limit for the current plan.",
    "crawl-plan-limit":
      "This crawl cadence is not available on the current workspace plan.",
    "domain-access": "You do not have access to that domain.",
  };

  return messages[error] ?? "Please try again or inspect the domain settings.";
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

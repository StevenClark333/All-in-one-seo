import Link from "next/link";
import { notFound } from "next/navigation";
import { Archive, ArrowLeft, Play, ShieldCheck, Trash2 } from "lucide-react";
import {
  archiveDomainAction,
  deleteDomainAction,
  updateDomainAction,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { getDomainDetailData } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

type DomainDetailPageProps = {
  params: Promise<{ domainId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const platforms = [
  "WORDPRESS",
  "SHOPIFY",
  "WEBFLOW",
  "WIX",
  "SQUARESPACE",
  "CUSTOM",
  "UNKNOWN",
];

const crawlFrequencies = ["WEEKLY", "DAILY", "MANUAL"];

export default async function DomainDetailPage({
  params,
  searchParams,
}: DomainDetailPageProps) {
  const { domainId } = await params;
  const query = searchParams ? await searchParams : {};
  const error = getSingle(query.error);
  const { workspace, clients, domain } = await getDomainDetailData(domainId);

  if (!domain) {
    notFound();
  }

  const latestCrawl = domain.crawlRuns.at(0);
  const latestVerification = domain.verifications.at(0);
  const latestScore = domain.scoreHistory.at(0);
  const scriptSrc = process.env.NEXT_PUBLIC_SCRIPT_URL ?? "/seo.js";
  const scriptSnippet = `<script async src="${scriptSrc}" data-site-id="${domain.id}"></script>`;
  const criticalIssues = domain.issues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;
  const warningIssues = domain.issues.filter(
    (issue) => issue.severity === "WARNING",
  ).length;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <AppSidebar active="Sites" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/domains"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Sites
            </Link>
            <Link
              href={`/domains/${domain.id}/verification`}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Verification
              <InfoTooltip
                label="Open setup instructions and ownership checks for this domain."
                passive
                side="left"
              />
            </Link>
          </div>

          <header className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"} -{" "}
                {domain.client?.name ?? "Unassigned client"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                {domain.domain}
              </h2>
            </div>

            <form action="/api/domains/start-crawl" method="post">
              <input type="hidden" name="domainId" value={domain.id} />
              <input
                type="hidden"
                name="returnTo"
                value={`/domains/${domain.id}`}
              />
              <button
                disabled={domain.verificationStatus !== "VERIFIED"}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Play className="size-4" aria-hidden="true" />
                Run crawl
                <InfoTooltip
                  label="Run a fresh crawl to collect metadata, links, schema, robots.txt, sitemap, and issue changes."
                  passive
                  side="left"
                />
              </button>
            </form>
          </header>

          {error ? (
            <StatusNotice
              title="Crawl could not finish"
              message={getDomainErrorMessage(error)}
            />
          ) : null}

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric
              help="Current SEO health score calculated from site issues and crawl signals."
              label="Health"
              value={domain.healthScore ?? "Pending"}
            />
            <Metric
              help="Known URLs for this domain from crawler discovery and snapshots."
              label="Pages"
              value={domain.pages.length}
            />
            <Metric
              help="Critical problems first, warnings second. Use this to prioritize work."
              label="Critical / warnings"
              value={`${criticalIssues} / ${warningIssues}`}
            />
            <Metric
              help="Most recent crawl run state for this domain."
              label="Last crawl"
              value={
                latestCrawl ? formatEnum(latestCrawl.status) : "Not started"
              }
            />
          </section>

          {latestScore ? (
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Human-readable reasons behind the latest health score.">
                  Score explanation
                </HelpLabel>
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {readScoreReasons(latestScore.reasonsJson).map((reason) => (
                  <div
                    key={reason}
                    className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="Crawled page inventory with status codes, titles, issues, and last crawl dates.">
                    Pages
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Latest crawled pages with metadata, issue load, and status
                  code.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">URL</th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="HTTP status captured during the latest snapshot.">
                          Status
                        </HelpLabel>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Page title found in the latest crawled HTML.">
                          Title
                        </HelpLabel>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Number of open SEO issues attached to this page.">
                          Issues
                        </HelpLabel>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Date this page was last crawled.">
                          Crawled
                        </HelpLabel>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {domain.pages.length ? (
                      domain.pages.map((page) => {
                        const snapshot = page.snapshots.at(0);

                        return (
                          <tr key={page.id}>
                            <td className="px-5 py-4">
                              <Link
                                href={`/pages/${page.id}`}
                                className="font-medium underline-offset-4 hover:underline"
                              >
                                {page.url}
                              </Link>
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {snapshot?.statusCode ?? "Pending"}
                            </td>
                            <td className="max-w-[280px] truncate px-5 py-4 text-slate-600">
                              {snapshot?.title ?? "Missing"}
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {page.issues.length}
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {page.lastCrawledAt
                                ? page.lastCrawledAt.toLocaleDateString()
                                : "Pending"}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          className="px-5 py-8 text-center text-slate-500"
                          colSpan={5}
                        >
                          No pages crawled yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Operational settings that control ownership grouping, CMS context, and crawl frequency.">
                    Domain settings
                  </HelpLabel>
                </h3>
                <form action={updateDomainAction} className="mt-4 grid gap-4">
                  <input type="hidden" name="domainId" value={domain.id} />
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Client
                    </span>
                    <select
                      name="clientId"
                      defaultValue={domain.clientId ?? ""}
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    >
                      <option value="">Unassigned</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      Platform
                    </span>
                    <select
                      name="platform"
                      defaultValue={domain.platform}
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    >
                      {platforms.map((platform) => (
                        <option key={platform} value={platform}>
                          {formatEnum(platform)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-700">
                      <HelpLabel help="How often this domain should be recrawled when scheduled crawling is enabled.">
                        Crawl cadence
                      </HelpLabel>
                    </span>
                    <select
                      name="crawlFrequency"
                      defaultValue={domain.crawlFrequency}
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    >
                      {crawlFrequencies.map((frequency) => (
                        <option key={frequency} value={frequency}>
                          {formatEnum(frequency)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                    Save settings
                  </button>
                </form>

                <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5">
                  <Meta
                    help="Whether ownership has been confirmed for this domain."
                    label="Verification"
                    value={formatEnum(domain.verificationStatus)}
                  />
                  <Meta
                    help="Whether the JavaScript monitoring snippet has reported data."
                    label="Script"
                    value={formatEnum(domain.scriptStatus)}
                  />
                  <Meta
                    help="Most recent ownership token created for this domain."
                    label="Latest token"
                    value={latestVerification?.token ?? "No token generated"}
                  />
                </dl>
              </section>

              <section className="rounded-lg border border-red-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold text-red-700">
                  <HelpLabel help="Archive hides a domain from active workflows. Delete permanently removes it and its history.">
                    Domain lifecycle
                  </HelpLabel>
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Archive hides this domain from active dashboards. Delete
                  removes the domain and its crawl history permanently.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <form action={archiveDomainAction}>
                    <input type="hidden" name="domainId" value={domain.id} />
                    <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                      <Archive className="size-4" aria-hidden="true" />
                      Archive
                    </button>
                  </form>
                  <form action={deleteDomainAction}>
                    <input type="hidden" name="domainId" value={domain.id} />
                    <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-red-600 px-4 text-sm font-medium text-white transition hover:bg-red-700">
                      <Trash2 className="size-4" aria-hidden="true" />
                      Delete
                    </button>
                  </form>
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Small JavaScript snippet that collects rendered SEO signals and SPA route changes.">
                    Install script
                  </HelpLabel>
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Add this tag before the closing head tag to capture rendered
                  SEO signals, SPA route changes, and Core Web Vitals.
                </p>
                <code className="mt-4 block break-all rounded-md border border-slate-200 bg-slate-950 p-3 font-mono text-xs leading-6 text-white">
                  {scriptSnippet}
                </code>
                <dl className="mt-4 grid gap-4">
                  <Meta
                    help="Unique domain identifier used by the monitoring script."
                    label="Site ID"
                    value={domain.id}
                  />
                  <Meta
                    help="Whether the install script has sent any page data for this domain."
                    label="Status"
                    value={formatEnum(domain.scriptStatus)}
                  />
                </dl>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Robots.txt, sitemap, and other crawl artifacts collected before page analysis.">
                    Recent artifacts
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  {domain.artifacts.length ? (
                    domain.artifacts.map((artifact) => (
                      <div
                        key={artifact.id}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-sm font-semibold">
                          {formatEnum(artifact.type)}
                        </p>
                        <p className="mt-1 truncate text-xs text-slate-500">
                          {artifact.url}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No crawl artifacts collected yet.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Highest-priority issues detected for this domain.">
                    Priority issues
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  {domain.issues.length ? (
                    domain.issues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/issues/${issue.id}`}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                      >
                        <p className="text-sm font-semibold">{issue.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatEnum(issue.severity)} -{" "}
                          {issue.page?.url ?? "Site-level"}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No open issues.</p>
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
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Meta({
  help,
  label,
  value,
}: {
  help: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        <HelpLabel help={help}>{label}</HelpLabel>
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function readScoreReasons(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "reasons" in value &&
    Array.isArray(value.reasons)
  ) {
    return value.reasons.filter(
      (reason): reason is string => typeof reason === "string",
    );
  }

  return ["No score reasons were recorded for this run."];
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
      "The crawler could not complete this site from local development. The failed crawl run is recorded when one is created.",
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

function StatusNotice({ message, title }: { message: string; title: string }) {
  return (
    <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6">{message}</p>
    </div>
  );
}

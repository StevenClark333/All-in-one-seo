import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Play,
  ShieldCheck,
  Trash2,
} from "lucide-react";
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
  const isVerified =
    domain.verificationStatus === "VERIFIED" ||
    domain.verifications.some(
      (verification) => verification.status === "VERIFIED",
    );
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
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Sites" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/domains"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Projects
            </Link>
            <Link
              href={`/domains/${domain.id}/workspace`}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700"
            >
              Project workspace
              <InfoTooltip
                label="Open the domain-scoped workspace for pages, issues, fixes, reports, and integrations."
                passive
                side="left"
              />
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
                {workspace?.name ?? "Workspace"} ·{" "}
                {domain.client?.name ?? "Unassigned client"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                {domain.domain}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep this project simple: finish setup, run a crawl, then open
                the problem that matters most.
              </p>
            </div>

            <form action="/api/domains/start-crawl" method="post">
              <input type="hidden" name="domainId" value={domain.id} />
              <input
                type="hidden"
                name="returnTo"
                value={`/domains/${domain.id}`}
              />
              <button
                disabled={!isVerified}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
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

          <ProjectDetailPlan
            criticalIssues={criticalIssues}
            isVerified={isVerified}
            pageCount={domain.pages.length}
            warningIssues={warningIssues}
          />

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

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div
              id="project-pages"
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
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
                  <thead className="bg-slate-50 text-sm text-slate-500">
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
                          No pages crawled yet. Run the first crawl after
                          verification to see page health here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <aside className="grid gap-6">
              <section
                id="project-settings"
                className="rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <details>
                  <summary className="p-5">
                    <h3 className="font-semibold">
                      <HelpLabel help="Operational settings that control ownership grouping, CMS context, and crawl frequency.">
                        Project details
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional setup details for client, platform, crawl rhythm,
                      and install status.
                    </p>
                  </summary>
                  <div className="border-t border-slate-200 p-5">
                    <form action={updateDomainAction} className="grid gap-4">
                      <input type="hidden" name="domainId" value={domain.id} />
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          Client or brand
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
                          Website platform
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
                          <HelpLabel help="How often this project should be recrawled when scheduled crawling is enabled.">
                            Crawl rhythm
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

                      <button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                        Save project details
                      </button>
                    </form>

                    <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5">
                      <Meta
                        help="Whether ownership has been confirmed for this project."
                        label="Verification"
                        value={
                          isVerified
                            ? "Verified"
                            : formatEnum(domain.verificationStatus)
                        }
                      />
                      <Meta
                        help="Whether the JavaScript monitoring snippet has reported data."
                        label="Script"
                        value={formatEnum(domain.scriptStatus)}
                      />
                      <Meta
                        help="Most recent ownership token created for this project."
                        label="Latest token"
                        value={latestVerification?.token ?? "No token generated"}
                      />
                    </dl>
                  </div>
                </details>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <details>
                  <summary className="p-5">
                    <h3 className="font-semibold text-slate-800">
                      <HelpLabel help="Archive hides a project from active workflows. Delete permanently removes it and its history.">
                        Project lifecycle
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional controls for archiving or deleting this project.
                    </p>
                  </summary>
                  <div className="border-t border-slate-200 p-5">
                    <p className="text-sm leading-6 text-slate-500">
                      Archive hides this project from active dashboards. Delete
                      removes the project and its crawl history permanently.
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
                        <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50">
                          <Trash2 className="size-4" aria-hidden="true" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </details>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <details>
                  <summary className="p-5">
                    <h3 className="font-semibold">
                      <HelpLabel help="Small JavaScript snippet that collects rendered SEO signals and SPA route changes.">
                        Install script
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional tracking tag for rendered SEO signals.
                    </p>
                  </summary>
                  <div className="border-t border-slate-200 p-5">
                    <p className="text-sm leading-6 text-slate-500">
                      Add this tag before the closing head tag to capture
                      rendered SEO signals, SPA route changes, and Core Web
                      Vitals.
                    </p>
                    <code className="mt-4 block break-all rounded-md border border-slate-200 bg-slate-950 p-3 font-mono text-xs leading-6 text-white">
                      {scriptSnippet}
                    </code>
                    <dl className="mt-4 grid gap-4">
                      <Meta
                        help="Unique project identifier used by the monitoring script."
                        label="Site ID"
                        value={domain.id}
                      />
                      <Meta
                        help="Whether the install script has sent any page data for this project."
                        label="Status"
                        value={formatEnum(domain.scriptStatus)}
                      />
                    </dl>
                  </div>
                </details>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <details>
                  <summary className="p-5">
                    <h3 className="font-semibold">
                      <HelpLabel help="Robots.txt, sitemap, and other crawl artifacts collected before page analysis.">
                        Crawl files
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional robots.txt and sitemap files from the last crawl.
                    </p>
                  </summary>
                  <div className="grid gap-3 border-t border-slate-200 p-5">
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
                      <EmptyNote
                        title="No crawl files yet"
                        body="Run a crawl to collect robots.txt, sitemap, and similar setup files."
                      />
                    )}
                  </div>
                </details>
              </section>

              <section
                id="project-issues"
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
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
                          {formatEnum(issue.severity)} ·{" "}
                          {issue.page?.url ?? "Site-level"}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <EmptyNote
                      title="No open issues"
                      body="This project does not have priority issues right now."
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

function ProjectDetailPlan({
  criticalIssues,
  isVerified,
  pageCount,
  warningIssues,
}: {
  criticalIssues: number;
  isVerified: boolean;
  pageCount: number;
  warningIssues: number;
}) {
  const issueCount = criticalIssues + warningIssues;

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Project care plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Finish setup, crawl, then fix the clearest problem.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with verification if the website is new. Once it is verified,
            run a crawl and open the highest-priority issue.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={<ShieldCheck className="size-4" aria-hidden="true" />}
            label="Setup"
            value={isVerified ? "Verified" : "Verify first"}
            detail="Ownership must be confirmed before a full crawl can run."
            href="#project-settings"
          />
          <PlanTile
            icon={<Play className="size-4" aria-hidden="true" />}
            label="Crawl"
            value={pageCount ? `${pageCount} pages found` : "Run first crawl"}
            detail="A crawl collects pages, metadata, links, and issue signals."
            href="#project-pages"
          />
          <PlanTile
            icon={
              issueCount ? (
                <FileText className="size-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )
            }
            label="Problems"
            value={issueCount ? `${issueCount} need review` : "Nothing urgent"}
            detail="Open priority issues after the crawl finishes."
            href="#project-issues"
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
    <a
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
    </a>
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
      <p className="text-sm font-medium text-slate-500">
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
      <dt className="text-sm font-medium text-slate-500">
        <HelpLabel help={help}>{label}</HelpLabel>
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{value}</dd>
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

import React from "react";
import Link from "next/link";
import {
  FileText,
  Globe2,
  Play,
  Plus,
  Search,
  Settings,
  Upload,
} from "lucide-react";
import { bulkImportDomainsAction } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { getDomainManagementData } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

type DomainsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type DomainProject = Awaited<
  ReturnType<typeof getDomainManagementData>
>["domains"][number];

type ProjectMetrics = {
  crawlability: number | null;
  errors: number;
  fixesPending: number;
  health: number | null;
  https: number | null;
  internalSeo: number | null;
  latestReportStatus: string | null;
  lastUpdatedAt: Date | null;
  markup: number | null;
  pagesCrawled: number;
  warnings: number;
};

export default async function DomainsPage({ searchParams }: DomainsPageProps) {
  const params = searchParams ? await searchParams : {};
  const error = getSingle(params.error);
  const query = getSingle(params.q)?.trim() ?? "";
  const { workspace, domains } = await getDomainManagementData();
  const visibleDomains = filterDomains(domains, query);
  const groupedDomains = groupDomainsByClient(visibleDomains);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Sites" />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"} / SEO
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Sites and Projects
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Manage every client website from one project table: health,
                crawl coverage, issue load, fixes, and reporting status.
              </p>
            </div>

            <Link
              href="/domains/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add project
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

          <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="All active SEO projects grouped by client, including crawl health, technical issue load, fixes, and report status.">
                    Project audit table
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Search by client, project, or domain, then open the workspace
                  to work inside that website.
                </p>
              </div>

              <form action="/domains" className="relative w-full xl:max-w-sm">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  name="q"
                  defaultValue={query}
                  placeholder="Search project, client, or domain"
                  className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </form>
            </div>

            {visibleDomains.length ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1280px] border-collapse text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    <tr>
                      <TableHead>Project</TableHead>
                      <TableHead>
                        <HelpLabel help="Most recent crawl completion date, or the latest crawl start if it is still running.">
                          Last update
                        </HelpLabel>
                      </TableHead>
                      <TableHead>
                        <HelpLabel help="Pages crawled in the latest run, falling back to pages currently stored.">
                          Pages crawled
                        </HelpLabel>
                      </TableHead>
                      <TableHead>
                        <HelpLabel help="Current site health score from the latest scoring run.">
                          Site health
                        </HelpLabel>
                      </TableHead>
                      <TableHead>Errors</TableHead>
                      <TableHead>Warnings</TableHead>
                      <TableHead>
                        <HelpLabel help="Share of crawled pages that returned a usable status and were not marked noindex.">
                          Crawlability
                        </HelpLabel>
                      </TableHead>
                      <TableHead>HTTPS</TableHead>
                      <TableHead>
                        <HelpLabel help="Estimated internal SEO health based on internal link and sitemap-related issues.">
                          Internal SEO
                        </HelpLabel>
                      </TableHead>
                      <TableHead>
                        <HelpLabel help="Share of crawled pages where schema or structured data was detected.">
                          Markup
                        </HelpLabel>
                      </TableHead>
                      <TableHead>Fixes</TableHead>
                      <TableHead>Reports</TableHead>
                      <TableHead>Actions</TableHead>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {groupedDomains.map((group) => (
                      <React.Fragment key={group.clientName}>
                        <tr className="bg-slate-50/70">
                          <td
                            colSpan={13}
                            className="px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500"
                          >
                            {group.clientName}
                            <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-400">
                              {group.domains.length}{" "}
                              {group.domains.length === 1
                                ? "project"
                                : "projects"}
                            </span>
                          </td>
                        </tr>
                        {group.domains.map((domain) => {
                          const metrics = getProjectMetrics(domain);
                          const isVerified = isDomainVerified(domain);

                          return (
                            <tr
                              key={domain.id}
                              className="align-middle transition hover:bg-slate-50/80"
                            >
                              <td className="px-5 py-4">
                                <div className="flex min-w-0 items-start gap-3">
                                  <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                                    <Globe2
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <Link
                                      href={`/domains/${domain.id}/workspace`}
                                      className="font-semibold text-blue-700 underline-offset-4 hover:underline"
                                    >
                                      {domain.domain}
                                    </Link>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                      <span>{formatEnum(domain.platform)}</span>
                                      <span aria-hidden="true">/</span>
                                      <StatusPill
                                        tone={
                                          isVerified ? "success" : "warning"
                                        }
                                      >
                                        {isVerified
                                          ? "Verified"
                                          : formatEnum(
                                              domain.verificationStatus,
                                            )}
                                      </StatusPill>
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-4 text-slate-600">
                                {metrics.lastUpdatedAt
                                  ? formatDate(metrics.lastUpdatedAt)
                                  : "Not started"}
                              </td>
                              <td className="px-4 py-4">
                                <span className="font-medium text-slate-900">
                                  {metrics.pagesCrawled.toLocaleString()}
                                </span>
                                <span className="text-slate-400">
                                  {" "}
                                  / {domain.pages.length.toLocaleString()}
                                </span>
                              </td>
                              <td className="px-4 py-4">
                                <ScoreValue value={metrics.health} />
                              </td>
                              <td className="px-4 py-4 font-medium text-red-600">
                                {metrics.errors}
                              </td>
                              <td className="px-4 py-4 font-medium text-amber-600">
                                {metrics.warnings}
                              </td>
                              <td className="px-4 py-4">
                                <PercentValue value={metrics.crawlability} />
                              </td>
                              <td className="px-4 py-4">
                                <PercentValue value={metrics.https} />
                              </td>
                              <td className="px-4 py-4">
                                <PercentValue value={metrics.internalSeo} />
                              </td>
                              <td className="px-4 py-4">
                                <PercentValue value={metrics.markup} />
                              </td>
                              <td className="px-4 py-4">
                                <Link
                                  href={`/fix-center?domainId=${domain.id}`}
                                  className="font-medium text-blue-700 underline-offset-4 hover:underline"
                                >
                                  {metrics.fixesPending}
                                </Link>
                              </td>
                              <td className="px-4 py-4">
                                <Link
                                  href={`/reports?domainId=${domain.id}`}
                                  className="font-medium text-blue-700 underline-offset-4 hover:underline"
                                >
                                  {metrics.latestReportStatus
                                    ? formatEnum(metrics.latestReportStatus)
                                    : "Create"}
                                </Link>
                              </td>
                              <td className="px-4 py-4">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/domains/${domain.id}/workspace`}
                                    className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800"
                                  >
                                    Open
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
                                    <IconButton
                                      disabled={!isVerified}
                                      label="Run crawl"
                                      type="submit"
                                    >
                                      <Play
                                        className="size-4"
                                        aria-hidden="true"
                                      />
                                    </IconButton>
                                  </form>
                                  <IconLink
                                    href={`/reports?domainId=${domain.id}`}
                                    label="Create report"
                                  >
                                    <FileText
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                  </IconLink>
                                  <IconLink
                                    href={`/domains/${domain.id}`}
                                    label="Settings"
                                  >
                                    <Settings
                                      className="size-4"
                                      aria-hidden="true"
                                    />
                                  </IconLink>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="px-5 py-10 text-center text-sm text-slate-500">
                {domains.length
                  ? "No projects match that search."
                  : "No domains yet. Add a project to start ownership verification."}
              </div>
            )}
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

function filterDomains(domains: DomainProject[], query: string) {
  if (!query) {
    return domains;
  }

  const normalizedQuery = query.toLowerCase();

  return domains.filter((domain) =>
    [
      domain.domain,
      domain.client?.name,
      domain.platform,
      domain.verificationStatus,
    ]
      .filter(Boolean)
      .some((value) => value?.toLowerCase().includes(normalizedQuery)),
  );
}

function groupDomainsByClient(domains: DomainProject[]) {
  const groups = new Map<string, DomainProject[]>();

  for (const domain of domains) {
    const clientName = domain.client?.name ?? "Unassigned";
    groups.set(clientName, [...(groups.get(clientName) ?? []), domain]);
  }

  return Array.from(groups.entries()).map(([clientName, groupedDomains]) => ({
    clientName,
    domains: groupedDomains,
  }));
}

function getProjectMetrics(domain: DomainProject): ProjectMetrics {
  const latestCrawl = domain.crawlRuns.at(0);
  const errors = domain.issues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;
  const warnings = domain.issues.filter(
    (issue) => issue.severity === "WARNING",
  ).length;
  const internalIssueCount = domain.issues.filter((issue) =>
    isInternalSeoIssue(issue.issueType),
  ).length;
  const pagesWithSnapshots = domain.pages.filter(
    (page) => page.snapshots.length > 0,
  );
  const crawlablePages = pagesWithSnapshots.filter((page) => {
    const snapshot = page.snapshots.at(0);
    const robotsDirective = snapshot?.robotsDirective?.toLowerCase() ?? "";

    return (
      Boolean(snapshot) &&
      Number(snapshot?.statusCode) < 400 &&
      !robotsDirective.includes("noindex")
    );
  }).length;
  const httpsPages = domain.pages.filter((page) =>
    page.url.toLowerCase().startsWith("https://"),
  ).length;
  const pagesWithMarkup = pagesWithSnapshots.filter((page) =>
    hasStructuredData(page.snapshots.at(0)?.metadataJson),
  ).length;
  const fixesPending = domain.linkFixSuggestions.filter(
    (fix) =>
      fix.status === "APPROVED" ||
      fix.status === "EXPORTED" ||
      (fix.status === "APPLIED" && fix.verificationStatus !== "VERIFIED_FIXED"),
  ).length;
  const latestReport = domain.reports.at(0);

  return {
    crawlability: pagesWithSnapshots.length
      ? Math.round((crawlablePages / pagesWithSnapshots.length) * 100)
      : null,
    errors,
    fixesPending,
    health: domain.healthScore ?? domain.scoreHistory.at(0)?.score ?? null,
    https: domain.pages.length
      ? Math.round((httpsPages / domain.pages.length) * 100)
      : null,
    internalSeo: domain.pages.length
      ? Math.max(0, 100 - internalIssueCount * 12)
      : null,
    latestReportStatus: latestReport?.status ?? null,
    lastUpdatedAt:
      latestCrawl?.completedAt ?? latestCrawl?.createdAt ?? domain.updatedAt,
    markup: pagesWithSnapshots.length
      ? Math.round((pagesWithMarkup / pagesWithSnapshots.length) * 100)
      : null,
    pagesCrawled:
      latestCrawl?.pagesCrawled ??
      latestCrawl?.pagesDiscovered ??
      domain.pages.length,
    warnings,
  };
}

function isDomainVerified(domain: DomainProject) {
  return (
    domain.verificationStatus === "VERIFIED" || domain.verifications.length > 0
  );
}

function isInternalSeoIssue(issueType: string) {
  return (
    issueType.startsWith("deep_page:") ||
    issueType.startsWith("sitemap_url_not_internally_linked:") ||
    issueType.startsWith("internally_linked_url_missing_from_sitemap:") ||
    issueType.includes("internal_link") ||
    issueType.includes("sitemap")
  );
}

function hasStructuredData(metadataJson: unknown) {
  if (!metadataJson || typeof metadataJson !== "object") {
    return false;
  }

  const metadata = metadataJson as Record<string, unknown>;
  const schemaCount = metadata.schemaCount;
  const schemaTypes = metadata.schemaTypes;
  const jsonLdCount = metadata.jsonLdCount;

  return (
    (typeof schemaCount === "number" && schemaCount > 0) ||
    (typeof jsonLdCount === "number" && jsonLdCount > 0) ||
    (Array.isArray(schemaTypes) && schemaTypes.length > 0)
  );
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(value);
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

function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="whitespace-nowrap px-4 py-3 first:pl-5 last:pr-5">
      {children}
    </th>
  );
}

function ScoreValue({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-slate-400">Pending</span>;
  }

  const tone =
    value >= 85
      ? "text-emerald-700"
      : value >= 65
        ? "text-amber-700"
        : "text-red-700";

  return <span className={`font-semibold ${tone}`}>{value}%</span>;
}

function PercentValue({ value }: { value: number | null }) {
  if (value === null) {
    return <span className="text-slate-400">Pending</span>;
  }

  return <span className="font-medium text-slate-800">{value}%</span>;
}

function StatusPill({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "success" | "warning";
}) {
  const styles =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : "border-amber-200 bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] font-semibold ${styles}`}
    >
      {children}
    </span>
  );
}

function IconButton({
  children,
  disabled,
  label,
  type,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  label: string;
  type: "button" | "submit";
}) {
  return (
    <button
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:bg-slate-100 disabled:text-slate-300"
      disabled={disabled}
      title={label}
      type={type}
    >
      {children}
    </button>
  );
}

function IconLink({
  children,
  href,
  label,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <Link
      aria-label={label}
      className="inline-flex size-9 items-center justify-center rounded-md border border-slate-300 bg-white text-slate-700 transition hover:bg-slate-50"
      href={href}
      title={label}
    >
      {children}
    </Link>
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

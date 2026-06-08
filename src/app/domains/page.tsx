import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  FileText,
  Globe2,
  HeartPulse,
  Play,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { bulkImportDomainsAction } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { EmptyState } from "@/components/empty-state";
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
  const projectSnapshots = domains.map((domain) => ({
    domain,
    isVerified: isDomainVerified(domain),
    metrics: getProjectMetrics(domain),
  }));
  const visibleProjectSnapshots = visibleDomains.map((domain) => ({
    domain,
    isVerified: isDomainVerified(domain),
    metrics: getProjectMetrics(domain),
  }));
  const projectsNeedingCare = projectSnapshots.filter(
    ({ metrics }) =>
      metrics.errors > 0 || metrics.health === null || metrics.health < 75,
  ).length;
  const unverifiedProjects = projectSnapshots.filter(
    ({ isVerified }) => !isVerified,
  ).length;
  const readyProjects = visibleProjectSnapshots.filter(
    ({ isVerified, metrics }) =>
      isVerified && metrics.health !== null && metrics.errors === 0,
  ).length;
  const priorityProjectSnapshots = [...visibleProjectSnapshots]
    .sort(compareProjectRisk)
    .slice(0, 6);
  const hiddenProjectCount = Math.max(
    0,
    visibleProjectSnapshots.length - priorityProjectSnapshots.length,
  );
  const topProject = [...projectSnapshots].sort(compareProjectRisk).at(0);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Sites" />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"} / Websites
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Projects
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Keep each website moving with a simple health check, a clear
                next action, and deeper detail only when you need it.
              </p>
            </div>

            <Link
              href="/domains/new"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700"
            >
              <Plus className="size-4" aria-hidden="true" />
              Add website
              <InfoTooltip
                label="Add another website so it can be verified, checked, and watched."
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

          <ProjectCarePlan
            projectsNeedingCare={projectsNeedingCare}
            readyProjects={readyProjects}
            topProjectDomain={topProject?.domain.domain}
            topProjectHealth={topProject?.metrics.health}
            unverifiedProjects={unverifiedProjects}
            visibleCount={visibleDomains.length}
          />

          {priorityProjectSnapshots.length ? (
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-700">
                    Website shortlist
                  </p>
                  <h3 className="mt-1 text-xl font-semibold tracking-normal">
                    Open these websites first
                  </h3>
                  <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
                    Sorted by setup needs, urgent problems, and lower health
                    so you do not have to scan the full table.
                  </p>
                </div>
                {hiddenProjectCount > 0 ? (
                  <a
                    href="#project-details"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-orange-200 bg-orange-50 px-4 text-sm font-semibold text-orange-700 transition hover:bg-orange-100"
                  >
                    Show {hiddenProjectCount} more
                  </a>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {priorityProjectSnapshots.map(
                  ({ domain, isVerified, metrics }) => (
                    <ProjectSummaryCard
                      key={domain.id}
                      domain={domain.domain}
                      errors={metrics.errors}
                      health={metrics.health}
                      href={`/domains/${domain.id}/workspace`}
                      isVerified={isVerified}
                      lastUpdatedAt={metrics.lastUpdatedAt}
                    />
                  ),
                )}
              </div>
            </section>
          ) : null}

          <details
            id="project-details"
            className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <summary className="flex items-center justify-between gap-4 p-5">
              <div>
                <h3 className="text-lg font-semibold">More website detail</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Optional full table for searching, comparing, and reporting
                  across all websites.
                </p>
              </div>
              <span className="shrink-0 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                Open table
              </span>
            </summary>

            <div className="border-t border-slate-200">
              <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-center xl:justify-between">
                <p className="max-w-2xl text-sm leading-6 text-slate-500">
                  Search by client, website, or platform only when you want the
                  complete website list.
                </p>

                <form action="/domains" className="relative w-full xl:max-w-sm">
                  <Search
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                    aria-hidden="true"
                  />
                  <input
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Search website, client, or platform"
                    className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                </form>
              </div>

              {visibleDomains.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1740px] table-fixed border-collapse text-left text-sm">
                    <colgroup>
                      <col className="w-[320px]" />
                      <col className="w-[150px]" />
                      <col className="w-[150px]" />
                      <col className="w-[130px]" />
                      <col className="w-[100px]" />
                      <col className="w-[120px]" />
                      <col className="w-[160px]" />
                      <col className="w-[100px]" />
                      <col className="w-[150px]" />
                      <col className="w-[110px]" />
                      <col className="w-[90px]" />
                      <col className="w-[130px]" />
                      <col className="w-[180px]" />
                    </colgroup>
                    <thead className="bg-slate-50 text-sm font-medium text-slate-500">
                      <tr>
                        <TableHead>Website</TableHead>
                        <TableHead>
                          <HelpLabel help="Most recent website check completion date, or the latest check start if it is still running.">
                            Last update
                          </HelpLabel>
                        </TableHead>
                        <TableHead>
                          <HelpLabel help="Pages checked in the latest run, falling back to pages currently stored.">
                            Pages checked
                          </HelpLabel>
                        </TableHead>
                        <TableHead>
                          <HelpLabel help="Current site health score from the latest scoring run.">
                            Site health
                          </HelpLabel>
                        </TableHead>
                        <TableHead>Urgent</TableHead>
                        <TableHead>Planned</TableHead>
                        <TableHead>
                          <HelpLabel help="Share of checked pages that answered normally and were not hidden from Google.">
                            Google access
                          </HelpLabel>
                        </TableHead>
                        <TableHead>HTTPS</TableHead>
                        <TableHead>
                          <HelpLabel help="Estimated page-link health based on internal link and page-list problems.">
                            Page links
                          </HelpLabel>
                        </TableHead>
                        <TableHead>
                          <HelpLabel help="Share of checked pages where helpful Google details were detected.">
                            Google details
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
                              className="px-5 py-3 text-sm font-medium text-slate-500"
                            >
                              {group.clientName}
                              <span className="ml-2 rounded-full bg-white px-2 py-0.5 text-[11px] text-slate-400">
                                {group.domains.length}{" "}
                                {group.domains.length === 1
                                  ? "website"
                                  : "websites"}
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
                                    <div className="min-w-0 flex-1">
                                      <Link
                                        href={`/domains/${domain.id}/workspace`}
                                        className="block truncate font-semibold text-blue-700 underline-offset-4 hover:underline"
                                        title={domain.domain}
                                      >
                                        {domain.domain}
                                      </Link>
                                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                        <span>
                                          {formatEnum(domain.platform)}
                                        </span>
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
                                <td className="whitespace-nowrap px-4 py-4 text-slate-600">
                                  {metrics.lastUpdatedAt
                                    ? formatDate(metrics.lastUpdatedAt)
                                    : "Not started"}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                  <span className="font-medium text-slate-900">
                                    {metrics.pagesCrawled.toLocaleString()}
                                  </span>
                                  <span className="text-slate-400">
                                    {" "}
                                    / {domain.pages.length.toLocaleString()}
                                  </span>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                  <ScoreValue value={metrics.health} />
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 font-medium text-red-600">
                                  {metrics.errors}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 font-medium text-amber-600">
                                  {metrics.warnings}
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                  <PercentValue value={metrics.crawlability} />
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                  <PercentValue value={metrics.https} />
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                  <PercentValue value={metrics.internalSeo} />
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                  <PercentValue value={metrics.markup} />
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                  <Link
                                    href={`/fix-center?domainId=${domain.id}`}
                                    className="font-medium text-blue-700 underline-offset-4 hover:underline"
                                  >
                                    {metrics.fixesPending}
                                  </Link>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                  <Link
                                    href={`/reports?domainId=${domain.id}`}
                                    className="font-medium text-blue-700 underline-offset-4 hover:underline"
                                  >
                                    {metrics.latestReportStatus
                                      ? formatEnum(metrics.latestReportStatus)
                                      : "Create"}
                                  </Link>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4">
                                  <div className="flex items-center gap-2">
                                    <Link
                                      href={`/domains/${domain.id}/workspace`}
                                      className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-orange-600 px-3 text-sm font-medium text-white transition hover:bg-orange-700"
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
                                        label="Check website"
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
                <div className="p-5">
                  <EmptyState
                    action={
                      domains.length ? (
                        <Link
                          href="/domains"
                          className="inline-flex h-10 items-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:bg-orange-50"
                        >
                          Clear search
                        </Link>
                      ) : (
                        <Link
                          href="/domains/new"
                          className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                        >
                          <Plus className="size-4" aria-hidden="true" />
                          Add your first website
                        </Link>
                      )
                    }
                    description={
                      domains.length
                        ? "Try a simpler website, client, or platform name. Your websites are still here."
                        : "Add the website you want to improve. We will guide you through verification, checking, and the first update."
                    }
                    icon={Globe2}
                    title={
                      domains.length
                        ? "No websites match this search"
                        : "Start with one website"
                    }
                  />
                </div>
              )}
            </div>
          </details>

          <section
            id="bulk-import"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <details>
              <summary className="flex items-center gap-3 p-5">
                <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                  <Upload className="size-4" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Add many websites at once using one row per site with optional client, platform, and check rhythm.">
                      Add many websites at once
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Optional for agencies moving a list of websites into the
                    portal.
                  </p>
                </div>
              </summary>
              <div className="border-t border-slate-200 p-5">
                <p className="text-sm leading-6 text-slate-500">
                  Add one website per line as website, client name, platform,
                  check rhythm.
                </p>
                <form
                  action={bulkImportDomainsAction}
                  className="mt-4 grid gap-3"
                >
                  <textarea
                    name="domains"
                    required
                    rows={4}
                    placeholder="example.com, Acme Co, WordPress, Weekly"
                    className="rounded-md border border-slate-300 bg-white px-3 py-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  />
                  <div className="flex justify-end">
                    <button className="inline-flex h-10 items-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                      Import websites
                    </button>
                  </div>
                </form>
              </div>
            </details>
          </section>
        </section>
      </div>
    </main>
  );
}

function ProjectCarePlan({
  projectsNeedingCare,
  readyProjects,
  topProjectDomain,
  topProjectHealth,
  unverifiedProjects,
  visibleCount,
}: {
  projectsNeedingCare: number;
  readyProjects: number;
  topProjectDomain?: string;
  topProjectHealth?: number | null;
  unverifiedProjects: number;
  visibleCount: number;
}) {
  const firstAction =
    unverifiedProjects > 0
      ? `${unverifiedProjects} websites need setup`
      : projectsNeedingCare > 0
        ? `${projectsNeedingCare} websites need care`
        : "Websites look calm";

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Website care plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Start with the website that needs the next step.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep this page simple: set up unverified websites, open the website
            with the lowest health, then use the full table only for deeper
            review.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={<ShieldCheck className="size-4" aria-hidden="true" />}
            label="Do first"
            value={firstAction}
            detail="Setup and health problems come before reporting."
            href="#project-details"
          />
          <PlanTile
            icon={<HeartPulse className="size-4" aria-hidden="true" />}
            label="Watch closely"
            value={topProjectDomain ?? "No websites yet"}
            detail={
              topProjectDomain
                ? topProjectHealth === null || topProjectHealth === undefined
                  ? "Health pending. Open it first if you are unsure."
                  : `Health ${topProjectHealth}%. Open it first if you are unsure.`
                : "Add one website to start watching."
            }
            href="#project-details"
          />
          <PlanTile
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
            label="Ready"
            value={`${readyProjects} of ${visibleCount} websites`}
            detail="Verified websites without urgent problems are the calm group."
            href="#project-details"
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
      className="block rounded-lg border border-orange-100 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:bg-white"
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

function ProjectSummaryCard({
  domain,
  errors,
  health,
  href,
  isVerified,
  lastUpdatedAt,
}: {
  domain: string;
  errors: number;
  health: number | null;
  href: string;
  isVerified: boolean;
  lastUpdatedAt: Date | null;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-orange-200 hover:bg-orange-50/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-slate-950">
            {domain}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            {lastUpdatedAt
              ? `Updated ${formatDate(lastUpdatedAt)}`
              : "Not checked yet"}
          </p>
        </div>
        <StatusPill tone={isVerified ? "success" : "warning"}>
          {isVerified ? "Verified" : "Needs setup"}
        </StatusPill>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="font-medium text-slate-500">Health</p>
          <p className="mt-1 text-xl font-semibold text-slate-950">
            {health === null ? "Pending" : `${health}%`}
          </p>
        </div>
        <div>
          <p className="font-medium text-slate-500">Urgent</p>
          <p
            className={
              errors
                ? "mt-1 text-xl font-semibold text-red-700"
                : "mt-1 text-xl font-semibold text-emerald-700"
            }
          >
            {errors}
          </p>
        </div>
      </div>
    </Link>
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

function compareProjectRisk(
  first: { isVerified: boolean; metrics: ProjectMetrics },
  second: { isVerified: boolean; metrics: ProjectMetrics },
) {
  const firstScore = getProjectRiskScore(first);
  const secondScore = getProjectRiskScore(second);

  return secondScore - firstScore;
}

function getProjectRiskScore({
  isVerified,
  metrics,
}: {
  isVerified: boolean;
  metrics: ProjectMetrics;
}) {
  const healthPenalty =
    metrics.health === null ? 35 : Math.max(0, 90 - metrics.health);

  return (
    (isVerified ? 0 : 60) +
    metrics.errors * 30 +
    metrics.warnings * 8 +
    healthPenalty +
    metrics.fixesPending * 6
  );
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
      "The website check was captured, but it could not finish from local development.",
    "crawl-invalid": "The check request was missing a valid website.",
    "crawl-not-verified": "Verify the website before starting a full check.",
    "crawl-page-limit":
      "This workspace has reached its page-check limit for the current plan.",
    "crawl-plan-limit": "This check rhythm is not available on the current plan.",
    "domain-access": "You do not have access to that website.",
  };

  return messages[error] ?? "Please try again or inspect the website settings.";
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

  const tone =
    value >= 90
      ? "text-emerald-700"
      : value >= 70
        ? "text-amber-700"
        : "text-red-700";

  return <span className={`font-medium ${tone}`}>{value}%</span>;
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

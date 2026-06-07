import { AlertTriangle, CircleDot, Filter, ListChecks } from "lucide-react";
import Link from "next/link";
import { bulkUpdateIssues } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { EmptyState } from "@/components/empty-state";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { getIssueListData, getIssueTypeGroupKey } from "@/lib/issue-queries";
import { buildIssueSolution } from "@/lib/issue-solutions";

export const dynamic = "force-dynamic";

const severityStyles = {
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
  WARNING: "border-amber-200 bg-amber-50 text-amber-700",
  SUGGESTION: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

const statusStyles = {
  OPEN: "border-red-200 bg-red-50 text-red-700",
  IN_PROGRESS: "border-blue-200 bg-blue-50 text-blue-700",
  REAPPEARED: "border-purple-200 bg-purple-50 text-purple-700",
  FIXED: "border-emerald-200 bg-emerald-50 text-emerald-700",
  IGNORED: "border-slate-200 bg-slate-100 text-slate-600",
};

const availabilityStyles = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

type IssuesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const severityOptions = ["CRITICAL", "WARNING", "SUGGESTION"];
const statusOptions = ["OPEN", "IN_PROGRESS", "REAPPEARED", "FIXED", "IGNORED"];

export default async function IssuesPage({ searchParams }: IssuesPageProps) {
  const rawFilters = searchParams ? await searchParams : {};
  const filters = normalizeFilters(rawFilters);
  const {
    workspace,
    issues,
    clients,
    domains,
    members,
    issueTypes,
    templateGroups,
  } = await getIssueListData(filters);
  const issueGroups = issueTypes
    .map((issueType) => ({
      issueType,
      count: issues.filter(
        (issue) => getIssueTypeGroupKey(issue.issueType) === issueType,
      ).length,
    }))
    .filter((group) => group.count > 0);
  const selectedDomain = domains.find(
    (domain) => domain.id === filters.domainId,
  );
  const visibleTemplateGroups = getVisibleTemplateGroups(
    templateGroups,
    filters.templateKey,
  );
  const isShowingAll = filters.show === "all";
  const visibleIssues = isShowingAll ? issues : issues.slice(0, 12);
  const hiddenIssueCount = Math.max(0, issues.length - visibleIssues.length);
  const isCompactQueue = hiddenIssueCount > 0;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Issues" activeDomainId={filters.domainId} />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                SEO issues
              </h2>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <CircleDot className="size-4" aria-hidden="true" />
              {visibleIssues.length}
              {hiddenIssueCount ? ` of ${issues.length}` : ""} shown
              <InfoTooltip
                label="Number of problems currently shown from the matching queue."
                passive
                side="left"
              />
            </div>
          </header>

          <ProjectWorkspaceBar
            active="issues"
            domainId={filters.domainId}
            note="Issue filters and bulk actions are focused on this domain."
            returnPath="/issues"
          />

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Filter className="size-5 text-slate-500" aria-hidden="true" />
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Narrow the issue queue by client, domain, severity, workflow status, owner, type, or template.">
                  Filters
                </HelpLabel>
              </h3>
            </div>

            <form
              action="/issues"
              className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-7"
            >
              <FilterSelect
                label="Client"
                help="Show issues for one client account."
                name="clientId"
                value={filters.clientId}
              >
                <option value="">All clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Domain"
                help="Show issues for one monitored website."
                name="domainId"
                value={filters.domainId}
              >
                <option value="">All domains</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Severity"
                help="Critical issues are urgent, warnings should be planned, suggestions are optimization opportunities."
                name="severity"
                value={filters.severity}
              >
                <option value="">All severities</option>
                {severityOptions.map((severity) => (
                  <option key={severity} value={severity}>
                    {formatEnum(severity)}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Status"
                help="Workflow state for triage, assignment, ignored rules, and completed fixes."
                name="status"
                value={filters.status}
              >
                <option value="">All statuses</option>
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {formatEnum(status)}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Owner"
                help="Filter by the teammate assigned to resolve the issue."
                name="assignedToId"
                value={filters.assignedToId}
              >
                <option value="">All owners</option>
                {members.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.user.name ?? member.user.email}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Type"
                help="Analyzer rule or issue category, such as missing title or broken internal link."
                name="issueType"
                value={filters.issueType}
              >
                <option value="">All types</option>
                {issueTypes.map((issueType) => (
                  <option key={issueType} value={issueType}>
                    {formatIssueType(issueType)}
                  </option>
                ))}
              </FilterSelect>

              <FilterSelect
                label="Template"
                help="Group issues by repeated URL patterns so one route or CMS template can be fixed once."
                name="templateKey"
                value={filters.templateKey}
              >
                <option value="">All templates</option>
                {visibleTemplateGroups.map((group) => (
                  <option key={group.key} value={group.key}>
                    {group.label}
                  </option>
                ))}
              </FilterSelect>

              <div className="flex gap-2 md:col-span-2 xl:col-span-7">
                <button className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  <ListChecks className="size-4" aria-hidden="true" />
                  Apply filters
                  <InfoTooltip
                    label="Refresh the queue using the selected filter values."
                    passive
                    side="left"
                  />
                </button>
                <Link
                  href="/issues"
                  className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Reset
                </Link>
              </div>
            </form>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Analyzer-generated SEO work items across all selected clients, sites, and pages.">
                      {isShowingAll ? "All matching problems" : "Top problems"}
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {isShowingAll
                      ? selectedDomain
                        ? `All analyzer-generated problems for ${selectedDomain.domain}.`
                        : "All analyzer-generated problems across clients, projects, and pages."
                      : selectedDomain
                        ? `Showing the most important problems for ${selectedDomain.domain} first.`
                        : "Showing the most important problems first so you can act without scrolling forever."}
                  </p>
                </div>
                <div className="flex max-w-3xl flex-wrap gap-2">
                  {templateGroups.slice(0, 6).map((group) => (
                    <Link
                      key={group.key}
                      href={`/issues?templateKey=${encodeURIComponent(group.key)}${
                        filters.domainId ? `&domainId=${filters.domainId}` : ""
                      }`}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-white"
                    >
                      {group.label}: {group.issueCount} issues, P
                      {group.priorityScore}
                    </Link>
                  ))}
                  {issueGroups.map((group) => (
                    <Link
                      key={group.issueType}
                      href={`/issues?issueType=${encodeURIComponent(group.issueType)}${
                        filters.domainId ? `&domainId=${filters.domainId}` : ""
                      }`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white"
                    >
                      {formatIssueType(group.issueType)}: {group.count}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {issues.length ? (
              <div className="grid gap-3 border-b border-slate-200 bg-slate-50 p-4 lg:grid-cols-3">
                {visibleIssues.slice(0, 3).map((issue) => {
                  const solution = buildIssueSolution({
                    issueType: issue.issueType,
                    platform: issue.domain.platform,
                    recommendation: issue.recommendation,
                    title: issue.title,
                  });

                  return (
                    <Link
                      key={issue.id}
                      href={getSolutionHref({
                        domainId: issue.domain.id,
                        issueId: issue.id,
                        primaryAction: solution.primaryAction,
                      })}
                      className="rounded-md border border-slate-200 bg-white p-4 transition hover:border-slate-300 hover:shadow-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                        Top solution
                      </p>
                      <h4 className="mt-2 line-clamp-1 text-sm font-semibold">
                        {solution.title}
                      </h4>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {solution.detail}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Why it matters:{" "}
                        </span>
                        {solution.whyMatters}
                      </p>
                      <span
                        className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${availabilityStyles[solution.fixAvailability.tone]}`}
                      >
                        {solution.fixAvailability.label}
                      </span>
                      <span className="mt-3 inline-flex h-8 items-center rounded-md bg-slate-950 px-3 text-xs font-semibold text-white">
                        {solution.actionLabel}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}

            <form action={bulkUpdateIssues}>
              {issues.length ? (
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    {isCompactQueue
                      ? `Showing the top ${visibleIssues.length} problems. ${hiddenIssueCount} lower-priority problems are hidden for now.`
                      : "Select problems to update status in bulk, including ignored rules."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {isCompactQueue ? (
                      <Link
                        href={buildIssuesHref(filters, { show: "all" })}
                        className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-orange-50"
                      >
                        Show all {issues.length}
                      </Link>
                    ) : isShowingAll ? (
                      <Link
                        href={buildIssuesHref(filters, { show: undefined })}
                        className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-orange-50"
                      >
                        Show top problems
                      </Link>
                    ) : null}
                    <select
                      name="status"
                      defaultValue="IN_PROGRESS"
                      className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {formatEnum(status)}
                        </option>
                      ))}
                    </select>
                    <button className="inline-flex h-9 items-center rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800">
                      Update selected
                      <InfoTooltip
                        label="Apply the chosen workflow status to all checked issues."
                        passive
                        side="left"
                      />
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="grid divide-y divide-slate-100">
                {visibleIssues.length ? (
                  visibleIssues.map((issue) => (
                    <IssueRow key={issue.id} issue={issue} />
                  ))
                ) : (
                  <div className="p-5">
                    <EmptyState
                      action={
                        <Link
                          href="/domains"
                          className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
                        >
                          Scan a project
                        </Link>
                      }
                      description="Run a scan on a verified project and we will turn the findings into a short, prioritized problem list."
                      icon={ListChecks}
                      title="No problems in this view"
                    />
                  </div>
                )}
              </div>
            </form>
          </section>
        </section>
      </div>
    </main>
  );
}

function IssueRow({
  issue,
}: {
  issue: Awaited<ReturnType<typeof getIssueListData>>["issues"][number];
}) {
  const solution = buildIssueSolution({
    issueType: issue.issueType,
    platform: issue.domain.platform,
    recommendation: issue.recommendation,
    title: issue.title,
  });

  return (
    <article className="grid gap-4 p-5 xl:grid-cols-[28px_minmax(0,1fr)_minmax(260px,0.75fr)_130px]">
      <div className="pt-1">
        <input
          type="checkbox"
          name="issueId"
          value={issue.id}
          aria-label={`Select ${issue.title}`}
          className="size-4 rounded border-slate-300 text-slate-950 focus:ring-slate-500"
        />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severityStyles[issue.severity]}`}
          >
            {formatEnum(issue.severity)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[issue.status]}`}
          >
            {formatEnum(issue.status)}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            {solution.effort}
          </span>
          <span className="text-xs font-medium text-slate-500">
            <HelpLabel help="Priority blends severity, page importance, and fix impact. Higher numbers should be handled sooner.">
              Priority {issue.priorityScore}
            </HelpLabel>
          </span>
        </div>
        <h4 className="mt-3 font-semibold">{issue.title}</h4>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {issue.description}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {issue.client?.name ?? "Unassigned"} -{" "}
          <Link
            href={`/domains/${issue.domain.id}`}
            className="font-medium text-slate-700 underline-offset-4 hover:underline"
          >
            {issue.domain.domain}
          </Link>
          {issue.page ? ` - ${issue.page.url}` : ""}
        </p>
      </div>

      <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Best next step
          </p>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${availabilityStyles[solution.fixAvailability.tone]}`}
          >
            {solution.fixAvailability.label}
          </span>
        </div>
        <h5 className="mt-2 text-sm font-semibold">{solution.title}</h5>
        <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
          {solution.detail}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">
            Why this matters:{" "}
          </span>
          {solution.whyMatters}
        </p>
      </div>

      <div className="flex items-center xl:justify-end">
        <Link
          href={getSolutionHref({
            domainId: issue.domain.id,
            issueId: issue.id,
            primaryAction: solution.primaryAction,
          })}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800"
        >
          <AlertTriangle className="size-4" aria-hidden="true" />
          {solution.actionLabel}
          <InfoTooltip
            label="Open the fastest path to resolve this issue."
            passive
            side="left"
          />
        </Link>
      </div>
    </article>
  );
}

function FilterSelect({
  children,
  help,
  label,
  name,
  value,
}: {
  children: React.ReactNode;
  help: string;
  label: string;
  name: string;
  value?: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        <HelpLabel help={help}>{label}</HelpLabel>
      </span>
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
      >
        {children}
      </select>
    </label>
  );
}

function normalizeFilters(
  searchParams: Record<string, string | string[] | undefined>,
) {
  return {
    clientId: getSingle(searchParams.clientId),
    domainId: getSingle(searchParams.domainId),
    severity: getSingle(searchParams.severity),
    status: getSingle(searchParams.status),
    assignedToId: getSingle(searchParams.assignedToId),
    issueType: getSingle(searchParams.issueType),
    templateKey: getSingle(searchParams.templateKey),
    show: getSingle(searchParams.show),
  };
}

function getSingle(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value.at(0) || undefined;
  }

  return value || undefined;
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatIssueType(value: string) {
  return getIssueTypeGroupKey(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function buildIssuesHref(
  filters: ReturnType<typeof normalizeFilters>,
  overrides: Partial<ReturnType<typeof normalizeFilters>>,
) {
  const params = new URLSearchParams();
  const nextFilters = { ...filters, ...overrides };

  for (const [key, value] of Object.entries(nextFilters)) {
    if (value) {
      params.set(key, value);
    }
  }

  const query = params.toString();

  return query ? `/issues?${query}` : "/issues";
}

function getVisibleTemplateGroups(
  templateGroups: Awaited<ReturnType<typeof getIssueListData>>["templateGroups"],
  selectedTemplateKey?: string,
) {
  const topGroups = templateGroups.slice(0, 12);

  if (
    selectedTemplateKey &&
    !topGroups.some((group) => group.key === selectedTemplateKey)
  ) {
    const selectedGroup = templateGroups.find(
      (group) => group.key === selectedTemplateKey,
    );

    if (selectedGroup) {
      return [...topGroups, selectedGroup];
    }
  }

  return topGroups;
}

function getSolutionHref({
  domainId,
  issueId,
  primaryAction,
}: {
  domainId: string;
  issueId: string;
  primaryAction: string;
}) {
  if (primaryAction === "fix-center") {
    return `/fix-center?domainId=${domainId}`;
  }

  if (primaryAction === "recommendations") {
    return `/issues/${issueId}`;
  }

  return `/issues/${issueId}`;
}

import { AlertTriangle, CircleDot, Filter, ListChecks } from "lucide-react";
import Link from "next/link";
import { bulkUpdateIssues } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { EmptyState } from "@/components/empty-state";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { getIssueListData, getIssueTypeGroupKey } from "@/lib/issue-queries";
import { buildIssueSolution } from "@/lib/issue-solutions";
import {
  formatProductProblemArea,
  formatProductWorkspaceProblemSeverity,
  PRODUCT_BEGINNER_COPY,
  PRODUCT_GLOBAL_SEARCH_COPY,
} from "@/lib/product-copy";
import { formatWebsiteClient } from "@/lib/website-display-labels";

export const dynamic = "force-dynamic";

const severityStyles = {
  CRITICAL: "border-red-200 bg-red-50 text-red-700",
  WARNING: "border-amber-200 bg-amber-50 text-amber-700",
  SUGGESTION: "border-cyan-200 bg-cyan-50 text-cyan-700",
};

const statusStyles = {
  OPEN: "border-slate-200 bg-white text-slate-700",
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
  const criticalCount = issues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;
  const warningCount = issues.filter(
    (issue) => issue.severity === "WARNING",
  ).length;
  const guidedFixCount = issues.filter((issue) => {
    const solution = buildIssueSolution({
      issueType: issue.issueType,
      platform: issue.domain.platform,
      recommendation: issue.recommendation,
      title: issue.title,
    });

    return (
      solution.primaryAction === "fix-center" ||
      solution.primaryAction === "recommendations"
    );
  }).length;
  const firstIssue = issues.at(0);

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
                Problems
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                Start with the clearest problem and use filters only when you
                want to narrow the list.
              </p>
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
            note="This problem list is focused on the selected website."
            returnPath="/issues"
          />

          <ProblemSolvingPlan
            criticalCount={criticalCount}
            firstIssueTitle={
              firstIssue ? softenProblemTitle(firstIssue.title) : undefined
            }
            guidedFixCount={guidedFixCount}
            issueCount={issues.length}
            warningCount={warningCount}
          />

          <details className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="flex items-center justify-between gap-4 p-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-700">
                  <Filter className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">Refine problem list</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {PRODUCT_BEGINNER_COPY.issuesFilterSummary}
                  </p>
                </div>
              </div>
              <span className="shrink-0 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
                Open filters
              </span>
            </summary>

            <div className="border-t border-slate-200 p-5">
              <form
                action="/issues"
                className="grid gap-3 md:grid-cols-2 xl:grid-cols-7"
              >
                <FilterSelect
                  label="Client"
                  help="Show problems for one client account."
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
                  label="Website"
                  help="Show problems for one monitored website."
                  name="domainId"
                  value={filters.domainId}
                >
                  <option value="">All websites</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.domain}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  label={PRODUCT_BEGINNER_COPY.issuesCareFilterLabel}
                  help={PRODUCT_BEGINNER_COPY.issuesCareFilterHelp}
                  name="severity"
                  value={filters.severity}
                >
                  <option value="">
                    {PRODUCT_BEGINNER_COPY.issuesCareFilterPlaceholder}
                  </option>
                  {severityOptions.map((severity) => (
                    <option key={severity} value={severity}>
                      {getImportanceLabel(severity)}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  label="Status"
                  help="Where this problem is in the fix process."
                  name="status"
                  value={filters.status}
                >
                  <option value="">All progress</option>
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {getProgressLabel(status)}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  label="Owner"
                  help="Filter by the teammate assigned to resolve the problem."
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
                  label={PRODUCT_BEGINNER_COPY.issuesTypeFilterLabel}
                  help={PRODUCT_BEGINNER_COPY.issuesTypeFilterHelp}
                  name="issueType"
                  value={filters.issueType}
                >
                  <option value="">
                    {PRODUCT_BEGINNER_COPY.issuesTypeFilterPlaceholder}
                  </option>
                  {issueTypes.map((issueType) => (
                    <option key={issueType} value={issueType}>
                      {formatIssueType(issueType)}
                    </option>
                  ))}
                </FilterSelect>

                <FilterSelect
                  label="Template"
                  help="Group repeated page patterns so one website template can be fixed once."
                  name="templateKey"
                  value={filters.templateKey}
                >
                  <option value="">All templates</option>
                  {visibleTemplateGroups.map((group) => (
                    <option key={group.key} value={group.key}>
                      {softenProblemTitle(group.label)}
                    </option>
                  ))}
                </FilterSelect>

                <div className="flex gap-2 md:col-span-2 xl:col-span-7">
                  <button className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                    <ListChecks className="size-4" aria-hidden="true" />
                    Show matching problems
                    <InfoTooltip
                      label="Refresh the list using the selected filter values."
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
            </div>
          </details>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Website problems found across the selected clients, websites, and pages.">
                      {isShowingAll ? "All matching problems" : "Top problems"}
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    {isShowingAll
                      ? selectedDomain
                        ? `All website problems for ${selectedDomain.domain}.`
                        : "All website problems across clients, websites, and pages."
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
                      {softenProblemTitle(group.label)}: {group.issueCount}{" "}
                      {pluralize(group.issueCount, "problem")}, priority{" "}
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
              <div className="grid gap-3 border-b border-slate-100 bg-slate-50 p-4 lg:grid-cols-3">
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
                      <p className="text-sm font-semibold text-slate-500">
                        Next best fix
                      </p>
                      <h4 className="mt-2 line-clamp-1 text-sm font-semibold">
                        {softenProblemTitle(solution.title)}
                      </h4>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        {softenProblemText(solution.detail)}
                      </p>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                        <span className="font-semibold text-slate-800">
                          Why it matters:{" "}
                        </span>
                        {softenProblemText(solution.whyMatters)}
                      </p>
                      <span
                        className={`mt-3 inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${availabilityStyles[solution.fixAvailability.tone]}`}
                      >
                        {solution.fixAvailability.label}
                      </span>
                      <span className="mt-3 inline-flex h-8 items-center rounded-md bg-orange-600 px-3 text-xs font-semibold text-white">
                        {getSoftActionLabel(solution.actionLabel)}
                      </span>
                    </Link>
                  );
                })}
              </div>
            ) : null}

            <form action={bulkUpdateIssues}>
              {issues.length ? (
                <div className="grid gap-3 border-b border-slate-100 bg-slate-50 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-medium text-slate-600">
                      {isCompactQueue
                        ? `Showing the top ${visibleIssues.length} problems. ${hiddenIssueCount} lower-priority problems are hidden for now.`
                        : "Showing the current matching problems."}
                    </p>
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
                  </div>

                  <details className="rounded-md border border-slate-200 bg-white">
                    <summary className="flex items-center justify-between gap-3 px-4 py-3">
                      <span>
                        <span className="block text-sm font-semibold text-slate-800">
                          Change several at once
                        </span>
                        <span className="mt-1 block text-sm text-slate-500">
                          Optional team control for selected checkboxes.
                        </span>
                      </span>
                      <span className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-600">
                        Open
                      </span>
                    </summary>
                    <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4">
                      <select
                        name="status"
                        defaultValue="IN_PROGRESS"
                        className="h-9 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {getProgressLabel(status)}
                          </option>
                        ))}
                      </select>
                      <button className="inline-flex h-9 items-center rounded-md bg-orange-600 px-3 text-sm font-medium text-white transition hover:bg-orange-700">
                        Update selected
                        <InfoTooltip
                          label="Apply the chosen status to all checked problems."
                          passive
                          side="left"
                        />
                      </button>
                    </div>
                  </details>
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
                          className="inline-flex h-10 items-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                        >
                          Check a website
                        </Link>
                      }
                      description="Run a website check on a verified website and we will turn the findings into a short, prioritized problem list."
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

function ProblemSolvingPlan({
  criticalCount,
  firstIssueTitle,
  guidedFixCount,
  issueCount,
  warningCount,
}: {
  criticalCount: number;
  firstIssueTitle?: string;
  guidedFixCount: number;
  issueCount: number;
  warningCount: number;
}) {
  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Problem solving plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Fix the clearest problem first.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {PRODUCT_BEGINNER_COPY.issuesPlanBody}
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanCard
            label="Do first"
            value={firstIssueTitle ?? "No open problems"}
            detail={
              firstIssueTitle
                ? "Open this problem and follow the suggested next step."
                : "Run a website check when you are ready to find problems."
            }
          />
          <PlanCard
            label="Guided fixes"
            value={`${guidedFixCount} ready`}
            detail="These problems have a recommended path in this portal."
          />
          <PlanCard
            label={PRODUCT_BEGINNER_COPY.issuesPlanQuickCareLabel}
            value={`${criticalCount} ${PRODUCT_BEGINNER_COPY.issuesPlanQuickCareValueSuffix}`}
            detail={`${warningCount} planned ${pluralize(warningCount, "item")} ${PRODUCT_BEGINNER_COPY.issuesPlanQuickCareDetail}`}
          />
        </div>

        {issueCount ? (
          <p className="rounded-md bg-white px-4 py-3 text-sm leading-6 text-slate-600 xl:col-span-2">
            You have {issueCount} matching problems. The page keeps the most
            {` ${PRODUCT_BEGINNER_COPY.issuesPlanVisibleWorkDetail}`}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function PlanCard({
  detail,
  label,
  value,
}: {
  detail: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-orange-100 bg-white p-4 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 line-clamp-2 text-lg font-semibold leading-6 text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{detail}</p>
    </div>
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
  const problemTitle = softenProblemTitle(issue.title);
  const solutionTitle = softenProblemTitle(solution.title);

  return (
    <article className="grid gap-4 p-5 xl:grid-cols-[28px_minmax(0,1fr)_minmax(260px,0.75fr)_130px]">
      <div className="pt-1">
        <input
          type="checkbox"
          name="issueId"
          value={issue.id}
          aria-label={`Select ${problemTitle}`}
          className="size-4 rounded border-slate-300 text-slate-950 focus:ring-slate-500"
        />
      </div>
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${severityStyles[issue.severity]}`}
          >
            {getImportanceLabel(issue.severity)}
          </span>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${statusStyles[issue.status]}`}
          >
            {getProgressLabel(issue.status)}
          </span>
          <span className="rounded-full border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600">
            {solution.effort}
          </span>
          <span className="text-xs font-medium text-slate-500">
            <HelpLabel help={PRODUCT_BEGINNER_COPY.issuesPriorityHelp}>
              Priority {issue.priorityScore}
            </HelpLabel>
          </span>
        </div>
        <h4 className="mt-3 font-semibold">{problemTitle}</h4>
        <p className="mt-1 text-sm leading-6 text-slate-500">
          {softenProblemText(issue.description)}
        </p>
        <p className="mt-2 text-sm text-slate-500">
          {formatWebsiteClient(issue.client?.name)} -{" "}
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
          <p className="text-sm font-semibold text-slate-500">Best next step</p>
          <span
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${availabilityStyles[solution.fixAvailability.tone]}`}
          >
            {solution.fixAvailability.label}
          </span>
        </div>
        <h5 className="mt-2 text-sm font-semibold">{solutionTitle}</h5>
        <p className="mt-1 line-clamp-3 text-sm leading-6 text-slate-600">
          {softenProblemText(solution.detail)}
        </p>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
          <span className="font-semibold text-slate-800">
            Why this matters:{" "}
          </span>
          {softenProblemText(solution.whyMatters)}
        </p>
      </div>

      <div className="flex items-center xl:justify-end">
        <Link
          href={getSolutionHref({
            domainId: issue.domain.id,
            issueId: issue.id,
            primaryAction: solution.primaryAction,
          })}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-orange-600 px-3 text-sm font-medium text-white transition hover:bg-orange-700"
        >
          <AlertTriangle className="size-4" aria-hidden="true" />
          {getSoftActionLabel(solution.actionLabel)}
          <InfoTooltip
            label="Open the clearest steps to fix this problem."
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
      <span className="text-sm font-medium text-slate-600">
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
  return formatProductProblemArea(getIssueTypeGroupKey(value));
}

function getImportanceLabel(value: string) {
  return formatProductWorkspaceProblemSeverity(value);
}

function getProgressLabel(value: string) {
  const labels: Record<string, string> = {
    FIXED: "Fixed",
    IGNORED: "Set aside",
    IN_PROGRESS: "Being fixed",
    OPEN: "Open",
    REAPPEARED: "Needs another look",
  };

  return labels[value] ?? formatEnum(value);
}

function getSoftActionLabel(label: string) {
  return label
    .replace(/^Generate\b/i, "Create")
    .replace(/\bmeta\b/i, "description")
    .replace(/\bbrief\b/i, "note")
    .replace(/\bindexability\b/i, "page visibility")
    .replace(/\bsolution\b/i, "fix steps");
}

function softenProblemTitle(value: string) {
  const exactMatches: Record<string, string> = {
    "Sitemap URL is not internally linked":
      "Page is in the page list but needs links",
    "Sitemap Url Not Internally Linked":
      "Page is in the page list but needs links",
    "Internally Linked Url Missing From Sitemap":
      "Linked page missing from page list",
    "Robots Txt Unavailable Or Malformed": "Robots file needs attention",
    "Sitemap Unavailable": "Page list needs attention",
    "Missing H1": "Main heading missing",
    "Multiple H1": "Too many main headings",
    "Missing Image Alt": "Image description missing",
    "Missing Canonical": "Preferred page link missing",
    "Duplicate Content Cluster": "Repeated content group",
    "Duplicate Meta Description": "Repeated page description",
    "Duplicate Title": "Repeated page title",
    "Duplicate meta descriptions across page template":
      "Page template repeats the same description",
    "Missing Schema": "Page details for Google missing",
    "Missing Meta Description": "Page description missing",
    "Missing Title": "Page title missing",
    "Missing page title": "Page title missing",
    "Broken Internal Link": "Page link that needs help",
    "Broken internal link detected": "Page link that needs help",
    "Replace the broken internal link": "Replace link that stopped working",
    "Add a unique meta description": "Write a clear page description",
    "Add a unique title tag": "Write a clear page title",
    "Restore indexability": "Make page visible to Google",
    "Poor Heading Hierarchy": "Heading order needs attention",
    "Homepage Blocked By Robots": "Homepage blocked from Google",
    "Homepage blocked by robots.txt": "Homepage blocked from Google",
    "Page noindex": "Page hidden from Google",
    "Product schema missing": "Product details for Google missing",
    "Product template canonical points to non-200 URLs":
      "Product template points to a broken preferred page",
    "Homepage became noindex after latest deploy":
      "Homepage was hidden from Google after deploy",
    "Critical Regression": PRODUCT_GLOBAL_SEARCH_COPY.importantChangeLabel,
  };

  const exactMatch = exactMatches[value];

  if (exactMatch) {
    return exactMatch;
  }

  return value
    .replace(/\bSitemap URL is not internally linked\b/gi, exactMatches["Sitemap URL is not internally linked"])
    .replace(/\bSitemap Url Not Internally Linked\b/gi, exactMatches["Sitemap Url Not Internally Linked"])
    .replace(/\bInternally Linked Url Missing From Sitemap\b/gi, exactMatches["Internally Linked Url Missing From Sitemap"])
    .replace(/\bRobots Txt Unavailable Or Malformed\b/gi, exactMatches["Robots Txt Unavailable Or Malformed"])
    .replace(/\bSitemap Unavailable\b/gi, exactMatches["Sitemap Unavailable"])
    .replace(/\bMissing H1\b/gi, exactMatches["Missing H1"])
    .replace(/\bMultiple H1\b/gi, exactMatches["Multiple H1"])
    .replace(/\bMissing Image Alt\b/gi, exactMatches["Missing Image Alt"])
    .replace(/\bMissing Canonical\b/gi, exactMatches["Missing Canonical"])
    .replace(/\bDuplicate Content Cluster\b/gi, exactMatches["Duplicate Content Cluster"])
    .replace(/\bDuplicate Meta Description\b/gi, exactMatches["Duplicate Meta Description"])
    .replace(/\bDuplicate meta descriptions across page template\b/gi, exactMatches["Duplicate meta descriptions across page template"])
    .replace(/\bDuplicate Title\b/gi, exactMatches["Duplicate Title"])
    .replace(/\bMissing Schema\b/gi, exactMatches["Missing Schema"])
    .replace(/\bMissing Meta Description\b/gi, exactMatches["Missing Meta Description"])
    .replace(/\bMissing Title\b/gi, exactMatches["Missing Title"])
    .replace(/\bMissing page title\b/gi, exactMatches["Missing page title"])
    .replace(/\bAdd a unique meta description\b/gi, exactMatches["Add a unique meta description"])
    .replace(/\bAdd a unique title tag\b/gi, exactMatches["Add a unique title tag"])
    .replace(/\bRestore indexability\b/gi, exactMatches["Restore indexability"])
    .replace(/\bPoor Heading Hierarchy\b/gi, exactMatches["Poor Heading Hierarchy"])
    .replace(/\bHomepage Blocked By Robots\b/gi, exactMatches["Homepage Blocked By Robots"])
    .replace(/\bHomepage blocked by robots\.txt\b/gi, exactMatches["Homepage blocked by robots.txt"])
    .replace(/\bCritical Regression\b/gi, exactMatches["Critical Regression"])
    .replace(/\bCritical SEO regression\b/gi, "Important website change")
    .replace(/\bProduct template canonical points to non-200 URLs\b/gi, exactMatches["Product template canonical points to non-200 URLs"])
    .replace(/\bHomepage became noindex after latest deploy\b/gi, exactMatches["Homepage became noindex after latest deploy"])
    .replace(/\bURLs?\b/g, "pages")
    .replace(/\bUrl\b/g, "page")
    .replace(/\bSitemap\b/g, "page list")
    .replace(/\bInternally Linked\b/g, "linked")
    .replace(/\bRobots Txt\b/g, "robots file")
    .replace(/\bH1\b/g, "main heading")
    .replace(/\bMeta Description\b/g, "page description")
    .replace(/\bSchema\b/g, "page details for Google")
    .replace(/\bNoindex\b/g, "hidden from Google")
    .replace(/\bCanonical\b/g, "preferred page link");
}

function softenProblemText(value: string) {
  return value
    .replace(/\banalyzer-generated\b/gi, "website-check")
    .replace(/\bCritical SEO regression\b/gi, "Important website change")
    .replace(/\bcritical regression\b/gi, "important change")
    .replace(/\bstructured data\b/gi, "page details for Google")
    .replace(/\banalyzer pass\b/gi, "website check")
    .replace(/\blatest crawl\b/gi, "latest website check")
    .replace(/\bdisallows crawling\b/gi, "blocks search-engine access to")
    .replace(/\ballow crawling\b/gi, "allow search-engine access")
    .replace(/\beasier to crawl\b/gi, "easier for search engines to read")
    .replace(/\bcrawlability\b/gi, "findability")
    .replace(/\bcrawlable\b/gi, "easy for search engines to read")
    .replace(/\bcrawling\b/gi, "search-engine access")
    .replace(/\bcrawled\b/gi, "checked")
    .replace(/\brecrawl\b/gi, "run a new website check")
    .replace(/\bcrawl\b/gi, "website check")
    .replace(/\bcrawlers\b/gi, "search engines")
    .replace(/\bcrawler\b/gi, "search engine")
    .replace(
      /\brestore indexable canonical signals\b/gi,
      "restore the right visibility and preferred page settings",
    )
    .replace(/\bindexable\b/gi, "visible in Google")
    .replace(/\bcanonical signals\b/gi, "preferred page settings")
    .replace(/\bcanonical URL\b/gi, "preferred page link")
    .replace(/\bnoindex rule\b/gi, "Google visibility setting")
    .replace(/\bindexability\b/gi, "visibility in Google")
    .replace(/\bmeta description\b/gi, "page description")
    .replace(/\bmeta descriptions\b/gi, "page descriptions")
    .replace(/\btitle tag\b/gi, "page title")
    .replace(/\btitle tags\b/gi, "page titles")
    .replace(/\bissue\b/gi, "problem");
}

function pluralize(count: number, singular: string) {
  return count === 1 ? singular : `${singular}s`;
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
  templateGroups: Awaited<
    ReturnType<typeof getIssueListData>
  >["templateGroups"],
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

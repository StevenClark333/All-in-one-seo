import { AlertTriangle, CircleDot, Filter, ListChecks } from "lucide-react";
import Link from "next/link";
import { bulkUpdateIssues } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { ActiveProjectBanner } from "@/components/active-project-banner";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { getIssueListData } from "@/lib/issue-queries";

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
      count: issues.filter((issue) => issue.issueType === issueType).length,
    }))
    .filter((group) => group.count > 0);
  const selectedDomain = domains.find(
    (domain) => domain.id === filters.domainId,
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Issues" />

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
              {issues.length} shown
              <InfoTooltip
                label="Number of issues matching the current filters."
                passive
                side="left"
              />
            </div>
          </header>

          {selectedDomain ? (
            <ActiveProjectBanner
              clientName={selectedDomain.client?.name}
              domain={selectedDomain.domain}
              domainId={selectedDomain.id}
              note="Issue filters and bulk actions are focused on this domain."
            />
          ) : null}

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
                {templateGroups.map((group) => (
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
                      Issue queue
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Analyzer-generated issues across all clients, domains, and
                    pages.
                  </p>
                </div>
                <div className="flex max-w-3xl flex-wrap gap-2">
                  {templateGroups.slice(0, 6).map((group) => (
                    <Link
                      key={group.key}
                      href={`/issues?templateKey=${encodeURIComponent(group.key)}`}
                      className="rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 transition hover:bg-white"
                    >
                      {group.label}: {group.issueCount} issues, P
                      {group.priorityScore}
                    </Link>
                  ))}
                  {issueGroups.map((group) => (
                    <Link
                      key={group.issueType}
                      href={`/issues?issueType=${encodeURIComponent(group.issueType)}`}
                      className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600 transition hover:bg-white"
                    >
                      {formatIssueType(group.issueType)}: {group.count}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            <form action={bulkUpdateIssues}>
              {issues.length ? (
                <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium text-slate-600">
                    Select issues to update status in bulk, including ignored
                    rules.
                  </p>
                  <div className="flex flex-wrap gap-2">
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
                {issues.length ? (
                  issues.map((issue) => (
                    <article
                      key={issue.id}
                      className="grid gap-4 p-5 xl:grid-cols-[28px_1fr_170px_140px_130px]"
                    >
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

                      <Meta
                        help="Analyzer rule that created this issue."
                        label="Type"
                        value={formatIssueType(issue.issueType)}
                      />
                      <Meta
                        help="Teammate responsible for resolving this issue."
                        label="Owner"
                        value={
                          issue.assignedTo?.name ??
                          issue.assignedTo?.email ??
                          "Unassigned"
                        }
                      />
                      <div className="flex items-center xl:justify-end">
                        <Link
                          href={`/issues/${issue.id}`}
                          className="inline-flex h-9 items-center gap-2 rounded-md bg-slate-950 px-3 text-sm font-medium text-white transition hover:bg-slate-800"
                        >
                          <AlertTriangle
                            className="size-4"
                            aria-hidden="true"
                          />
                          Review
                          <InfoTooltip
                            label="Open issue details, recommendations, assignment, notes, and status controls."
                            passive
                            side="left"
                          />
                        </Link>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No SEO issues yet. Run a crawl to let the analyzer populate
                    this queue.
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

function Meta({
  help,
  label,
  value,
}: {
  help: string;
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
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
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

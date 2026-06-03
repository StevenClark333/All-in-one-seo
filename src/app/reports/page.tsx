import Link from "next/link";
import {
  CalendarClock,
  FileText,
  Globe2,
  LayoutTemplate,
  Plus,
} from "lucide-react";
import {
  createCustomReportTemplate,
  createReportWhiteLabelDomainAction,
  generateReport,
  scheduleReport,
  verifyReportWhiteLabelDomainAction,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import {
  formatReportWhiteLabelVerificationValue,
  getReportListData,
  REPORT_WHITE_LABEL_RECORD_NAME,
} from "@/lib/reporting";

export const dynamic = "force-dynamic";

type ReportsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedDomainId = getSingle(params.domainId);
  const {
    workspace,
    clients,
    domains,
    reports,
    schedules,
    templates,
    whiteLabelDomains,
  } = await getReportListData();
  const visibleReports = selectedDomainId
    ? reports.filter((report) => report.domainId === selectedDomainId)
    : reports;
  const visibleSchedules = selectedDomainId
    ? schedules.filter((schedule) => schedule.domainId === selectedDomainId)
    : schedules;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Reports" activeDomainId={selectedDomainId} />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Reports
              </h2>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <FileText className="size-4" aria-hidden="true" />
              {visibleReports.length} generated
              <InfoTooltip
                label="Reports generated for clients, domains, or the full workspace."
                passive
                side="left"
              />
            </div>
          </header>

          <ProjectWorkspaceBar
            active="reports"
            domainId={selectedDomainId}
            note="Report generation, schedules, and report library are focused on this domain."
            returnPath="/reports"
          />

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Plus className="size-5 text-slate-500" aria-hidden="true" />
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Create a one-time client-ready report from current crawl, issue, score, and recommendation data.">
                  Generate report
                </HelpLabel>
              </h3>
            </div>

            <form
              action={generateReport}
              className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4"
            >
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <HelpLabel help="Client-facing report name shown in the report library and share view.">
                    Title
                  </HelpLabel>
                </span>
                <input
                  name="title"
                  required
                  placeholder="Weekly SEO operations report"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <Select
                help="Limit report data to one client, or leave workspace-wide."
                label="Client"
                name="clientId"
              >
                <option value="">Workspace-wide</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
              <Select
                help="Limit report data to one website."
                label="Domain"
                name="domainId"
                defaultValue={selectedDomainId ?? ""}
              >
                <option value="">All selected client domains</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </Select>
              <Select
                help="Choose a reusable section layout for this report."
                label="Template"
                name="templateId"
              >
                <option value="">Standard template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Start
                </span>
                <input
                  type="date"
                  name="periodStart"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  End
                </span>
                <input
                  type="date"
                  name="periodEnd"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <div className="md:col-span-2 2xl:col-span-4">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Generate report
                  <InfoTooltip
                    label="Build the report now and add it to the library."
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <CalendarClock
                className="size-5 text-slate-500"
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Automate recurring weekly or monthly report generation for clients or domains.">
                  Schedule report
                </HelpLabel>
              </h3>
            </div>

            <form
              action={scheduleReport}
              className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4"
            >
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Title
                </span>
                <input
                  name="title"
                  required
                  placeholder="Weekly client SEO report"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <Select label="Client" name="clientId">
                <option value="">Workspace-wide</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Domain"
                name="domainId"
                defaultValue={selectedDomainId ?? ""}
              >
                <option value="">All selected client domains</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </Select>
              <Select label="Template" name="templateId">
                <option value="">Standard template</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
              <Select
                help="How often the report should be generated automatically."
                label="Frequency"
                name="frequency"
              >
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </Select>
              <div className="flex items-end">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Create schedule
                  <InfoTooltip
                    label="Save this recurring reporting workflow."
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <LayoutTemplate
                className="size-5 text-slate-500"
                aria-hidden="true"
              />
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Create reusable report section presets for different client or executive needs.">
                  Custom report template
                </HelpLabel>
              </h3>
            </div>

            <form
              action={createCustomReportTemplate}
              className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4"
            >
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Name
                </span>
                <input
                  name="name"
                  required
                  placeholder="Executive summary"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  Description
                </span>
                <input
                  name="description"
                  placeholder="Short client-ready monthly report"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <Select label="Client" name="clientId">
                <option value="">All clients</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
              <fieldset className="grid gap-2 md:col-span-2 2xl:col-span-4">
                <legend className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <HelpLabel help="Select which report blocks should be included when this template is used.">
                    Sections
                  </HelpLabel>
                </legend>
                <div className="flex flex-wrap gap-3">
                  {reportSectionOptions.map((section) => (
                    <label
                      key={section.value}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700"
                    >
                      <input
                        type="checkbox"
                        name="sections"
                        value={section.value}
                        defaultChecked
                        className="size-4 rounded border-slate-300 text-slate-950 focus:ring-slate-500"
                      />
                      {section.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              <div className="md:col-span-2 2xl:col-span-4">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Create template
                  <InfoTooltip
                    label="Save this template for future manual and scheduled reports."
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Saved section presets available for report generation and schedules.">
                  Report templates
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Reusable section presets for manual and scheduled reports.
              </p>
            </div>

            <div className="grid divide-y divide-slate-100">
              {templates.length ? (
                templates.map((template) => (
                  <article
                    key={template.id}
                    className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px_130px]"
                  >
                    <div>
                      <p className="font-semibold">{template.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {template.description ?? "No description"}
                      </p>
                    </div>
                    <Meta
                      label="Client"
                      value={template.client?.name ?? "All clients"}
                    />
                    <Meta
                      label="Created"
                      value={template.createdAt.toLocaleDateString()}
                    />
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No custom report templates yet.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2">
              <Globe2 className="size-5 text-slate-500" aria-hidden="true" />
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Configure a branded hostname for report share links, such as reports.client.com.">
                  White-label report domain
                </HelpLabel>
              </h3>
            </div>

            <form
              action={createReportWhiteLabelDomainAction}
              className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_220px_auto]"
            >
              <label className="grid gap-2">
                <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                  <HelpLabel help="Custom domain where shared reports should be served after DNS verification.">
                    Hostname
                  </HelpLabel>
                </span>
                <input
                  name="hostname"
                  required
                  placeholder="reports.client.com"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <Select label="Client" name="clientId">
                <option value="">Workspace default</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
              <div className="flex items-end">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Add domain
                  <InfoTooltip
                    label="Create a white-label report hostname and show DNS verification values."
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>

            <div className="mt-5 grid divide-y divide-slate-100 border-t border-slate-100">
              {whiteLabelDomains.length ? (
                whiteLabelDomains.map((domain) => (
                  <article
                    key={domain.id}
                    className="grid gap-4 py-5 lg:grid-cols-[minmax(0,1fr)_120px_180px_170px]"
                  >
                    <div>
                      <p className="font-semibold">{domain.hostname}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {domain.client?.name ?? "Workspace default"}
                      </p>
                      {domain.status !== "VERIFIED" ? (
                        <div className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
                          <DnsField
                            label="TXT name"
                            value={REPORT_WHITE_LABEL_RECORD_NAME}
                          />
                          <DnsField
                            label="TXT value"
                            value={formatReportWhiteLabelVerificationValue(
                              domain.verificationToken,
                            )}
                          />
                        </div>
                      ) : null}
                    </div>
                    <Meta
                      help="DNS verification status for this white-label hostname."
                      label="Status"
                      value={formatEnum(domain.status)}
                    />
                    <Meta
                      label="Verified"
                      help="Date the white-label hostname passed DNS verification."
                      value={
                        domain.verifiedAt
                          ? domain.verifiedAt.toLocaleDateString()
                          : "Pending"
                      }
                    />
                    <div className="flex items-start lg:justify-end">
                      {domain.status !== "VERIFIED" ? (
                        <form action={verifyReportWhiteLabelDomainAction}>
                          <input
                            type="hidden"
                            name="whiteLabelDomainId"
                            value={domain.id}
                          />
                          <button className="inline-flex h-10 items-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                            Check DNS
                            <InfoTooltip
                              label="Look up the required TXT record and activate the hostname if it matches."
                              passive
                              side="left"
                            />
                          </button>
                        </form>
                      ) : (
                        <span className="inline-flex h-10 items-center rounded-md border border-emerald-200 bg-emerald-50 px-4 text-sm font-medium text-emerald-700">
                          Active
                        </span>
                      )}
                    </div>
                  </article>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-slate-500">
                  No white-label report domains yet.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Recurring report jobs and their next run dates.">
                  Scheduled reports
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Automatic report generation for recurring client and domain
                updates.
              </p>
            </div>

            <div className="grid divide-y divide-slate-100">
              {visibleSchedules.length ? (
                visibleSchedules.map((schedule) => (
                  <article
                    key={schedule.id}
                    className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_130px_150px_120px_130px]"
                  >
                    <div>
                      <p className="font-semibold">{schedule.title}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {schedule.client?.name ??
                          schedule.domain?.domain ??
                          "Workspace schedule"}
                      </p>
                    </div>
                    <Meta
                      label="Frequency"
                      value={formatEnum(schedule.frequency)}
                    />
                    <Meta
                      label="Next run"
                      value={schedule.nextRunAt.toLocaleDateString()}
                    />
                    <Meta
                      label="Status"
                      value={schedule.enabled ? "Enabled" : "Paused"}
                    />
                    <Meta
                      label="Template"
                      value={schedule.template?.name ?? "Standard"}
                    />
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No scheduled reports yet.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Generated reports that can be reviewed, published, shared, or exported as PDFs.">
                  Report library
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Client-ready reports with read-only sharing and PDF export.
              </p>
            </div>

            <div className="grid divide-y divide-slate-100">
              {visibleReports.length ? (
                visibleReports.map((report) => (
                  <article
                    key={report.id}
                    className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_130px_130px_180px_130px]"
                  >
                    <div>
                      <Link
                        href={`/reports/${report.id}`}
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        {report.title}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {report.client?.name ??
                          report.domain?.domain ??
                          "Workspace report"}
                      </p>
                    </div>
                    <Meta label="Status" value={formatEnum(report.status)} />
                    <Meta
                      label="Template"
                      value={report.template?.name ?? "Standard"}
                    />
                    <Meta
                      label="Period"
                      value={`${report.periodStart.toLocaleDateString()} - ${report.periodEnd.toLocaleDateString()}`}
                    />
                    <Meta
                      label="Created"
                      value={report.createdAt.toLocaleDateString()}
                    />
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No reports yet. Generate the first client report from the form
                  above.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

const reportSectionOptions = [
  { label: "Health score", value: "healthScore" },
  { label: "Crawl summary", value: "crawlSummary" },
  { label: "Issue movement", value: "issueMovement" },
  { label: "Change summary", value: "changeSummary" },
  { label: "Recommendations", value: "priorityRecommendations" },
];

function Select({
  children,
  defaultValue,
  help,
  label,
  name,
}: {
  children: React.ReactNode;
  defaultValue?: string;
  help?: string;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {help ? <HelpLabel help={help}>{label}</HelpLabel> : label}
      </span>
      <select
        name={name}
        defaultValue={defaultValue}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
      >
        {children}
      </select>
    </label>
  );
}

function Meta({
  help,
  label,
  value,
}: {
  help?: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {help ? <HelpLabel help={help}>{label}</HelpLabel> : label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function DnsField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[90px_1fr]">
      <span className="font-semibold text-slate-500">{label}</span>
      <code className="break-all rounded bg-white px-2 py-1 font-mono text-[11px] text-slate-700">
        {value}
      </code>
    </div>
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

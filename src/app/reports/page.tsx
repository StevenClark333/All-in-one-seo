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
import { EmptyState } from "@/components/empty-state";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import {
  formatReportWhiteLabelVerificationValue,
  getReportListData,
  REPORT_WHITE_LABEL_RECORD_NAME,
} from "@/lib/reporting";
import {
  formatProductReportBrandingStatus,
  formatProductReportTitle,
  PRODUCT_REPORT_UPDATE_COPY,
} from "@/lib/product-copy";

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
                Client updates
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                {PRODUCT_REPORT_UPDATE_COPY.listIntro}
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <FileText className="size-4" aria-hidden="true" />
              {visibleReports.length} ready
              <InfoTooltip
                label="Client updates generated for clients, websites, or the full workspace."
                passive
                side="left"
              />
            </div>
          </header>

          <ReportPlan
            reportCount={visibleReports.length}
            scheduleCount={visibleSchedules.length}
            templateCount={templates.length}
            domainCount={whiteLabelDomains.length}
          />

          <ProjectWorkspaceBar
            active="reports"
            domainId={selectedDomainId}
            note="Reports, schedules, and saved updates are focused on this website."
            returnPath="/reports"
          />

          <section
            id="generate-report"
            className="mt-5 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Plus className="size-5 text-slate-500" aria-hidden="true" />
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Create a client-ready update from current website health, problems, and recommendations.">
                  Create a client update
                </HelpLabel>
              </h3>
            </div>

            <form
              action={generateReport}
              className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4"
            >
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-sm font-medium text-slate-500">
                  <HelpLabel help="Client-facing update name shown in the report library and share view.">
                    Title
                  </HelpLabel>
                </span>
                <input
                  name="title"
                  required
                  placeholder={
                    PRODUCT_REPORT_UPDATE_COPY.manualTitlePlaceholder
                  }
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
                label="Website"
                name="domainId"
                defaultValue={selectedDomainId ?? ""}
              >
                <option value="">All selected client websites</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </Select>
              <details className="rounded-md border border-slate-200 bg-slate-50 p-3 md:col-span-2 2xl:col-span-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                  Choose format and dates
                </summary>
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                  <Select
                    help="Choose a reusable section layout for this report."
                    label="Format"
                    name="templateId"
                  >
                    <option value="">Standard format</option>
                    {templates.map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </Select>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-500">
                      Start
                    </span>
                    <input
                      type="date"
                      name="periodStart"
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </label>
                  <label className="grid gap-2">
                    <span className="text-sm font-medium text-slate-500">
                      End
                    </span>
                    <input
                      type="date"
                      name="periodEnd"
                      className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                    />
                  </label>
                </div>
              </details>
              <div className="md:col-span-2 2xl:col-span-4">
                <button className="inline-flex h-10 items-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                  Create update
                  <InfoTooltip
                    label="Build the update now and add it to the library."
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>
          </section>

          <section
            id="report-library"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Saved updates that can be reviewed, published, shared, or downloaded.">
                  Update library
                </HelpLabel>
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Client-ready updates with read-only sharing and download.
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
                        {formatProductReportTitle(report.title)}
                      </Link>
                      <p className="mt-1 text-sm text-slate-500">
                        {report.client?.name ??
                          report.domain?.domain ??
                          "Workspace report"}
                      </p>
                    </div>
                    <Meta
                      label="Status"
                      value={formatReportStatus(report.status)}
                    />
                    <Meta
                      label="Format"
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
                <div className="p-5">
                  <EmptyState
                    action={
                      <a
                        href="#generate-report"
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                      >
                        <Plus className="size-4" aria-hidden="true" />
                        Create first update
                      </a>
                    }
                    description="Choose a client or website above, then create a simple update you can share with a client or teammate."
                    icon={FileText}
                    title="No updates have been created yet"
                  />
                </div>
              )}
            </div>
          </section>

          <details
            id="schedule-report"
            className="group mt-4 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <summary className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                  <CalendarClock className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Prepare weekly or monthly client updates automatically.">
                      Schedule updates
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Open this when you want weekly or monthly updates to run
                    automatically.
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                Set up
              </span>
              <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                Hide
              </span>
            </summary>

            <form
              action={scheduleReport}
              className="grid gap-3 border-t border-slate-100 p-5 md:grid-cols-2 2xl:grid-cols-4"
            >
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-sm font-medium text-slate-500">
                  Title
                </span>
                <input
                  name="title"
                  required
                  placeholder={
                    PRODUCT_REPORT_UPDATE_COPY.scheduledTitlePlaceholder
                  }
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
                label="Website"
                name="domainId"
                defaultValue={selectedDomainId ?? ""}
              >
                <option value="">All selected client websites</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </Select>
              <Select label="Format" name="templateId">
                <option value="">Standard format</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
              <Select
                help="How often the client update should be prepared automatically."
                label="Frequency"
                name="frequency"
              >
                <option value="WEEKLY">Every week</option>
                <option value="MONTHLY">Every month</option>
              </Select>
              <div className="flex items-end">
                <button className="inline-flex h-10 items-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                  Save schedule
                  <InfoTooltip
                    label="Save this recurring report schedule."
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>
          </details>

          <details className="group mt-4 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                  <LayoutTemplate className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Create reusable report section presets for different client or executive needs.">
                      Saved report format
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Save a short executive or client update format for later.
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                Customize
              </span>
              <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                Hide
              </span>
            </summary>

            <form
              action={createCustomReportTemplate}
              className="grid gap-3 border-t border-slate-100 p-5 md:grid-cols-2 2xl:grid-cols-4"
            >
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-sm font-medium text-slate-500">Name</span>
                <input
                  name="name"
                  required
                  placeholder="Executive summary"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <label className="grid gap-2 xl:col-span-2">
                <span className="text-sm font-medium text-slate-500">
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
                <legend className="text-sm font-medium text-slate-500">
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
                <button className="inline-flex h-10 items-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                  Save format
                  <InfoTooltip
                    label="Save this format for future manual and scheduled updates."
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>
          </details>

          <details
            id="report-templates"
            className="group mt-4 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-5">
              <span>
                <span className="block text-lg font-semibold">
                  <HelpLabel help="Saved section presets available for reports and schedules.">
                    Saved formats
                  </HelpLabel>
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  Reusable presets for manual and scheduled client updates.
                </span>
              </span>
              <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                Open
              </span>
              <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                Hide
              </span>
            </summary>

            <div className="grid divide-y divide-slate-100 border-t border-slate-100">
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
                  No saved report formats yet. Save one after you like the first
                  update layout.
                </div>
              )}
            </div>
          </details>

          <details className="group mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <summary className="flex items-center justify-between gap-4 p-5">
              <div className="flex items-center gap-3">
                <span className="flex size-9 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                  <Globe2 className="size-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help={PRODUCT_REPORT_UPDATE_COPY.brandedLinkHelp}>
                      Branded report link
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Optional branding for client share links.
                  </p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                Brand reports
              </span>
              <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                Hide
              </span>
            </summary>

            <form
              action={createReportWhiteLabelDomainAction}
              className="grid gap-3 border-t border-slate-100 p-5 md:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_220px_auto]"
            >
              <label className="grid gap-2">
                <span className="text-sm font-medium text-slate-500">
                  <HelpLabel help={PRODUCT_REPORT_UPDATE_COPY.brandedLinkAddressHelp}>
                    {PRODUCT_REPORT_UPDATE_COPY.brandedLinkAddressLabel}
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
                <button className="inline-flex h-10 items-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                  {PRODUCT_REPORT_UPDATE_COPY.addBrandedLinkAction}
                  <InfoTooltip
                    label={PRODUCT_REPORT_UPDATE_COPY.brandedLinkSetupHelp}
                    passive
                    side="left"
                  />
                </button>
              </div>
            </form>

            <div className="grid divide-y divide-slate-100 border-t border-slate-100 px-5">
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
                            label={PRODUCT_REPORT_UPDATE_COPY.brandedLinkSetupNameLabel}
                            value={REPORT_WHITE_LABEL_RECORD_NAME}
                          />
                          <DnsField
                            label={PRODUCT_REPORT_UPDATE_COPY.brandedLinkSetupValueLabel}
                            value={formatReportWhiteLabelVerificationValue(
                              domain.verificationToken,
                            )}
                          />
                        </div>
                      ) : null}
                    </div>
                    <Meta
                      help={PRODUCT_REPORT_UPDATE_COPY.brandedLinkStatusHelp}
                      label="Status"
                      value={formatProductReportBrandingStatus(domain.status)}
                    />
                    <Meta
                      label="Verified"
                      help={PRODUCT_REPORT_UPDATE_COPY.brandedLinkVerifiedHelp}
                      value={
                        domain.verifiedAt
                          ? domain.verifiedAt.toLocaleDateString()
                          : "Not verified yet"
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
                            {PRODUCT_REPORT_UPDATE_COPY.brandedLinkCheckAction}
                            <InfoTooltip
                              label={PRODUCT_REPORT_UPDATE_COPY.brandedLinkCheckHelp}
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
                  {PRODUCT_REPORT_UPDATE_COPY.brandedLinkEmpty}
                </div>
              )}
            </div>
          </details>

          <details
            id="scheduled-reports"
            className="group mt-4 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 p-5">
              <span>
                <span className="block text-lg font-semibold">
                  <HelpLabel help="Recurring report jobs and their next run dates.">
                    Scheduled updates
                  </HelpLabel>
                </span>
                <span className="mt-1 block text-sm text-slate-500">
                  Automatic client updates for recurring website progress.
                </span>
              </span>
              <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                Open
              </span>
              <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                Hide
              </span>
            </summary>

            <div className="grid divide-y divide-slate-100 border-t border-slate-100">
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
                      value={formatScheduleFrequency(schedule.frequency)}
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
                      label="Format"
                      value={schedule.template?.name ?? "Standard"}
                    />
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No scheduled updates yet. Create one after the first update is
                  ready to share.
                </div>
              )}
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}

const reportSectionOptions = [
  { label: "Website health", value: "healthScore" },
  { label: "Website check summary", value: "crawlSummary" },
  { label: "Fix movement", value: "issueMovement" },
  { label: "Change summary", value: "changeSummary" },
  { label: "Next steps", value: "priorityRecommendations" },
];

function ReportPlan({
  domainCount,
  reportCount,
  scheduleCount,
  templateCount,
}: {
  domainCount: number;
  reportCount: number;
  scheduleCount: number;
  templateCount: number;
}) {
  const plan = [
    {
      label: reportCount
        ? "Review the latest client update"
        : "Create a first report",
      value: reportCount ? `${reportCount} ready` : "Start here",
      detail: reportCount
        ? "Open the library, check the summary, then share the report when it looks right."
        : "Create a simple update first, then add schedules or saved formats later.",
      href: reportCount ? "#report-library" : "#generate-report",
    },
    {
      label: scheduleCount ? "Keep updates automatic" : "Automate later",
      value: scheduleCount ? `${scheduleCount} active` : "Optional",
      detail: scheduleCount
        ? "Scheduled updates are already keeping clients informed without manual work."
        : "Use schedules after the first report looks good and the client wants regular updates.",
      href: "#schedule-report",
    },
    {
      label: templateCount ? "Reuse a proven format" : "Save your best format",
      value: templateCount ? `${templateCount} formats` : "After first draft",
      detail: templateCount
        ? "Pick a saved format to keep updates consistent and faster to prepare."
        : "Once you like a report structure, save it as a format for the next client.",
      href: "#report-templates",
    },
  ];

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-orange-600">Report plan</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-normal">
            {PRODUCT_REPORT_UPDATE_COPY.planHeading}
          </h3>
        </div>
        <div className="inline-flex w-fit items-center rounded-full bg-orange-50 px-3 py-1 text-sm font-medium text-orange-700">
          {domainCount
            ? `${domainCount} ${PRODUCT_REPORT_UPDATE_COPY.brandedLinkCountLabel}`
            : "Branding optional"}
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {plan.map((item) => (
          <a
            key={item.label}
            href={item.href}
            className="rounded-md border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <span className="text-sm font-semibold text-slate-950">
              {item.label}
            </span>
            <span className="mt-2 block text-sm font-medium text-orange-600">
              {item.value}
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-500">
              {item.detail}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}

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
      <span className="text-sm font-medium text-slate-500">
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
      <p className="text-sm font-medium text-slate-500">
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

function formatReportStatus(value: string) {
  const labels: Record<string, string> = {
    DRAFT: "Draft",
    FAILED: "Needs review",
    GENERATED: "Ready to share",
    PUBLISHED: "Shared",
  };

  return labels[value] ?? formatEnum(value);
}

function formatScheduleFrequency(value: string) {
  const labels: Record<string, string> = {
    MONTHLY: "Every month",
    WEEKLY: "Every week",
  };

  return labels[value] ?? formatEnum(value);
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

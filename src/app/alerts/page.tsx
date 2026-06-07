import { Bell, CheckCircle2, Clock, Play, ShieldCheck } from "lucide-react";
import { createAlertRuleAction, evaluateAlertsAction } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { getAlertCenterData } from "@/lib/alerts";

export const dynamic = "force-dynamic";

const severities = ["CRITICAL", "WARNING", "SUGGESTION"];
const channels = ["EMAIL", "SLACK", "TEAMS", "WEBHOOK"];
const eventTypes = [
  "ANY_CRITICAL_CHANGE",
  "TITLE_CHANGED",
  "META_DESCRIPTION_CHANGED",
  "ROBOTS_CHANGED",
  "STATUS_CODE_CHANGED",
  "CANONICAL_CHANGED",
];

export default async function AlertsPage() {
  const { workspace, clients, domains, rules, alerts } =
    await getAlertCenterData();
  const enabledRuleCount = rules.filter((rule) => rule.enabled).length;
  const failedAlertCount = alerts.filter(
    (alert) => alert.status === "FAILED",
  ).length;
  const pendingAlertCount = alerts.filter(
    (alert) => alert.status === "PENDING",
  ).length;
  const latestAlert = alerts[0];

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Alerts" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Alerts
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep important SEO changes visible without watching every
                crawl, report, and integration by hand.
              </p>
            </div>

            <form action={evaluateAlertsAction}>
              <button className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
                <Play className="size-4" aria-hidden="true" />
                Check alerts now
              </button>
            </form>
          </header>

          <AlertComfortPlan
            enabledRuleCount={enabledRuleCount}
            failedAlertCount={failedAlertCount}
            pendingAlertCount={pendingAlertCount}
            latestAlertLabel={
              latestAlert
                ? `${latestAlert.alertRule.name} on ${latestAlert.domain.domain}`
                : "No alerts sent yet"
            }
          />

          <section
            id="create-alert"
            className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Bell className="size-5 text-orange-600" aria-hidden="true" />
              <div>
                <h3 className="text-lg font-semibold">Create alert rule</h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  Choose what matters, who should hear about it, and where the
                  message should go.
                </p>
              </div>
            </div>

            <form
              action={createAlertRuleAction}
              className="mt-4 grid gap-3 md:grid-cols-2 2xl:grid-cols-4"
            >
              <label className="grid gap-2 xl:col-span-2">
                <FieldLabel>Rule name</FieldLabel>
                <input
                  name="name"
                  required
                  placeholder="Critical technical SEO changes"
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
              <Select label="Domain" name="domainId">
                <option value="">All domains</option>
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {domain.domain}
                  </option>
                ))}
              </Select>
              <Select label="Event" name="eventType">
                {eventTypes.map((eventType) => (
                  <option key={eventType} value={eventType}>
                    {formatEnum(eventType)}
                  </option>
                ))}
              </Select>
              <Select label="Severity" name="severityThreshold">
                {severities.map((severity) => (
                  <option key={severity} value={severity}>
                    {formatEnum(severity)}
                  </option>
                ))}
              </Select>
              <Select label="Channel" name="channel">
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {formatEnum(channel)}
                  </option>
                ))}
              </Select>
              <label className="grid gap-2 md:col-span-2">
                <FieldLabel>Email recipient</FieldLabel>
                <input
                  name="targetEmail"
                  type="email"
                  placeholder="ops@example.com"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <FieldLabel>Slack, Teams, or webhook URL</FieldLabel>
                <input
                  name="targetUrl"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <Select label="Escalation" name="escalationChannel">
                <option value="">None</option>
                {channels.map((channel) => (
                  <option key={channel} value={channel}>
                    {formatEnum(channel)}
                  </option>
                ))}
              </Select>
              <label className="grid gap-2 md:col-span-2">
                <FieldLabel>Escalation email</FieldLabel>
                <input
                  name="escalationTargetEmail"
                  type="email"
                  placeholder="lead@example.com"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <label className="grid gap-2 md:col-span-2">
                <FieldLabel>Escalation URL</FieldLabel>
                <input
                  name="escalationTargetUrl"
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
              </label>
              <div className="md:col-span-2 2xl:col-span-4">
                <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                  Create rule
                </button>
              </div>
            </form>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
            <div
              id="alert-rules"
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">Alert rules</h3>
                <p className="mt-1 text-sm text-slate-500">
                  The short list of changes this workspace is watching.
                </p>
              </div>
              <div className="grid divide-y divide-slate-100">
                {rules.length ? (
                  rules.map((rule) => (
                    <article
                      key={rule.id}
                      className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_120px_120px_120px_120px_100px]"
                    >
                      <div>
                        <p className="font-semibold">{rule.name}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {rule.client?.name ??
                            rule.domain?.domain ??
                            "Workspace-wide"}{" "}
                          - {formatEnum(rule.eventType)}
                        </p>
                      </div>
                      <Meta
                        label="Threshold"
                        value={formatEnum(rule.severityThreshold)}
                      />
                      <Meta label="Channel" value={formatEnum(rule.channel)} />
                      <Meta
                        label="Destination"
                        value={
                          rule.targetUrl || rule.targetEmail
                            ? "Configured"
                            : "Default"
                        }
                      />
                      <Meta
                        label="Escalation"
                        value={
                          rule.escalationChannel
                            ? formatEnum(rule.escalationChannel)
                            : "None"
                        }
                      />
                      <Meta
                        label="Enabled"
                        value={rule.enabled ? "Yes" : "No"}
                      />
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title="No alert rules yet"
                    body="Start with one rule for critical website changes, then add quieter rules later."
                    href="#create-alert"
                    action="Create the first rule"
                  />
                )}
              </div>
            </div>

            <aside
              id="delivery-history"
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">Delivery history</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Recent messages and whether they reached the right channel.
                </p>
              </div>
              <div className="grid divide-y divide-slate-100">
                {alerts.length ? (
                  alerts.map((alert) => (
                    <article key={alert.id} className="p-5">
                      <p className="font-semibold">{alert.alertRule.name}</p>
                      <p className="mt-1 text-sm text-slate-500">
                        {alert.domain.domain}
                        {alert.page ? ` - ${alert.page.url}` : ""}
                      </p>
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <Meta label="Status" value={formatEnum(alert.status)} />
                        <Meta
                          label="Escalated"
                          value={
                            alert.escalatedAt
                              ? alert.escalatedAt.toLocaleString()
                              : "No"
                          }
                        />
                        <Meta
                          label="Sent"
                          value={
                            alert.sentAt
                              ? alert.sentAt.toLocaleString()
                              : "Pending"
                          }
                        />
                      </div>
                    </article>
                  ))
                ) : (
                  <EmptyState
                    title="No alert deliveries yet"
                    body="Run a check after creating a rule to see delivery status here."
                    href="#create-alert"
                    action="Set up alerts"
                  />
                )}
              </div>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}

function AlertComfortPlan({
  enabledRuleCount,
  failedAlertCount,
  latestAlertLabel,
  pendingAlertCount,
}: {
  enabledRuleCount: number;
  failedAlertCount: number;
  latestAlertLabel: string;
  pendingAlertCount: number;
}) {
  const needsAttention = failedAlertCount + pendingAlertCount;

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Alert comfort plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Watch the important changes, skip the noise.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Use alerts like a simple assistant: decide what matters, check if
            delivery is healthy, and only adjust advanced routing when needed.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <SummaryTile
            icon={<ShieldCheck className="size-4" aria-hidden="true" />}
            label="Rules watching"
            value={`${enabledRuleCount} active`}
            detail="Create one broad rule first, then narrow it later."
            href="#alert-rules"
          />
          <SummaryTile
            icon={<Clock className="size-4" aria-hidden="true" />}
            label="Delivery health"
            value={
              needsAttention
                ? `${needsAttention} needs review`
                : "Looks quiet"
            }
            detail="Failed or pending messages are the only alerts to chase."
            href="#delivery-history"
          />
          <SummaryTile
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
            label="Latest signal"
            value={latestAlertLabel}
            detail="Use the latest delivery to confirm routing is working."
            href="#delivery-history"
          />
        </div>
      </div>
    </section>
  );
}

function SummaryTile({
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
      className="block rounded-lg border border-orange-100 bg-white p-4 text-left shadow-sm transition hover:border-orange-200 hover:bg-white"
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

function Select({
  children,
  label,
  name,
}: {
  children: React.ReactNode;
  label: string;
  name: string;
}) {
  return (
    <label className="grid gap-2">
      <FieldLabel>{label}</FieldLabel>
      <select
        name={name}
        className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
      >
        {children}
      </select>
    </label>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-sm font-medium text-slate-500">{children}</span>
  );
}

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function EmptyState({
  action,
  body,
  href,
  title,
}: {
  action: string;
  body: string;
  href: string;
  title: string;
}) {
  return (
    <div className="p-8 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
        {body}
      </p>
      <a
        href={href}
        className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700"
      >
        {action}
      </a>
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

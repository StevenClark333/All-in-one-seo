import Link from "next/link";
import type React from "react";
import type { LinkFixStatus } from "@prisma/client";
import { CheckCircle2, Download, Hammer, Pencil, Play, X } from "lucide-react";
import {
  generateLinkFixesAction,
  sendLinkFixToAutomationAction,
  updateLinkFixAction,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { InfoTooltip } from "@/components/info-tooltip";
import { getLinkFixCenterData } from "@/lib/link-fixes";

type FixCenterPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const statuses = [
  "DRAFT",
  "APPROVED",
  "EXPORTED",
  "APPLIED",
  "DISMISSED",
] satisfies LinkFixStatus[];

export default async function FixCenterPage({
  searchParams,
}: FixCenterPageProps) {
  const params = (await searchParams) ?? {};
  const selectedDomainId = getSingle(params.domainId);
  const selectedStatus = getSingle(params.status);
  const { automationIntegrations, domains, suggestions, counts } =
    await getLinkFixCenterData({
      domainId: selectedDomainId,
      status: isLinkFixStatus(selectedStatus) ? selectedStatus : undefined,
    });
  const selectedDomain = domains.find(
    (domain) => domain.id === selectedDomainId,
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <AppSidebar active="Fix Center" />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                  Fix Center
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                  Turn link issues into approved website fixes
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Generate suggested internal-link repairs from crawler
                  findings, approve the good ones, export exact instructions,
                  and mark them applied after publishing.
                </p>
              </div>
              <form action={generateLinkFixesAction} className="flex gap-2">
                {selectedDomainId ? (
                  <input
                    type="hidden"
                    name="domainId"
                    value={selectedDomainId}
                  />
                ) : null}
                <button className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                  <Play className="size-4" aria-hidden="true" />
                  Generate fixes
                  <InfoTooltip
                    label="Create or refresh suggested fixes from current internal-link issues."
                    passive
                  />
                </button>
              </form>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-5">
              {statuses.map((status) => (
                <Metric
                  key={status}
                  label={formatStatus(status)}
                  value={counts[status]}
                />
              ))}
            </div>
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
              <span className="font-semibold text-slate-800">
                Automation handoff:
              </span>{" "}
              {automationIntegrations.length
                ? `${automationIntegrations.length} Zapier/Make workflow${
                    automationIntegrations.length === 1 ? "" : "s"
                  } connected for sending approved fixes.`
                : "Connect Zapier or Make in Integrations to send fixes into a CMS, project board, or client workflow."}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                  Fix queue
                  <InfoTooltip label="Filter and work through approved internal-link fixes by domain and status." />
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedDomain
                    ? `Showing fixes for ${selectedDomain.domain}.`
                    : "Showing fixes across all active domains."}
                </p>
              </div>
              <form
                className="grid gap-2 sm:grid-cols-[minmax(0,260px)_160px_auto_auto]"
                method="get"
              >
                <select
                  name="domainId"
                  defaultValue={selectedDomainId ?? ""}
                  className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="">All domains</option>
                  {domains.map((domain) => (
                    <option key={domain.id} value={domain.id}>
                      {domain.client?.name ? `${domain.client.name} - ` : ""}
                      {domain.domain}
                    </option>
                  ))}
                </select>
                <select
                  name="status"
                  defaultValue={selectedStatus ?? ""}
                  className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                >
                  <option value="">All statuses</option>
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {formatStatus(status)}
                    </option>
                  ))}
                </select>
                <button className="h-10 rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                  Filter
                </button>
                {selectedDomainId || selectedStatus ? (
                  <Link
                    href="/fix-center"
                    className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    Clear
                  </Link>
                ) : null}
              </form>
            </div>

            <div className="mt-5 grid gap-4">
              {suggestions.length ? (
                suggestions.map((suggestion) => (
                  <article
                    key={suggestion.id}
                    className="rounded-lg border border-slate-200 bg-white p-4"
                  >
                    <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getStatusClass(
                              suggestion.status,
                            )}`}
                          >
                            {formatStatus(suggestion.status)}
                          </span>
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {suggestion.confidenceScore}% confidence
                          </span>
                          <span className="text-xs font-medium text-slate-500">
                            {suggestion.domain.client?.name
                              ? `${suggestion.domain.client.name} - `
                              : ""}
                            {suggestion.domain.domain}
                          </span>
                        </div>
                        <h4 className="mt-3 text-base font-semibold">
                          {suggestion.brokenUrl
                            ? "Replace broken internal link"
                            : "Add contextual internal link"}
                        </h4>
                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {suggestion.reason}
                        </p>
                      </div>
                      {suggestion.issue ? (
                        <Link
                          href={`/issues/${suggestion.issue.id}`}
                          className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                        >
                          View issue
                        </Link>
                      ) : null}
                    </div>

                    <div className="mt-4 grid gap-3 lg:grid-cols-3">
                      <DetailBlock
                        label="Source page"
                        value={suggestion.sourceUrl}
                      />
                      {suggestion.brokenUrl ? (
                        <DetailBlock
                          label="Broken URL"
                          value={suggestion.brokenUrl}
                          danger
                        />
                      ) : null}
                      <DetailBlock
                        label="Suggested URL"
                        value={suggestion.suggestedUrl}
                      />
                    </div>

                    <form
                      action={updateLinkFixAction}
                      className="mt-4 grid gap-3 rounded-md bg-slate-50 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)_auto]"
                    >
                      <input type="hidden" name="fixId" value={suggestion.id} />
                      <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Suggested URL
                        <input
                          name="suggestedUrl"
                          defaultValue={suggestion.suggestedUrl}
                          className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700"
                        />
                      </label>
                      <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Anchor text
                        <input
                          name="anchorText"
                          defaultValue={suggestion.anchorText ?? ""}
                          className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700"
                        />
                      </label>
                      <button className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white">
                        <Pencil className="size-4" aria-hidden="true" />
                        Save
                      </button>
                    </form>

                    <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                      <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        Manual fix instruction
                        <InfoTooltip label="Copy this into WordPress, Webflow, Shopify, a developer ticket, or your client workflow." />
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {suggestion.manualInstructions}
                      </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <StatusButton
                        fixId={suggestion.id}
                        status="APPROVED"
                        label="Approve"
                        icon={<CheckCircle2 className="size-4" />}
                      />
                      <StatusButton
                        fixId={suggestion.id}
                        status="EXPORTED"
                        label="Mark exported"
                        icon={<Download className="size-4" />}
                      />
                      <StatusButton
                        fixId={suggestion.id}
                        status="APPLIED"
                        label="Mark applied"
                        icon={<Hammer className="size-4" />}
                      />
                      <StatusButton
                        fixId={suggestion.id}
                        status="DISMISSED"
                        label="Dismiss"
                        icon={<X className="size-4" />}
                        subtle
                      />
                    </div>
                    {automationIntegrations.length ? (
                      <form
                        action={sendLinkFixToAutomationAction}
                        className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                      >
                        <input
                          type="hidden"
                          name="fixId"
                          value={suggestion.id}
                        />
                        <label className="grid gap-1 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                          Send to workflow
                          <select
                            name="integrationId"
                            className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700"
                          >
                            {automationIntegrations.map((integration) => (
                              <option
                                key={integration.id}
                                value={integration.id}
                              >
                                {integration.label} ({integration.provider})
                              </option>
                            ))}
                          </select>
                        </label>
                        <button className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
                          <Download className="size-4" aria-hidden="true" />
                          Send payload
                          <InfoTooltip
                            label="Posts this fix as JSON to the selected Zapier or Make webhook and marks it exported."
                            passive
                          />
                        </button>
                      </form>
                    ) : null}
                  </article>
                ))
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <h4 className="text-base font-semibold">
                    No link fixes generated yet
                  </h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Run a crawl, then generate fixes from the current
                    internal-link issue queue.
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function StatusButton({
  fixId,
  icon,
  label,
  status,
  subtle = false,
}: {
  fixId: string;
  icon: React.ReactNode;
  label: string;
  status: string;
  subtle?: boolean;
}) {
  return (
    <form action={updateLinkFixAction}>
      <input type="hidden" name="fixId" value={fixId} />
      <input type="hidden" name="status" value={status} />
      <button
        className={`inline-flex h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${
          subtle
            ? "border border-slate-200 text-slate-600 hover:bg-slate-50"
            : "bg-slate-950 text-white hover:bg-slate-800"
        }`}
      >
        {icon}
        {label}
      </button>
    </form>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function DetailBlock({
  danger = false,
  label,
  value,
}: {
  danger?: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {label}
      </p>
      <p
        className={`mt-2 break-words text-sm font-medium ${
          danger ? "text-red-600" : "text-slate-700"
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function isLinkFixStatus(value: string | undefined): value is LinkFixStatus {
  return Boolean(value && statuses.includes(value as LinkFixStatus));
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusClass(status: string) {
  if (status === "APPROVED") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "EXPORTED") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "APPLIED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "DISMISSED") {
    return "bg-slate-100 text-slate-500";
  }

  return "bg-violet-50 text-violet-700";
}

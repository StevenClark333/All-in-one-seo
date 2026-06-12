import Link from "next/link";
import type React from "react";
import type { LinkFixStatus } from "@prisma/client";
import {
  CheckCircle2,
  ClipboardCheck,
  Download,
  Hammer,
  Pencil,
  Play,
  Send,
  X,
} from "lucide-react";
import {
  generateLinkFixesAction,
  sendLinkFixToAutomationAction,
  updateLinkFixAction,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { InfoTooltip } from "@/components/info-tooltip";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { PRODUCT_BEGINNER_COPY } from "@/lib/product-copy";
import {
  buildLinkFixLifecycleSteps,
  getLinkFixCenterData,
  type LinkFixLifecycleStepStatus,
} from "@/lib/link-fixes";
import { buildPlatformFixBrief } from "@/lib/platform-fix-briefs";

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
  const {
    automationIntegrations,
    domains,
    suggestions,
    counts,
    unavailableWordPressReceivers,
    verificationCounts,
  } = await getLinkFixCenterData({
    domainId: selectedDomainId,
    status: isLinkFixStatus(selectedStatus) ? selectedStatus : undefined,
  });
  const selectedDomain = domains.find(
    (domain) => domain.id === selectedDomainId,
  );
  const readyToReview = counts.DRAFT + counts.APPROVED;
  const sentOrApplied = counts.EXPORTED + counts.APPLIED;
  const needsCheck =
    verificationCounts.PENDING + verificationCounts.STILL_FAILING;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <AppSidebar active="Fix Center" activeDomainId={selectedDomainId} />
      <main className="min-w-0 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-6">
          <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-500">
                  Fix Center
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                  Fixes
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Work through suggested fixes without digging through website
                  check data. Review one ready fix, send the instruction, then
                  check that the website improved.
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
                <button className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
                  <Play className="size-4" aria-hidden="true" />
                  Generate fixes
                  <InfoTooltip
                    label="Create or refresh suggested fixes from current website-link problems."
                    passive
                  />
                </button>
              </form>
            </div>

            <FixComfortPlan
              deliveryWorkflowCount={automationIntegrations.length}
              needsCheck={needsCheck}
              readyToReview={readyToReview}
              sentOrApplied={sentOrApplied}
            />

            <details className="mt-4 rounded-lg border border-slate-200 bg-slate-50">
              <summary className="p-4">
                <h3 className="text-sm font-semibold text-slate-800">
                  More fix progress
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  Optional counts for teams that want the full behind-the-scenes
                  progress.
                </p>
              </summary>
              <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-5">
                {statuses.map((status) => (
                  <Metric
                    key={status}
                    label={formatStatus(status)}
                    value={counts[status]}
                  />
                ))}
              </div>
              <div className="grid gap-3 border-t border-slate-200 p-4 sm:grid-cols-4">
                <Metric
                  label="Waiting to check"
                  value={verificationCounts.PENDING}
                />
                <Metric
                  label="Fix worked"
                  value={verificationCounts.VERIFIED_FIXED}
                />
                <Metric
                  label="Still needs help"
                  value={verificationCounts.STILL_FAILING}
                />
                <Metric
                  label="Not checked yet"
                  value={verificationCounts.NOT_CHECKED}
                />
              </div>
            </details>
          </section>

          <ProjectWorkspaceBar
            active="fixes"
            domainId={selectedDomainId}
            note="Fix ideas, send options, and progress notes are filtered to this website."
            returnPath="/fix-center"
          />

          <section
            id="fix-list"
            className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <h3 className="inline-flex items-center gap-2 text-lg font-semibold">
                  Fix list
                  <InfoTooltip label="Filter and work through suggested website-link fixes by website and progress." />
                </h3>
                <p className="mt-1 text-sm text-slate-600">
                  {selectedDomain
                    ? `Showing fixes for ${selectedDomain.domain}.`
                    : "Showing fixes across all active websites."}
                </p>
              </div>
              <details className="rounded-lg border border-slate-200 bg-slate-50 xl:min-w-[520px]">
                <summary className="p-3 text-sm font-semibold text-slate-700">
                  Adjust fix view
                </summary>
                <form
                  className="grid gap-2 border-t border-slate-200 p-3 sm:grid-cols-[minmax(0,260px)_160px_auto_auto]"
                  method="get"
                >
                  <select
                    name="domainId"
                    defaultValue={selectedDomainId ?? ""}
                    className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700"
                  >
                    <option value="">All websites</option>
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
                  <button className="h-10 rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                    Show fixes
                  </button>
                  {selectedDomainId || selectedStatus ? (
                    <Link
                      href={
                        selectedDomainId
                          ? `/domains/${selectedDomainId}/workspace`
                          : "/fix-center"
                      }
                      className="inline-flex h-10 items-center justify-center rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                    >
                      {selectedDomainId ? "Workspace" : "Clear"}
                    </Link>
                  ) : null}
                </form>
              </details>
            </div>

            <div className="mt-5 grid gap-4">
              {suggestions.length ? (
                suggestions.map((suggestion) => {
                  const fixDestinations = automationIntegrations.filter(
                    (integration) =>
                      integration.provider !== "WORDPRESS_RECEIVER" ||
                      integration.domainId === suggestion.domainId,
                  );
                  const blockedWordPressReceiver =
                    unavailableWordPressReceivers.find(
                      (integration) =>
                        integration.domainId === suggestion.domainId,
                    );
                  const lifecycleSteps = buildLinkFixLifecycleSteps({
                    appliedAt: suggestion.appliedAt,
                    approvedAt: suggestion.approvedAt,
                    dismissedAt: suggestion.dismissedAt,
                    exportedAt: suggestion.exportedAt,
                    status: suggestion.status,
                    verificationCheckedAt: suggestion.verificationCheckedAt,
                    verificationMessage: suggestion.verificationMessage,
                    verificationStatus: suggestion.verificationStatus,
                  });
                  const platformBrief = buildPlatformFixBrief({
                    anchorText: suggestion.anchorText,
                    brokenUrl: suggestion.brokenUrl,
                    domain: suggestion.domain.domain,
                    platform: suggestion.domain.platform,
                    sourceUrl: suggestion.sourceUrl,
                    suggestedUrl: suggestion.suggestedUrl,
                  });

                  return (
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
                            <span
                              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${getVerificationClass(
                                suggestion.verificationStatus,
                              )}`}
                            >
                              {formatVerificationStatus(
                                suggestion.verificationStatus,
                              )}
                            </span>
                            <span className="text-sm font-medium text-slate-500">
                              {suggestion.domain.client?.name
                                ? `${suggestion.domain.client.name} - `
                                : ""}
                              {suggestion.domain.domain}
                            </span>
                          </div>
                          <h4 className="mt-3 text-base font-semibold">
                            {suggestion.brokenUrl
                              ? PRODUCT_BEGINNER_COPY.fixesReplaceStoppedLinkTitle
                              : PRODUCT_BEGINNER_COPY.fixesAddHelpfulLinkTitle}
                          </h4>
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            {suggestion.reason}
                          </p>
                          <p className="mt-3 rounded-md bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-800">
                            Do this: {suggestion.manualInstructions}
                          </p>
                        </div>
                        {suggestion.issue ? (
                          <Link
                            href={`/issues/${suggestion.issue.id}`}
                            className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                          >
                            View problem
                          </Link>
                        ) : null}
                      </div>

                      <div className="mt-4 grid gap-3 lg:grid-cols-3">
                        <DetailBlock
                          label={PRODUCT_BEGINNER_COPY.fixesPageWithLinkLabel}
                          value={suggestion.sourceUrl}
                        />
                        {suggestion.brokenUrl ? (
                          <DetailBlock
                            label={PRODUCT_BEGINNER_COPY.fixesStoppedLinkLabel}
                            value={suggestion.brokenUrl}
                            danger
                          />
                        ) : null}
                        <DetailBlock
                          label={PRODUCT_BEGINNER_COPY.fixesBetterPageLabel}
                          value={suggestion.suggestedUrl}
                        />
                      </div>

                      <form
                        action={updateLinkFixAction}
                        className="mt-4 grid gap-3 rounded-md bg-slate-50 p-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,260px)_auto]"
                      >
                        <input
                          type="hidden"
                          name="fixId"
                          value={suggestion.id}
                        />
                        <label className="grid gap-1 text-sm font-medium text-slate-600">
                          {PRODUCT_BEGINNER_COPY.fixesBetterPageLabel}
                          <input
                            name="suggestedUrl"
                            defaultValue={suggestion.suggestedUrl}
                            className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700"
                          />
                        </label>
                        <label className="grid gap-1 text-sm font-medium text-slate-600">
                          {PRODUCT_BEGINNER_COPY.fixesLinkTextLabel}
                          <input
                            name="anchorText"
                            defaultValue={suggestion.anchorText ?? ""}
                            className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700"
                          />
                        </label>
                        <button className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md border border-slate-300 px-4 text-sm font-semibold text-slate-700 transition hover:bg-white">
                          <Pencil className="size-4" aria-hidden="true" />
                          Save edit
                        </button>
                      </form>

                      <details className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                          Show full manual instruction
                        </summary>
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                          Full fix instruction
                          <InfoTooltip label="Copy this into WordPress, Webflow, Shopify, a teammate note, or a client update." />
                        </p>
                        <p className="mt-2 text-sm leading-6 text-slate-700">
                          {suggestion.manualInstructions}
                        </p>
                        {suggestion.verificationMessage ? (
                          <p className="mt-2 text-sm leading-6 text-slate-600">
                            <span className="font-semibold">Check note:</span>{" "}
                            {suggestion.verificationMessage}
                          </p>
                        ) : null}
                      </details>

                      <details className="mt-4 rounded-md border border-blue-100 bg-blue-50 p-3">
                        <summary className="cursor-pointer text-sm font-semibold text-blue-950">
                          Website platform steps
                        </summary>
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-sm font-semibold text-blue-700">
                              Fix note
                            </p>
                            <h5 className="mt-1 text-sm font-semibold text-blue-950">
                              {platformBrief.platformLabel} -{" "}
                              {formatDeliveryMode(platformBrief.deliveryMode)}
                            </h5>
                            <p className="mt-2 text-sm leading-6 text-blue-900">
                              {platformBrief.summary}
                            </p>
                          </div>
                          <Link
                            href={`/api/exports/fix-brief?fixId=${suggestion.id}`}
                            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-3 text-sm font-semibold text-blue-900 transition hover:bg-blue-100"
                          >
                            <Download className="size-4" aria-hidden="true" />
                            Download note
                          </Link>
                        </div>
                        <div className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
                          <div className="rounded-md border border-blue-100 bg-white p-3">
                            <p className="text-sm font-semibold text-slate-600">
                              Steps to send
                            </p>
                            <ol className="mt-2 grid gap-2 text-sm leading-6 text-slate-700">
                              {platformBrief.steps.slice(0, 4).map((step) => (
                                <li key={step}>{step}</li>
                              ))}
                            </ol>
                          </div>
                          <div className="rounded-md border border-blue-100 bg-white p-3">
                            <p className="text-sm font-semibold text-slate-600">
                              Snippet
                            </p>
                            <pre className="mt-2 max-h-36 overflow-auto rounded-md bg-slate-950 p-3 text-xs leading-5 text-slate-50">
                              <code>
                                {platformBrief.snippets[0]?.code ??
                                  "No snippet required."}
                              </code>
                            </pre>
                          </div>
                        </div>
                      </details>

                      <details className="mt-4 rounded-md border border-slate-200 bg-white p-3">
                        <summary className="cursor-pointer text-sm font-semibold text-slate-700">
                          Progress notes and timestamps
                        </summary>
                        <p className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600">
                          Fix progress notes
                          <InfoTooltip label="Shows where this fix is after approval, sending, website application, and the next website check." />
                        </p>
                        <div className="mt-3 grid gap-2 lg:grid-cols-4">
                          {lifecycleSteps.map((step) => (
                            <div
                              key={step.label}
                              className={`rounded-md border p-3 ${getLifecycleStepClass(
                                step.status,
                              )}`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <p className="text-sm font-semibold">
                                  {step.label}
                                </p>
                                <span className="shrink-0 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-semibold">
                                  {formatLifecycleStatus(step.status)}
                                </span>
                              </div>
                              <p className="mt-2 text-xs leading-5">
                                {step.detail}
                              </p>
                              {step.timestamp ? (
                                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.12em] opacity-70">
                                  {formatDateTime(step.timestamp)}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </details>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <StatusButton
                          fixId={suggestion.id}
                          status="APPROVED"
                          label="Approve fix"
                          icon={<CheckCircle2 className="size-4" />}
                        />
                        <StatusButton
                          fixId={suggestion.id}
                          status="EXPORTED"
                          label="Mark sent"
                          icon={<Download className="size-4" />}
                        />
                        <StatusButton
                          fixId={suggestion.id}
                          status="APPLIED"
                          label="Mark fixed"
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
                      {fixDestinations.length ? (
                        <form
                          action={sendLinkFixToAutomationAction}
                          className="mt-3 grid gap-2 rounded-md border border-slate-200 bg-white p-3 sm:grid-cols-[minmax(0,1fr)_auto]"
                        >
                          <input
                            type="hidden"
                            name="fixId"
                            value={suggestion.id}
                          />
                          <label className="grid gap-1 text-sm font-medium text-slate-600">
                            Send to connection
                            <select
                              name="integrationId"
                              className="h-10 min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700"
                            >
                              {fixDestinations.map((integration) => (
                                <option
                                  key={integration.id}
                                  value={integration.id}
                                >
                                  {formatConnectionOption(
                                    integration.label,
                                    integration.provider,
                                  )}
                                </option>
                              ))}
                            </select>
                          </label>
                          <button className="inline-flex h-10 items-center justify-center gap-2 self-end rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
                            <Send className="size-4" aria-hidden="true" />
                            Send fix
                            <InfoTooltip
                              label="Sends this fix to the selected connection and marks it sent."
                              passive
                            />
                          </button>
                        </form>
                      ) : null}
                      {blockedWordPressReceiver ? (
                        <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm leading-6 text-amber-900">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="font-semibold">
                                WordPress is not available for this fix yet
                              </p>
                              <p className="mt-1">
                                {blockedWordPressReceiver.readinessMessage}
                              </p>
                            </div>
                            <Link
                              href={`/integrations${
                                suggestion.domainId
                                  ? `?domainId=${suggestion.domainId}`
                                  : ""
                              }`}
                              className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-amber-300 bg-white px-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
                            >
                              {PRODUCT_BEGINNER_COPY.openConnections}
                            </Link>
                          </div>
                        </div>
                      ) : null}
                      {!fixDestinations.length && !blockedWordPressReceiver ? (
                        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm leading-6 text-slate-600">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <p>
                              No send option is connected for this website yet.
                              Connect WordPress, Zapier, or Make to send fixes
                              directly from here.
                            </p>
                            <Link
                              href={`/integrations${
                                suggestion.domainId
                                  ? `?domainId=${suggestion.domainId}`
                                  : ""
                              }`}
                              className="inline-flex h-9 shrink-0 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                            >
                              {PRODUCT_BEGINNER_COPY.openConnections}
                            </Link>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <div className="rounded-lg border border-dashed border-slate-300 p-8 text-center">
                  <h4 className="text-base font-semibold">
                    No fixes ready yet
                  </h4>
                  <p className="mt-2 text-sm text-slate-600">
                    Generate fixes after a website check. When the portal finds
                    a ready-to-send link fix, it will appear here with the next
                    button to press.
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

function FixComfortPlan({
  deliveryWorkflowCount,
  needsCheck,
  readyToReview,
  sentOrApplied,
}: {
  deliveryWorkflowCount: number;
  needsCheck: number;
  readyToReview: number;
  sentOrApplied: number;
}) {
  return (
    <section className="mt-5 rounded-lg border border-orange-100 bg-orange-50/60 p-5">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Fix comfort plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Pick one fix, send it, then check it.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Keep this page simple: review the ready fixes first, use connected
            send options when possible, and only open progress detail when you
            need the full history.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={<ClipboardCheck className="size-4" aria-hidden="true" />}
            label="Review"
            value={
              readyToReview ? `${readyToReview} ready fixes` : "No fixes ready"
            }
            detail="Approve the fix if the suggested page and link text look right."
            href="#fix-list"
          />
          <PlanTile
            icon={<Send className="size-4" aria-hidden="true" />}
            label="Send"
            value={
              deliveryWorkflowCount
                ? `${deliveryWorkflowCount} send options`
                : "Connect a send option"
            }
            detail={`${sentOrApplied} fixes have been sent or applied.`}
            href="/integrations"
          />
          <PlanTile
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
            label="Check"
            value={
              needsCheck
                ? `${needsCheck} need a check`
                : PRODUCT_BEGINNER_COPY.fixesNoCheckNeeded
            }
            detail="After the fix is applied, run a new check to confirm the page improved."
            href="#fix-list"
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
      <button className={getStatusButtonClass(status, subtle)}>
        {icon}
        {label}
      </button>
    </form>
  );
}

function getStatusButtonClass(status: string, subtle: boolean) {
  if (subtle) {
    return "inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50";
  }

  if (status === "APPROVED" || status === "APPLIED") {
    return "inline-flex h-9 items-center gap-2 rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-700";
  }

  if (status === "EXPORTED") {
    return "inline-flex h-9 items-center gap-2 rounded-md bg-orange-600 px-3 text-sm font-semibold text-white transition hover:bg-orange-700";
  }

  return "inline-flex h-9 items-center gap-2 rounded-md bg-slate-700 px-3 text-sm font-semibold text-white transition hover:bg-slate-800";
}

function Metric({ label, value }: { label: string; value: number }) {
  const isHealthy =
    label === "Fixed" ||
    label === "Fix worked" ||
    label === "Approved" ||
    label === "Sent";
  const isProblem = label === "Still needs help";
  const styles = isHealthy
    ? "border-emerald-200 bg-emerald-50 text-emerald-900"
    : isProblem
      ? "border-red-200 bg-red-50 text-red-900"
      : "border-slate-200 bg-slate-50 text-slate-900";

  return (
    <div className={`rounded-md border p-3 ${styles}`}>
      <p className="text-sm font-medium opacity-75">{label}</p>
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
      <p className="text-sm font-semibold text-slate-600">{label}</p>
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
  if (value === "DRAFT") {
    return "Ready to review";
  }

  if (value === "APPROVED") {
    return "Approved";
  }

  if (value === "EXPORTED") {
    return "Sent";
  }

  if (value === "APPLIED") {
    return "Fixed";
  }

  if (value === "DISMISSED") {
    return "Dismissed";
  }

  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatVerificationStatus(value: string) {
  if (value === "VERIFIED_FIXED") {
    return "Fix worked";
  }

  if (value === "STILL_FAILING") {
    return "Still needs help";
  }

  if (value === "PENDING") {
    return "Waiting to check";
  }

  return "Not checked yet";
}

function formatConnectionOption(label: string, provider: string) {
  const providerLabel = formatConnectionProvider(provider);

  return providerLabel ? `${label} - ${providerLabel}` : label;
}

function formatConnectionProvider(provider: string) {
  if (provider === "WORDPRESS_RECEIVER") {
    return "WordPress";
  }

  if (provider === "ZAPIER") {
    return "Zapier";
  }

  if (provider === "MAKE") {
    return "Make";
  }

  return "";
}

function formatDeliveryMode(value: string) {
  return value
    .replace(/receiver or editor handoff/gi, "receiver or editor note")
    .replace(/theme handoff/gi, "theme note")
    .replace(/CMS handoff/gi, "CMS note")
    .replace(/developer handoff/gi, "developer note")
    .replace(/editor handoff/gi, "editor note")
    .replace(/handoff/gi, "note");
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

function getVerificationClass(status: string) {
  if (status === "VERIFIED_FIXED") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "STILL_FAILING") {
    return "bg-red-50 text-red-700";
  }

  if (status === "PENDING") {
    return "bg-amber-50 text-amber-700";
  }

  return "bg-slate-100 text-slate-500";
}

function getLifecycleStepClass(status: LinkFixLifecycleStepStatus) {
  if (status === "COMPLETE") {
    return "border-emerald-200 bg-emerald-50 text-emerald-900";
  }

  if (status === "CURRENT") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-slate-200 bg-slate-50 text-slate-500";
}

function formatLifecycleStatus(status: LinkFixLifecycleStepStatus) {
  if (status === "COMPLETE") {
    return "Done";
  }

  if (status === "CURRENT") {
    return "Next";
  }

  return "Waiting for turn";
}

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(value);
}

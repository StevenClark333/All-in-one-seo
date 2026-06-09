import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Archive,
  ArrowLeft,
  CheckCircle2,
  FileText,
  Play,
  ShieldCheck,
  Trash2,
} from "lucide-react";
import {
  archiveDomainAction,
  deleteDomainAction,
  updateDomainAction,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { getDomainDetailData } from "@/lib/management-queries";
import {
  formatPageCheckDate,
  formatPageMetaText,
} from "@/lib/page-display-labels";
import {
  formatWebsiteClient,
  formatWebsiteHealth,
  formatWebsiteResponse,
} from "@/lib/website-display-labels";

export const dynamic = "force-dynamic";

type DomainDetailPageProps = {
  params: Promise<{ domainId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const platforms = [
  "WORDPRESS",
  "SHOPIFY",
  "WEBFLOW",
  "WIX",
  "SQUARESPACE",
  "CUSTOM",
  "UNKNOWN",
];

const crawlFrequencies = ["WEEKLY", "DAILY", "MANUAL"];

export default async function DomainDetailPage({
  params,
  searchParams,
}: DomainDetailPageProps) {
  const { domainId } = await params;
  const query = searchParams ? await searchParams : {};
  const error = getSingle(query.error);
  const { workspace, clients, domain } = await getDomainDetailData(domainId);

  if (!domain) {
    notFound();
  }

  const latestCrawl = domain.crawlRuns.at(0);
  const latestVerification = domain.verifications.at(0);
  const isVerified =
    domain.verificationStatus === "VERIFIED" ||
    domain.verifications.some(
      (verification) => verification.status === "VERIFIED",
    );
  const latestScore = domain.scoreHistory.at(0);
  const scriptSrc = process.env.NEXT_PUBLIC_SCRIPT_URL ?? "/seo.js";
  const scriptSnippet = `<script async src="${scriptSrc}" data-site-id="${domain.id}"></script>`;
  const criticalIssues = domain.issues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;
  const warningIssues = domain.issues.filter(
    (issue) => issue.severity === "WARNING",
  ).length;
  const visiblePages = domain.pages.slice(0, 10);
  const hiddenPageCount = Math.max(
    domain.pages.length - visiblePages.length,
    0,
  );
  const visibleIssues = domain.issues.slice(0, 5);
  const hiddenIssueCount = Math.max(
    domain.issues.length - visibleIssues.length,
    0,
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Sites" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <div className="flex flex-wrap gap-2">
            <Link
              href="/domains"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ArrowLeft className="size-4" aria-hidden="true" />
              Websites
            </Link>
            <Link
              href={`/domains/${domain.id}/workspace`}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700"
            >
              Website workspace
              <InfoTooltip
                label="Open the focused website workspace for pages, problems, fixes, updates, and connections."
                passive
                side="left"
              />
            </Link>
            <Link
              href={`/domains/${domain.id}/verification`}
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Verification
              <InfoTooltip
                label="Open setup instructions and ownership checks for this website."
                passive
                side="left"
              />
            </Link>
          </div>

          <header className="mt-6 flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"} -{" "}
                {formatWebsiteClient(domain.client?.name)}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                {domain.domain}
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep this website simple: finish setup, run a website check,
                then open the problem that matters most.
              </p>
            </div>

            <form action="/api/domains/start-crawl" method="post">
              <input type="hidden" name="domainId" value={domain.id} />
              <input
                type="hidden"
                name="returnTo"
                value={`/domains/${domain.id}`}
              />
              <button
                disabled={!isVerified}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                <Play className="size-4" aria-hidden="true" />
                Check website
                <InfoTooltip
                  label="Run a fresh website check to update pages, links, setup files, and problem changes."
                  passive
                  side="left"
                />
              </button>
            </form>
          </header>

          {error ? (
            <StatusNotice
              title="Website check could not finish"
              message={getDomainErrorMessage(error)}
            />
          ) : null}

          <ProjectDetailPlan
            criticalIssues={criticalIssues}
            isVerified={isVerified}
            pageCount={domain.pages.length}
            warningIssues={warningIssues}
          />

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric
              help="Current website health based on open problems and recent check signals."
              label="Health"
              value={formatWebsiteHealth(domain.healthScore)}
            />
            <Metric
              help="Pages currently known from recent website checks."
              label="Pages checked"
              value={domain.pages.length}
            />
            <Metric
              help="Urgent problems first, planned work second. Use this to decide what to open."
              label="Urgent / planned"
              value={`${criticalIssues} / ${warningIssues}`}
            />
            <Metric
              help="Most recent website check state."
              label="Last check"
              value={
                latestCrawl
                  ? formatWebsiteCheckStatus(latestCrawl.status)
                  : "Not started"
              }
            />
          </section>

          {latestScore ? (
            <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold">
                <HelpLabel help="Plain notes behind the latest website health score.">
                  Health notes
                </HelpLabel>
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {readScoreReasons(latestScore.reasonsJson).map((reason) => (
                  <div
                    key={reason}
                    className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600"
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div
              id="project-pages"
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">
                  <HelpLabel help="The first pages worth reviewing from this website. More detail stays tucked away below.">
                    Pages to review
                  </HelpLabel>
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  A short page list with response, title, open problems, and the
                  last check date.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-sm text-slate-500">
                    <tr>
                      <th className="px-5 py-3 font-semibold">Page</th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Whether the page answered normally during the latest check.">
                          Response
                        </HelpLabel>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Page title found during the latest check.">
                          Title
                        </HelpLabel>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Number of open problems attached to this page.">
                          Problems
                        </HelpLabel>
                      </th>
                      <th className="px-5 py-3 font-semibold">
                        <HelpLabel help="Date this page was last checked.">
                          Last check
                        </HelpLabel>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {visiblePages.length ? (
                      visiblePages.map((page) => {
                        const snapshot = page.snapshots.at(0);

                        return (
                          <tr key={page.id}>
                            <td className="px-5 py-4">
                              <Link
                                href={`/pages/${page.id}`}
                                className="font-medium underline-offset-4 hover:underline"
                              >
                                {page.url}
                              </Link>
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {formatWebsiteResponse(snapshot?.statusCode)}
                            </td>
                            <td className="max-w-[280px] truncate px-5 py-4 text-slate-600">
                              {formatPageMetaText(snapshot?.title)}
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {page.issues.length}
                            </td>
                            <td className="px-5 py-4 text-slate-600">
                              {formatPageCheckDate(page.lastCrawledAt)}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td
                          className="px-5 py-8 text-center text-slate-500"
                          colSpan={5}
                        >
                          No pages checked yet. Run the first website check
                          after verification to see page health here.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              {hiddenPageCount ? (
                <details className="border-t border-slate-200">
                  <summary className="cursor-pointer list-none p-5 text-sm font-semibold text-orange-700">
                    Show {hiddenPageCount.toLocaleString()} more pages
                  </summary>
                  <div className="border-t border-slate-200 p-5 text-sm leading-6 text-slate-500">
                    Open the full Pages area when you need the complete list.
                    This view keeps the first decision short.
                    <div className="mt-3">
                      <Link
                        href={`/pages?domainId=${domain.id}`}
                        className="inline-flex h-9 items-center rounded-md border border-orange-200 bg-white px-3 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
                      >
                        Open all pages
                      </Link>
                    </div>
                  </div>
                </details>
              ) : null}
            </div>

            <aside className="grid gap-6">
              <section
                id="project-settings"
                className="rounded-lg border border-slate-200 bg-white shadow-sm"
              >
                <details>
                  <summary className="p-5">
                    <h3 className="font-semibold">
                      <HelpLabel help="Optional setup details for client, website platform, and check rhythm.">
                        Website details
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional setup details for client, platform, check rhythm,
                      and install status.
                    </p>
                  </summary>
                  <div className="border-t border-slate-200 p-5">
                    <form action={updateDomainAction} className="grid gap-4">
                      <input type="hidden" name="domainId" value={domain.id} />
                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          Client or brand
                        </span>
                        <select
                          name="clientId"
                          defaultValue={domain.clientId ?? ""}
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                        >
                          <option value="">No client yet</option>
                          {clients.map((client) => (
                            <option key={client.id} value={client.id}>
                              {client.name}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          Website platform
                        </span>
                        <select
                          name="platform"
                          defaultValue={domain.platform}
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                        >
                          {platforms.map((platform) => (
                            <option key={platform} value={platform}>
                              {formatWebsitePlatform(platform)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label className="grid gap-2">
                        <span className="text-sm font-medium text-slate-700">
                          <HelpLabel help="How often this website should be checked when scheduled checks are enabled.">
                            Check rhythm
                          </HelpLabel>
                        </span>
                        <select
                          name="crawlFrequency"
                          defaultValue={domain.crawlFrequency}
                          className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                        >
                          {crawlFrequencies.map((frequency) => (
                            <option key={frequency} value={frequency}>
                              {formatCheckRhythm(frequency)}
                            </option>
                          ))}
                        </select>
                      </label>

                      <button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                        Save website details
                      </button>
                    </form>

                    <dl className="mt-5 grid gap-4 border-t border-slate-200 pt-5">
                      <Meta
                        help="Whether ownership has been confirmed for this website."
                        label="Ownership"
                        value={
                          isVerified
                            ? "Ownership confirmed"
                            : formatOwnershipStatus(domain.verificationStatus)
                        }
                      />
                      <Meta
                        help="Whether the optional website tag has reported page data."
                        label="Website tag"
                        value={formatWebsiteTagStatus(domain.scriptStatus)}
                      />
                      <Meta
                        help="Most recent ownership value created for this website."
                        label="Latest setup value"
                        value={
                          latestVerification?.token ?? "No setup value yet"
                        }
                      />
                    </dl>
                  </div>
                </details>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <details>
                  <summary className="p-5">
                    <h3 className="font-semibold text-slate-800">
                      <HelpLabel help="Archive hides a website from active views. Delete permanently removes it and its history.">
                        Website safety
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional controls for hiding or deleting this website.
                    </p>
                  </summary>
                  <div className="border-t border-slate-200 p-5">
                    <p className="text-sm leading-6 text-slate-500">
                      Archive hides this website from active dashboards. Delete
                      removes the website and its check history permanently.
                    </p>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <form action={archiveDomainAction}>
                        <input
                          type="hidden"
                          name="domainId"
                          value={domain.id}
                        />
                        <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          <Archive className="size-4" aria-hidden="true" />
                          Archive
                        </button>
                      </form>
                      <form action={deleteDomainAction}>
                        <input
                          type="hidden"
                          name="domainId"
                          value={domain.id}
                        />
                        <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-red-200 bg-white px-4 text-sm font-medium text-red-700 transition hover:bg-red-50">
                          <Trash2 className="size-4" aria-hidden="true" />
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                </details>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <details>
                  <summary className="p-5">
                    <h3 className="font-semibold">
                      <HelpLabel help="Small optional website tag that helps collect rendered page signals.">
                        Website tag
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional tag for pages that need a browser-style check.
                    </p>
                  </summary>
                  <div className="border-t border-slate-200 p-5">
                    <p className="text-sm leading-6 text-slate-500">
                      Add this tag before the closing head tag to capture
                      rendered page details and Core Web Vitals.
                    </p>
                    <code className="mt-4 block break-all rounded-md border border-slate-200 bg-slate-950 p-3 font-mono text-xs leading-6 text-white">
                      {scriptSnippet}
                    </code>
                    <dl className="mt-4 grid gap-4">
                      <Meta
                        help="Unique website identifier used by the optional tag."
                        label="Site ID"
                        value={domain.id}
                      />
                      <Meta
                        help="Whether the optional tag has sent any page data."
                        label="Tag status"
                        value={formatWebsiteTagStatus(domain.scriptStatus)}
                      />
                    </dl>
                  </div>
                </details>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <details>
                  <summary className="p-5">
                    <h3 className="font-semibold">
                      <HelpLabel help="Optional setup files found before deeper page checks.">
                        Website setup files
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Optional setup files found during the last website check.
                    </p>
                  </summary>
                  <div className="grid gap-3 border-t border-slate-200 p-5">
                    {domain.artifacts.length ? (
                      domain.artifacts.map((artifact) => (
                        <div
                          key={artifact.id}
                          className="rounded-md border border-slate-200 bg-slate-50 p-3"
                        >
                          <p className="text-sm font-semibold">
                            {formatSetupFileType(artifact.type)}
                          </p>
                          <p className="mt-1 truncate text-xs text-slate-500">
                            {artifact.url}
                          </p>
                        </div>
                      ))
                    ) : (
                      <EmptyNote
                        title="No setup files yet"
                        body="Run a website check to look for page-list and access-helper files."
                      />
                    )}
                  </div>
                </details>
              </section>

              <section
                id="project-issues"
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="font-semibold">
                  <HelpLabel help="The first problems worth opening for this website.">
                    Priority problems
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  {visibleIssues.length ? (
                    visibleIssues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/issues/${issue.id}`}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                      >
                        <p className="text-sm font-semibold">
                          {softenWebsiteProblemTitle(issue.title)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatProblemImportance(issue.severity)} -{" "}
                          {issue.page?.url ?? "Whole website"}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <EmptyNote
                      title="No open problems"
                      body="This website does not have priority problems right now."
                    />
                  )}
                  {hiddenIssueCount ? (
                    <Link
                      href={`/issues?domainId=${domain.id}`}
                      className="rounded-md border border-orange-200 bg-orange-50/70 p-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
                    >
                      Open {hiddenIssueCount.toLocaleString()} more problems
                    </Link>
                  ) : null}
                </div>
              </section>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}

function ProjectDetailPlan({
  criticalIssues,
  isVerified,
  pageCount,
  warningIssues,
}: {
  criticalIssues: number;
  isVerified: boolean;
  pageCount: number;
  warningIssues: number;
}) {
  const issueCount = criticalIssues + warningIssues;

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Website care plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Finish setup, check, then fix the clearest problem.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with verification if the website is new. Once it is verified,
            run a website check and open the highest-priority problem.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={<ShieldCheck className="size-4" aria-hidden="true" />}
            label="Setup"
            value={isVerified ? "Ownership confirmed" : "Verify first"}
            detail="Ownership must be confirmed before a full check can run."
            href="#project-settings"
          />
          <PlanTile
            icon={<Play className="size-4" aria-hidden="true" />}
            label="Website check"
            value={pageCount ? `${pageCount} pages found` : "Run first check"}
            detail="A check collects pages, titles, links, and problem signals."
            href="#project-pages"
          />
          <PlanTile
            icon={
              issueCount ? (
                <FileText className="size-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )
            }
            label="Problems"
            value={issueCount ? `${issueCount} need review` : "Nothing urgent"}
            detail="Open priority problems after the check finishes."
            href="#project-issues"
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

function Metric({
  help,
  label,
  value,
}: {
  help: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function Meta({
  help,
  label,
  value,
}: {
  help: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">
        <HelpLabel help={help}>{label}</HelpLabel>
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function EmptyNote({ body, title }: { body: string; title: string }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 leading-5">{body}</p>
    </div>
  );
}

function readScoreReasons(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "reasons" in value &&
    Array.isArray(value.reasons)
  ) {
    return value.reasons.filter(
      (reason): reason is string => typeof reason === "string",
    );
  }

  return ["No score reasons were recorded for this run."];
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatWebsitePlatform(value: string) {
  const labels: Record<string, string> = {
    CUSTOM: "Custom website",
    SHOPIFY: "Shopify store",
    SQUARESPACE: "Squarespace site",
    UNKNOWN: "Website platform unknown",
    WEBFLOW: "Webflow site",
    WIX: "Wix site",
    WORDPRESS: "WordPress site",
  };

  return labels[value] ?? formatEnum(value);
}

function formatCheckRhythm(value: string) {
  const labels: Record<string, string> = {
    DAILY: "Every day",
    MANUAL: "Only when I start it",
    WEEKLY: "Every week",
  };

  return labels[value] ?? formatEnum(value);
}

function formatWebsiteCheckStatus(value: string) {
  const labels: Record<string, string> = {
    CANCELLED: "Stopped",
    COMPLETED: "Finished",
    FAILED: "Needs review",
    QUEUED: "Waiting to start",
    RUNNING: "Checking now",
  };

  return labels[value] ?? formatEnum(value);
}

function formatOwnershipStatus(value: string) {
  const labels: Record<string, string> = {
    FAILED: "Needs setup help",
    PENDING: "Waiting for setup",
    UNVERIFIED: "Waiting for setup",
    VERIFIED: "Ownership confirmed",
  };

  return labels[value] ?? formatEnum(value);
}

function formatWebsiteTagStatus(value: string) {
  const labels: Record<string, string> = {
    DETECTED: "Tag connected",
    DISABLED: "Tag turned off",
    NOT_INSTALLED: "Tag not connected",
  };

  return labels[value] ?? formatEnum(value);
}

function formatSetupFileType(value: string) {
  const labels: Record<string, string> = {
    ROBOTS_TXT: "Robots file",
    SITEMAP: "Page list",
  };

  return labels[value] ?? formatEnum(value);
}

function formatProblemImportance(severity: string) {
  if (severity === "CRITICAL") {
    return "Urgent";
  }

  if (severity === "WARNING") {
    return "Planned";
  }

  return "Idea";
}

function softenWebsiteProblemTitle(title: string) {
  const exact: Record<string, string> = {
    "Canonical URL could not be checked": "Preferred page needs a check",
    "Canonical points to a non-200 URL": "Preferred page is not loading",
    "Duplicate H1": "Page heading repeats",
    "Duplicate meta description": "Page description repeats",
    "Duplicate meta descriptions across page template":
      "Page template repeats the same description",
    "Duplicate title": "Page title repeats",
    "Duplicate titles across page template":
      "Page template repeats the same title",
    "Homepage blocked by robots.txt": "Homepage blocked from Google",
    "Homepage became noindex after latest deploy":
      "Homepage was hidden from Google after deploy",
    "Missing canonical tag": "Preferred page is missing",
    "Missing H1": "Main heading is missing",
    "Missing image alt text": "Image description is missing",
    "Missing meta description": "Page description is missing",
    "Missing schema markup": "Page details for Google are missing",
    "Missing title": "Page title is missing",
    "Page marked noindex": "Page hidden from Google",
    "Product schema missing": "Product details for Google are missing",
    "Redirect chain": "Page takes too many redirects",
    "Sitemap URL is not internally linked":
      "Page list includes a hard-to-find page",
    "Weak meta description": "Page description could be clearer",
    "Weak title": "Page title could be clearer",
  };

  const mapped = exact[title] ?? title;

  return mapped
    .replace(/\bURLs?\b/g, "pages")
    .replace(/\bH1\b/g, "main heading")
    .replace(/\bMeta Description\b/g, "page description")
    .replace(/\bmeta description\b/g, "page description")
    .replace(/\bCanonical\b/g, "preferred page")
    .replace(/\bcanonical\b/g, "preferred page")
    .replace(/\bSchema\b/g, "Google details")
    .replace(/\bschema\b/g, "Google details")
    .replace(/\bSitemap\b/g, "page list")
    .replace(/\bsitemap\b/g, "page list")
    .replace(/\bRobots\.txt\b/g, "robots file")
    .replace(/\brobots\.txt\b/g, "robots file")
    .replace(/\bNoindex\b/g, "hidden from Google")
    .replace(/\bnoindex\b/g, "hidden from Google");
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getDomainErrorMessage(error: string) {
  const messages: Record<string, string> = {
    "crawl-failed":
      "The website check could not complete from local development. The failed check is recorded when one is created.",
    "crawl-invalid": "The check request was missing a valid website.",
    "crawl-not-verified": "Verify the website before starting a full check.",
    "crawl-page-limit":
      "This workspace has reached its page-check limit for the current plan.",
    "crawl-plan-limit":
      "This check rhythm is not available on the current workspace plan.",
    "domain-access": "You do not have access to that website.",
  };

  return messages[error] ?? "Please try again or inspect the website settings.";
}

function StatusNotice({ message, title }: { message: string; title: string }) {
  return (
    <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm leading-6">{message}</p>
    </div>
  );
}

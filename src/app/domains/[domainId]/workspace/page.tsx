import Link from "next/link";
import { notFound } from "next/navigation";
import type React from "react";
import {
  AlertTriangle,
  Bot,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  Hammer,
  Home,
  Link2,
  Play,
  PlugZap,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { generateReport } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel, InfoTooltip } from "@/components/info-tooltip";
import { getDomainWorkspaceData } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

type DomainWorkspacePageProps = {
  params: Promise<{ domainId: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function DomainWorkspacePage({
  params,
  searchParams,
}: DomainWorkspacePageProps) {
  const { domainId } = await params;
  const query = searchParams ? await searchParams : {};
  const error = getSingle(query.error);
  const { workspace, domain } = await getDomainWorkspaceData(domainId);

  if (!domain) {
    notFound();
  }

  const latestCrawl = domain.crawlRuns.at(0);
  const latestScore = domain.scoreHistory.at(0);
  const latestReport = domain.reports.at(0);
  const lastUpdatedAt =
    latestCrawl?.completedAt ?? latestCrawl?.createdAt ?? domain.updatedAt;
  const jsRenderingStatus = latestCrawl?.renderedCaptures.length
    ? "Rendered fallback used"
    : "Standard crawler";
  const shareHref =
    latestReport?.status === "PUBLISHED" && latestReport.shareToken
      ? `/share/reports/${latestReport.shareToken}`
      : latestReport
        ? `/reports/${latestReport.id}`
        : `/reports?domainId=${domain.id}`;
  const isVerified =
    domain.verificationStatus === "VERIFIED" ||
    domain.verifications.some(
      (verification) => verification.status === "VERIFIED",
    );
  const criticalIssues = domain.issues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;
  const warningIssues = domain.issues.filter(
    (issue) => issue.severity === "WARNING",
  ).length;
  const approvedFixes = domain.linkFixSuggestions.filter(
    (fix) => fix.status === "APPROVED",
  ).length;
  const sentFixes = domain.linkFixSuggestions.filter(
    (fix) => fix.status === "EXPORTED",
  ).length;
  const appliedFixes = domain.linkFixSuggestions.filter(
    (fix) => fix.status === "APPLIED",
  ).length;
  const wordpressReady = domain.integrations.some(
    (integration) =>
      integration.provider === "WORDPRESS_RECEIVER" &&
      integration.status === "CONNECTED",
  );
  const navItems = buildProjectTabs(domain.id);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Sites" />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-slate-500"
          >
            <Link
              href="/"
              className="inline-flex items-center gap-1 font-medium hover:text-slate-950"
            >
              <Home className="size-4" aria-hidden="true" />
              Home
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <Link href="/domains" className="font-medium hover:text-slate-950">
              SEO
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <Link href="/domains" className="font-medium hover:text-slate-950">
              Site Audit
            </Link>
            <ChevronRight className="size-4" aria-hidden="true" />
            <span className="font-semibold text-slate-800">
              {domain.domain}
            </span>
          </nav>

          <header className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
              <div className="min-w-0">
                <p className="text-sm font-medium text-slate-500">
                  {workspace?.name ?? "Workspace"} /{" "}
                  {domain.client?.name ?? "Unassigned client"}
                </p>
                <h2 className="mt-2 break-words text-3xl font-semibold tracking-normal">
                  Site Audit: {domain.domain}
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                  Active project workspace for this website. Audit, pages,
                  issues, fixes, reports, integrations, and settings stay scoped
                  to one domain.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <form action="/api/domains/start-crawl" method="post">
                  <input type="hidden" name="domainId" value={domain.id} />
                  <input
                    type="hidden"
                    name="returnTo"
                    value={`/domains/${domain.id}/workspace`}
                  />
                  <button
                    disabled={!isVerified}
                    className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
                  >
                    <Play className="size-4" aria-hidden="true" />
                    Rerun crawl
                    <InfoTooltip
                      label="Run a fresh domain crawl and update pages, issues, scores, and fix verification."
                      passive
                      side="left"
                    />
                  </button>
                </form>
                <form action={generateReport}>
                  <input type="hidden" name="domainId" value={domain.id} />
                  <input
                    type="hidden"
                    name="title"
                    value={`${domain.domain} SEO report`}
                  />
                  <button className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50">
                    <FileText className="size-4" aria-hidden="true" />
                    Generate report
                  </button>
                </form>
                <ActionLink
                  disabled={!latestReport}
                  href={
                    latestReport
                      ? `/reports/${latestReport.id}/pdf`
                      : `/reports?domainId=${domain.id}`
                  }
                  label="PDF"
                >
                  <Download className="size-4" aria-hidden="true" />
                </ActionLink>
                <ActionLink
                  href={`/pages?domainId=${domain.id}`}
                  label="Export"
                >
                  <ExternalLink className="size-4" aria-hidden="true" />
                </ActionLink>
                <ActionLink href={shareHref} label="Share">
                  <ExternalLink className="size-4" aria-hidden="true" />
                </ActionLink>
                <ActionLink href={`/domains/${domain.id}`} label="Settings">
                  <Settings className="size-4" aria-hidden="true" />
                </ActionLink>
              </div>
            </div>

            <dl className="mt-5 grid gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2 xl:grid-cols-7">
              <ContextItem label="Domain" value={domain.domain} />
              <ContextItem
                label="Client"
                value={domain.client?.name ?? "Unassigned"}
              />
              <ContextItem
                label="Last updated"
                value={formatDate(lastUpdatedAt)}
              />
              <ContextItem
                label="Pages crawled"
                value={`${latestCrawl?.pagesCrawled ?? 0} / ${domain.pages.length}`}
              />
              <ContextItem
                label="Platform"
                value={formatEnum(domain.platform)}
              />
              <ContextItem label="JS rendering" value={jsRenderingStatus} />
              <ContextItem
                label="Verification"
                value={
                  isVerified
                    ? "Verified"
                    : formatEnum(domain.verificationStatus)
                }
              />
            </dl>

            <div className="mt-5 flex items-center gap-2 overflow-x-auto border-b border-slate-200">
              {navItems.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`inline-flex h-11 shrink-0 items-center justify-center gap-2 border-b-2 px-3 text-sm font-semibold transition ${
                      item.active
                        ? "border-blue-600 text-slate-950"
                        : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-950"
                    }`}
                  >
                    <Icon className="size-4" aria-hidden="true" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </header>

          {error ? (
            <StatusNotice message={getDomainErrorMessage(error)} />
          ) : null}

          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Metric
              help="Latest site health score for this domain."
              label="Health score"
              value={domain.healthScore ?? latestScore?.score ?? "Pending"}
            />
            <Metric
              help="Pages known for this domain from crawler discovery."
              label="Pages"
              value={domain.pages.length}
            />
            <Metric
              help="Critical problems first, warnings second."
              label="Critical / warnings"
              value={`${criticalIssues} / ${warningIssues}`}
            />
            <Metric
              help="Most recent crawl run state."
              label="Last crawl"
              value={
                latestCrawl ? formatEnum(latestCrawl.status) : "Not started"
              }
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Domain-scoped work queue so one client site can be managed without cross-domain noise.">
                      Project work queue
                    </HelpLabel>
                  </h3>
                  <Link
                    href={`/issues?domainId=${domain.id}`}
                    className="text-sm font-semibold text-slate-600 underline-offset-4 hover:text-slate-950 hover:underline"
                  >
                    View all issues
                  </Link>
                </div>
                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <QueueCard
                    help="Open issues that should be triaged or assigned."
                    href={`/issues?domainId=${domain.id}`}
                    label="Open issues"
                    value={domain.issues.length}
                  />
                  <QueueCard
                    help="Fixes approved and waiting to be sent or applied."
                    href={`/fix-center?domainId=${domain.id}&status=APPROVED`}
                    label="Approved fixes"
                    value={approvedFixes}
                  />
                  <QueueCard
                    help="Fixes already sent or applied through the delivery workflow."
                    href={`/fix-center?domainId=${domain.id}`}
                    label="Sent / applied"
                    value={`${sentFixes} / ${appliedFixes}`}
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <HelpLabel help="Highest-priority issues for this website only.">
                        Priority issues
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Critical and high-priority domain findings.
                    </p>
                  </div>
                  <Link
                    href={`/fix-center?domainId=${domain.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    Open Fix Center
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {domain.issues.length ? (
                    domain.issues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/issues/${issue.id}`}
                        className="grid gap-2 px-5 py-4 transition hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_120px]"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold">{issue.title}</p>
                          <p className="mt-1 truncate text-sm text-slate-500">
                            {issue.page?.url ?? "Site-level issue"}
                          </p>
                        </div>
                        <span className="w-fit rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {formatEnum(issue.severity)}
                        </span>
                      </Link>
                    ))
                  ) : (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      No active issues for this domain.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-col gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold">
                      <HelpLabel help="Recently crawled pages for this website.">
                        Page inventory
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Latest URLs, titles, and page-level issue count.
                    </p>
                  </div>
                  <Link
                    href={`/pages?domainId=${domain.id}`}
                    className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                  >
                    View pages
                  </Link>
                </div>
                <div className="divide-y divide-slate-100">
                  {domain.pages.length ? (
                    domain.pages.map((page) => {
                      const snapshot = page.snapshots.at(0);

                      return (
                        <Link
                          key={page.id}
                          href={`/pages/${page.id}`}
                          className="grid gap-2 px-5 py-4 transition hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_90px]"
                        >
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {snapshot?.title || page.url}
                            </p>
                            <p className="mt-1 truncate text-sm text-slate-500">
                              {page.url}
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-slate-600">
                            {page.issues.length} issues
                          </span>
                        </Link>
                      );
                    })
                  ) : (
                    <p className="px-5 py-8 text-sm text-slate-500">
                      No pages crawled yet.
                    </p>
                  )}
                </div>
              </section>
            </div>

            <aside className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Readiness signals for this website project.">
                    Project readiness
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  <ReadinessItem
                    complete={isVerified}
                    label="Domain verified"
                    value={
                      isVerified ? "Ownership confirmed" : "Verify ownership"
                    }
                  />
                  <ReadinessItem
                    complete={domain.scriptStatus === "DETECTED"}
                    label="Monitoring script"
                    value={formatEnum(domain.scriptStatus)}
                  />
                  <ReadinessItem
                    complete={wordpressReady}
                    label="Fix receiver"
                    value={
                      wordpressReady ? "Connected" : "Connect in Integrations"
                    }
                  />
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Latest crawl runs for this domain only.">
                    Recent crawls
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  {domain.crawlRuns.length ? (
                    domain.crawlRuns.map((crawl) => (
                      <Link
                        key={crawl.id}
                        href={`/crawl-runs/${crawl.id}`}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                      >
                        <p className="text-sm font-semibold">
                          {formatEnum(crawl.status)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {crawl.pagesCrawled} crawled / {crawl.pagesFailed}{" "}
                          failed
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">No crawl runs yet.</p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Recent monitoring events from crawls, robots.txt, sitemap, templates, and page changes.">
                    Recent changes
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  {domain.changeEvents.length ? (
                    domain.changeEvents.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-sm font-semibold">
                          {formatEnum(event.changeType)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {event.createdAt.toLocaleDateString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No changes detected yet.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="font-semibold">
                  <HelpLabel help="Latest client-ready reports scoped to this domain.">
                    Reports
                  </HelpLabel>
                </h3>
                <div className="mt-4 grid gap-3">
                  {domain.reports.length ? (
                    domain.reports.map((report) => (
                      <Link
                        key={report.id}
                        href={`/reports/${report.id}`}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3 transition hover:bg-white"
                      >
                        <p className="text-sm font-semibold">{report.title}</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {formatEnum(report.status)}
                        </p>
                      </Link>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No reports generated for this domain.
                    </p>
                  )}
                </div>
              </section>
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}

function buildProjectTabs(domainId: string) {
  return [
    {
      active: true,
      href: `/domains/${domainId}/workspace`,
      icon: ShieldCheck,
      label: "Overview",
    },
    {
      active: false,
      href: `/issues?domainId=${domainId}`,
      icon: AlertTriangle,
      label: "Issues",
    },
    {
      active: false,
      href: `/pages?domainId=${domainId}`,
      icon: ClipboardList,
      label: "Crawled Pages",
    },
    {
      active: false,
      href: `/technical-audit?domainId=${domainId}`,
      icon: Link2,
      label: "Internal Links",
    },
    {
      active: false,
      href: `/technical-audit?domainId=${domainId}`,
      icon: CalendarClock,
      label: "Changes",
    },
    {
      active: false,
      href: `/fix-center?domainId=${domainId}`,
      icon: Hammer,
      label: "Fixes",
    },
    {
      active: false,
      href: `/reports?domainId=${domainId}`,
      icon: FileText,
      label: "Reports",
    },
    {
      active: false,
      href: `/integrations?domainId=${domainId}`,
      icon: PlugZap,
      label: "Integrations",
    },
    {
      active: false,
      href: `/recommendations?domainId=${domainId}`,
      icon: Bot,
      label: "AI",
    },
  ];
}

function ContextItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
      <dt className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 truncate text-sm font-semibold text-slate-700">
        {value}
      </dd>
    </div>
  );
}

function ActionLink({
  children,
  disabled,
  href,
  label,
}: {
  children: React.ReactNode;
  disabled?: boolean;
  href: string;
  label: string;
}) {
  if (disabled) {
    return (
      <span
        aria-disabled="true"
        className="inline-flex h-10 cursor-not-allowed items-center gap-2 whitespace-nowrap rounded-md border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-300"
      >
        {children}
        {label}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className="inline-flex h-10 items-center gap-2 whitespace-nowrap rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
    >
      {children}
      {label}
    </Link>
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
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function QueueCard({
  help,
  href,
  label,
  value,
}: {
  help: string;
  href: string;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-md border border-slate-200 bg-slate-50 p-4 transition hover:bg-white"
    >
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        <HelpLabel help={help}>{label}</HelpLabel>
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </Link>
  );
}

function ReadinessItem({
  complete,
  label,
  value,
}: {
  complete: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-md border border-slate-200 bg-slate-50 p-3">
      <CheckCircle2
        className={`mt-0.5 size-4 ${
          complete ? "text-emerald-600" : "text-slate-300"
        }`}
        aria-hidden="true"
      />
      <div>
        <p className="text-sm font-semibold">{label}</p>
        <p className="mt-1 text-xs text-slate-500">{value}</p>
      </div>
    </div>
  );
}

function StatusNotice({ message }: { message: string }) {
  return (
    <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-900">
      <p className="text-sm font-semibold">Crawl could not finish</p>
      <p className="mt-1 text-sm leading-6">{message}</p>
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
    "crawl-failed": "The crawler could not complete this site.",
    "crawl-invalid": "The crawl request was missing a valid domain.",
    "crawl-not-verified": "Verify the domain before starting a full crawl.",
    "crawl-page-limit":
      "This workspace has reached its page crawl limit for the current plan.",
    "crawl-plan-limit":
      "This crawl cadence is not available on the current workspace plan.",
    "domain-access": "You do not have access to that domain.",
  };

  return messages[error] ?? "Please try again or inspect the domain settings.";
}

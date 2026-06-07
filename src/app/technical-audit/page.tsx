import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  LinkIcon,
  Network,
  Route,
} from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { getInternalLinkGraphData } from "@/lib/link-graph-queries";

export const dynamic = "force-dynamic";

type TechnicalAuditPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function TechnicalAuditPage({
  searchParams,
}: TechnicalAuditPageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedDomainId = getSingle(params.domainId);
  const { workspace, pages, issues, opportunities } =
    await getInternalLinkGraphData({ domainId: selectedDomainId });
  const orphanCount = pages.filter((page) => page.isOrphan).length;
  const deepPageCount = issues.filter((issue) =>
    issue.issueType.startsWith("deep_page:"),
  ).length;
  const sitemapMismatchCount = issues.filter(
    (issue) =>
      issue.issueType.startsWith("sitemap_url_not_internally_linked:") ||
      issue.issueType.startsWith("internally_linked_url_missing_from_sitemap:"),
  ).length;
  const totalIncoming = pages.reduce(
    (total, page) => total + page.incomingCount,
    0,
  );
  const totalOutgoing = pages.reduce(
    (total, page) => total + page.outgoingCount,
    0,
  );
  const linkedPageCount = pages.filter((page) => !page.isOrphan).length;
  const topOpportunity = opportunities.at(0);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Technical" activeDomainId={selectedDomainId} />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Internal links
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Find pages that need more helpful links, then choose the easiest
                link to add first.
              </p>
            </div>
          </header>

          <LinkCarePlan
            deepPageCount={deepPageCount}
            issueCount={issues.length}
            linkedPageCount={linkedPageCount}
            opportunityCount={opportunities.length}
            orphanCount={orphanCount}
            pageCount={pages.length}
            sitemapMismatchCount={sitemapMismatchCount}
            topOpportunityLabel={
              topOpportunity
                ? `${topOpportunity.anchorText} on ${topOpportunity.domain}`
                : undefined
            }
          />

          <ProjectWorkspaceBar
            active="technical"
            domainId={selectedDomainId}
            note="Internal link checks and link suggestions are filtered to this project."
            returnPath="/technical-audit"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <Metric label="Tracked pages" value={pages.length} />
            <Metric label="Incoming links" value={totalIncoming} />
            <Metric label="Outgoing links" value={totalOutgoing} />
            <Metric label="Deep pages" value={deepPageCount} />
            <Metric label="Sitemap gaps" value={sitemapMismatchCount} />
          </div>

          <section
            id="link-opportunities"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Network className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Suggested links to add
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Simple source-to-target links for pages that need more help.
                </p>
              </div>
            </div>

            <div className="grid divide-y divide-slate-100">
              {opportunities.length ? (
                opportunities.slice(0, 12).map((opportunity) => (
                  <article
                    key={`${opportunity.sourcePageId}:${opportunity.targetPageId}`}
                    className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_160px_120px]"
                  >
                    <div>
                      <p className="font-semibold">
                        Link to {opportunity.anchorText}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        Add a contextual link from{" "}
                        <span className="font-medium text-slate-700">
                          {opportunity.sourceUrl}
                        </span>{" "}
                        to{" "}
                        <span className="font-medium text-slate-700">
                          {opportunity.targetUrl}
                        </span>
                        .
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {opportunity.client} - {opportunity.domain}
                      </p>
                    </div>
                    <Meta label="Anchor" value={opportunity.anchorText} />
                    <Meta
                      label="Priority"
                      value={`${opportunity.priorityScore}`}
                    />
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No link suggestions yet"
                  body="Run a crawl after pages are connected. Suggested links will appear here when a page needs more internal support."
                />
              )}
            </div>
          </section>

          <section
            id="link-issues"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Link issues</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Pages that are too deep, missing from the link path, or not
                  matching the sitemap.
                </p>
              </div>
            </div>

            <div className="grid divide-y divide-slate-100">
              {issues.length ? (
                issues.map((issue) => (
                  <article
                    key={issue.id}
                    className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_160px_120px]"
                  >
                    <div>
                      <Link
                        href={`/issues/${issue.id}`}
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        {issue.title}
                      </Link>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {issue.description}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {issue.domain.client?.name ?? "Unassigned"} -{" "}
                        {issue.domain.domain}
                        {issue.page ? ` - ${issue.page.url}` : ""}
                      </p>
                    </div>
                    <Meta
                      label="Type"
                      value={formatGraphIssue(issue.issueType)}
                    />
                    <Meta label="Priority" value={`${issue.priorityScore}`} />
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No link issues active"
                  body="Nice. When a crawl finds deep pages, orphan pages, or sitemap mismatches, they will appear here with a direct issue link."
                />
              )}
            </div>
          </section>

          <section
            id="link-details"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Network className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Detailed link counts</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Page-by-page link counts for deeper review.
                  {orphanCount
                    ? ` ${orphanCount} possible orphan pages found.`
                    : ""}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-sm font-medium text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Page</th>
                    <th className="px-5 py-3 font-semibold">Client</th>
                    <th className="px-5 py-3 font-semibold">Domain</th>
                    <th className="px-5 py-3 font-semibold">Incoming</th>
                    <th className="px-5 py-3 font-semibold">Outgoing</th>
                    <th className="px-5 py-3 font-semibold">Signal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pages.length ? (
                    pages.map((page) => (
                      <tr key={page.id}>
                        <td className="px-5 py-4">
                          <p className="max-w-md truncate font-medium">
                            {page.url}
                          </p>
                          <p className="text-xs text-slate-500">
                            {page.pageType ?? "Discovered page"}
                          </p>
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {page.client}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {page.domain}
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {page.incomingCount}
                        </td>
                        <td className="px-5 py-4 font-medium">
                          {page.outgoingCount}
                        </td>
                        <td className="px-5 py-4">
                          {page.isOrphan ? (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                              Possible orphan
                            </span>
                          ) : (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                              Linked
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-slate-500"
                        colSpan={6}
                      >
                        No link data yet. Run a crawl to collect internal links.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function LinkCarePlan({
  deepPageCount,
  issueCount,
  linkedPageCount,
  opportunityCount,
  orphanCount,
  pageCount,
  sitemapMismatchCount,
  topOpportunityLabel,
}: {
  deepPageCount: number;
  issueCount: number;
  linkedPageCount: number;
  opportunityCount: number;
  orphanCount: number;
  pageCount: number;
  sitemapMismatchCount: number;
  topOpportunityLabel?: string;
}) {
  const firstAction =
    opportunityCount > 0
      ? `${opportunityCount} suggested links`
      : issueCount > 0
        ? `${issueCount} link issues`
        : "Links look calm";
  const coverage =
    pageCount > 0
      ? `${linkedPageCount} of ${pageCount} pages linked`
      : "No pages yet";

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Link care plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Help important pages feel easier to find.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with suggested links, then review deep pages or sitemap gaps
            only when something needs attention.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={<LinkIcon className="size-4" aria-hidden="true" />}
            label="Do first"
            value={firstAction}
            detail={
              topOpportunityLabel
                ? `Start with ${topOpportunityLabel}.`
                : "Run a crawl when you want fresh link ideas."
            }
            href={opportunityCount > 0 ? "#link-opportunities" : "#link-issues"}
          />
          <PlanTile
            icon={<Route className="size-4" aria-hidden="true" />}
            label="Watch depth"
            value={`${deepPageCount + orphanCount} hard-to-find pages`}
            detail="Deep or orphan pages may need links from stronger pages."
            href="#link-issues"
          />
          <PlanTile
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
            label="Coverage"
            value={coverage}
            detail={
              sitemapMismatchCount
                ? `${sitemapMismatchCount} sitemap gaps need review.`
                : "Sitemap matching looks quiet."
            }
            href="#link-details"
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
      className="block rounded-lg border border-orange-100 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:bg-white"
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

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-4 text-3xl font-semibold tracking-normal">{value}</p>
    </article>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="p-8 text-center">
      <p className="text-base font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {body}
      </p>
    </div>
  );
}

function formatGraphIssue(issueType: string) {
  const type = issueType.split(":")[0] ?? issueType;

  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

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
  const visibleOpportunities = opportunities.slice(0, 8);
  const hiddenOpportunityCount = Math.max(
    opportunities.length - visibleOpportunities.length,
    0,
  );
  const visibleIssues = issues.slice(0, 8);
  const hiddenIssueCount = Math.max(issues.length - visibleIssues.length, 0);
  const visiblePages = pages.slice(0, 10);
  const hiddenPageCount = Math.max(pages.length - visiblePages.length, 0);

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
                Website links
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Find pages that need better paths, then choose the easiest link
                to add first.
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
            note="Helpful link ideas and page-path checks are filtered to this website."
            returnPath="/technical-audit"
          />

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <Metric label="Pages checked" value={pages.length} />
            <Metric label="Links pointing in" value={totalIncoming} />
            <Metric label="Links going out" value={totalOutgoing} />
            <Metric label="Hard-to-find pages" value={deepPageCount} />
            <Metric label="Page-list gaps" value={sitemapMismatchCount} />
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
                  Start here. These are the simplest links to add first.
                </p>
              </div>
            </div>

            <div className="grid divide-y divide-slate-100">
              {opportunities.length ? (
                visibleOpportunities.map((opportunity) => (
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
                    <Meta
                      label="Suggested words"
                      value={opportunity.anchorText}
                    />
                    <Meta
                      label="Priority"
                      value={formatPriority(opportunity.priorityScore)}
                    />
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No link suggestions yet"
                  body="Run a website check after pages are connected. Link ideas will appear here when a page needs more support."
                />
              )}
            </div>
            {hiddenOpportunityCount > 0 ? (
              <PreviewLimitNote
                body={`${hiddenOpportunityCount} more link ideas are available after these first easy wins.`}
              />
            ) : null}
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
                <h3 className="text-lg font-semibold">Pages that need help</h3>
                <p className="mt-1 text-sm text-slate-500">
                  A short list of pages where better links may help.
                </p>
              </div>
            </div>

            <div className="grid divide-y divide-slate-100">
              {issues.length ? (
                visibleIssues.map((issue) => (
                  <article
                    key={issue.id}
                    className="grid gap-4 p-5 xl:grid-cols-[minmax(0,1fr)_160px_120px]"
                  >
                    <div>
                      <Link
                        href={`/issues/${issue.id}`}
                        className="font-semibold underline-offset-4 hover:underline"
                      >
                        {formatFriendlyIssueTitle(issue.title, issue.issueType)}
                      </Link>
                      <p className="mt-1 text-sm leading-6 text-slate-500">
                        {formatFriendlyIssueDescription(
                          issue.description,
                          issue.issueType,
                        )}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {issue.domain.client?.name ?? "Unassigned"} -{" "}
                        {issue.domain.domain}
                        {issue.page ? ` - ${issue.page.url}` : ""}
                      </p>
                    </div>
                    <Meta
                      label="Needs"
                      value={formatGraphIssue(issue.issueType)}
                    />
                    <Meta
                      label="Priority"
                      value={formatPriority(issue.priorityScore)}
                    />
                  </article>
                ))
              ) : (
                <EmptyState
                  title="No pages need link help"
                  body="Nice. When a website check finds pages that are hard to reach or missing from the page list, they will appear here with a direct fix link."
                />
              )}
            </div>
            {hiddenIssueCount > 0 ? (
              <PreviewLimitNote
                body={`${hiddenIssueCount} more page-link problems are kept out of this first view so the page stays easier to scan.`}
                href={`/fix-center${selectedDomainId ? `?domainId=${selectedDomainId}` : ""}`}
                label="Open fix center"
              />
            ) : null}
          </section>

          <details
            id="link-details"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <summary className="flex cursor-pointer list-none items-center gap-3 border-b border-slate-200 p-5 marker:hidden">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Network className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">More page link counts</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Optional page-by-page counts when you want to check the full
                  list.
                  {orphanCount
                    ? ` ${orphanCount} pages may need more links.`
                    : ""}
                </p>
              </div>
            </summary>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-sm font-medium text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Page</th>
                    <th className="px-5 py-3 font-semibold">Client</th>
                    <th className="px-5 py-3 font-semibold">Website</th>
                    <th className="px-5 py-3 font-semibold">Links in</th>
                    <th className="px-5 py-3 font-semibold">Links out</th>
                    <th className="px-5 py-3 font-semibold">Signal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pages.length ? (
                    visiblePages.map((page) => (
                      <tr key={page.id}>
                        <td className="px-5 py-4">
                          <p className="max-w-md truncate font-medium">
                            {page.url}
                          </p>
                          <p className="text-xs text-slate-500">
                            {page.pageType ?? "Known page"}
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
                              Needs links
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
                        No link data yet. Run a website check to collect page
                        links.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {hiddenPageCount > 0 ? (
              <PreviewLimitNote
                body={`${hiddenPageCount} more pages are available in the full Pages view when you need the complete inventory.`}
                href={`/pages${selectedDomainId ? `?domainId=${selectedDomainId}` : ""}`}
                label="Open pages"
              />
            ) : null}
          </details>
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
        ? `${issueCount} pages need help`
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
            Page links plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Help important pages feel easier to find.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with suggested links, then review hard-to-find pages or page
            list gaps only when something needs attention.
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
                : "Run a website check when you want fresh link ideas."
            }
            href={opportunityCount > 0 ? "#link-opportunities" : "#link-issues"}
          />
          <PlanTile
            icon={<Route className="size-4" aria-hidden="true" />}
            label="Find hidden pages"
            value={`${deepPageCount + orphanCount} hard-to-find pages`}
            detail="Hard-to-find pages may need links from stronger pages."
            href="#link-issues"
          />
          <PlanTile
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
            label="Coverage"
            value={coverage}
            detail={
              sitemapMismatchCount
                ? `${sitemapMismatchCount} page list gaps need review.`
                : "The page list looks quiet."
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

function PreviewLimitNote({
  body,
  href,
  label = "Keep going",
}: {
  body: string;
  href?: string;
  label?: string;
}) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/70 px-5 py-4 text-sm text-slate-600 sm:flex-row sm:items-center sm:justify-between">
      <p>{body}</p>
      {href ? (
        <Link
          href={href}
          className="inline-flex w-fit items-center justify-center rounded-md border border-orange-200 bg-orange-50 px-3 py-2 font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-100"
        >
          {label}
        </Link>
      ) : null}
    </div>
  );
}

function formatGraphIssue(issueType: string) {
  const type = issueType.split(":")[0] ?? issueType;

  if (type.includes("sitemap")) {
    return "Page list gap";
  }

  if (type.includes("deep_page") || type.includes("orphan")) {
    return "Hard-to-find page";
  }

  return type
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatFriendlyIssueTitle(title: string, issueType: string) {
  const type = issueType.split(":")[0] ?? issueType;

  if (type.includes("sitemap_url_not_internally_linked")) {
    return "Page is listed but needs a link";
  }

  if (type.includes("internally_linked_url_missing_from_sitemap")) {
    return "Linked page is missing from the page list";
  }

  if (type.includes("deep_page")) {
    return "Page is hard to reach";
  }

  if (type.includes("orphan")) {
    return "Page needs links from other pages";
  }

  return title;
}

function formatFriendlyIssueDescription(description: string, issueType: string) {
  const type = issueType.split(":")[0] ?? issueType;

  if (type.includes("sitemap_url_not_internally_linked")) {
    return "This page is in the page list, but visitors may not have an easy link to reach it.";
  }

  if (type.includes("internally_linked_url_missing_from_sitemap")) {
    return "This page has a link on the website, but it is missing from the saved page list.";
  }

  if (type.includes("deep_page")) {
    return "This page takes too many clicks to reach. Add a clearer link from a stronger page.";
  }

  if (type.includes("orphan")) {
    return "This page needs links from other pages so visitors and Google can find it.";
  }

  return description
    .replace(/\bsitemap\b/gi, "page list")
    .replace(/\binternal links?\b/gi, "page links")
    .replace(/\bcrawl\b/gi, "website check")
    .replace(/\bSEO\b/g, "search");
}

function formatPriority(score: number) {
  if (score >= 80) {
    return "High";
  }

  if (score >= 50) {
    return "Medium";
  }

  return "Low";
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

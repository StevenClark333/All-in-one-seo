import Link from "next/link";
import { AlertTriangle, Network } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { getInternalLinkGraphData } from "@/lib/link-graph-queries";

export const dynamic = "force-dynamic";

export default async function TechnicalAuditPage() {
  const { workspace, pages, issues, opportunities } =
    await getInternalLinkGraphData();
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

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Technical" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Internal link graph
              </h2>
            </div>
          </header>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            <Metric label="Tracked pages" value={pages.length} />
            <Metric label="Incoming links" value={totalIncoming} />
            <Metric label="Outgoing links" value={totalOutgoing} />
            <Metric label="Deep pages" value={deepPageCount} />
            <Metric label="Sitemap gaps" value={sitemapMismatchCount} />
          </div>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                <Network className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Internal link opportunities
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Suggested source-to-target links for pages with low internal
                  link coverage.
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
                      <p className="mt-2 text-xs text-slate-500">
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
                <div className="p-8 text-center text-sm text-slate-500">
                  No internal link opportunities found from current graph data.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
                <AlertTriangle className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Graph issues</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Depth and sitemap/internal-link mismatch findings from the
                  latest analyzer runs.
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
                      <p className="mt-2 text-xs text-slate-500">
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
                <div className="p-8 text-center text-sm text-slate-500">
                  No active internal link graph issues.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 border-b border-slate-200 p-5">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                <Network className="size-5" aria-hidden="true" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Page link metrics</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Incoming and outgoing internal links from stored crawl data.
                  {orphanCount
                    ? ` ${orphanCount} possible orphan pages found.`
                    : ""}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[860px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
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
                        No link graph data yet. Run a crawl to persist internal
                        links.
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
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium">{value}</p>
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

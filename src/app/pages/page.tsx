import Link from "next/link";
import { FileSearch, Link2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { getPageInventoryData } from "@/lib/management-queries";
import { getTemplateLabel, inferPageTemplate } from "@/lib/template-detection";

export const dynamic = "force-dynamic";

export default async function PagesPage() {
  const { workspace, pages, templateGroups } = await getPageInventoryData();

  const criticalPages = pages.filter((page) =>
    page.issues.some((issue) => issue.severity === "CRITICAL"),
  ).length;
  const pagesWithTitles = pages.filter(
    (page) => page.snapshots.at(0)?.title,
  ).length;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <AppSidebar active="Pages" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Pages
              </h2>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <FileSearch className="size-4" aria-hidden="true" />
              {pages.length} crawled
            </div>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Crawled pages" value={pages.length} />
            <Metric label="Templates" value={templateGroups.length} />
            <Metric label="Critical pages" value={criticalPages} />
            <Metric label="Pages with title" value={pagesWithTitles} />
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Template groups</h3>
              <p className="mt-1 text-sm text-slate-500">
                URL-pattern groups with issue counts and priority scoring.
              </p>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
              {templateGroups.length ? (
                templateGroups.map((group) => (
                  <Link
                    key={group.key}
                    href={`/issues?templateKey=${encodeURIComponent(group.key)}`}
                    className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{group.label}</p>
                        <p className="mt-1 text-sm text-slate-500">
                          {group.pageCount} pages
                        </p>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-600">
                        P{group.priorityScore}
                      </span>
                    </div>
                    <p className="mt-3 text-sm text-slate-600">
                      {group.issueCount} open issues, {group.criticalCount}{" "}
                      critical
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-slate-500">
                  No templates detected yet.
                </p>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Page inventory</h3>
              <p className="mt-1 text-sm text-slate-500">
                Crawl-backed page list across all agency clients and domains.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-[0.12em] text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Page</th>
                    <th className="px-5 py-3 font-semibold">Client</th>
                    <th className="px-5 py-3 font-semibold">Domain</th>
                    <th className="px-5 py-3 font-semibold">Template</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Issues</th>
                    <th className="px-5 py-3 font-semibold">Links</th>
                    <th className="px-5 py-3 font-semibold">Last crawl</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pages.length ? (
                    pages.map((page) => {
                      const snapshot = page.snapshots.at(0);
                      const critical = page.issues.filter(
                        (issue) => issue.severity === "CRITICAL",
                      ).length;
                      const warnings = page.issues.filter(
                        (issue) => issue.severity === "WARNING",
                      ).length;

                      return (
                        <tr key={page.id}>
                          <td className="px-5 py-4">
                            <Link
                              href={`/pages/${page.id}`}
                              className="font-medium underline-offset-4 hover:underline"
                            >
                              {page.url}
                            </Link>
                            <p className="mt-1 max-w-[420px] truncate text-xs text-slate-500">
                              {snapshot?.title ?? "Missing title"}
                            </p>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {page.domain.client?.name ?? "Unassigned"}
                          </td>
                          <td className="px-5 py-4">
                            <Link
                              href={`/domains/${page.domain.id}`}
                              className="text-slate-700 underline-offset-4 hover:underline"
                            >
                              {page.domain.domain}
                            </Link>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {getTemplateLabel(inferPageTemplate(page))}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {snapshot?.statusCode ?? "Pending"}
                          </td>
                          <td className="px-5 py-4">
                            <span className="font-medium text-red-600">
                              {critical}
                            </span>
                            <span className="text-slate-400"> / </span>
                            <span className="font-medium text-amber-600">
                              {warnings}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            <span className="inline-flex items-center gap-1">
                              <Link2 className="size-4" aria-hidden="true" />
                              {page.incomingLinks.length} in /{" "}
                              {page.outgoingLinks.length} out
                            </span>
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {page.lastCrawledAt
                              ? page.lastCrawledAt.toLocaleDateString()
                              : "Pending"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        className="px-5 py-8 text-center text-slate-500"
                        colSpan={8}
                      >
                        No pages yet. Run a verified domain crawl to populate
                        the page inventory.
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

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

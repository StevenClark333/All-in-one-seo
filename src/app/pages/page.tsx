import Link from "next/link";
import { FileSearch, Link2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { ActiveProjectBanner } from "@/components/active-project-banner";
import { getPageInventoryData } from "@/lib/management-queries";
import { getTemplateLabel, inferPageTemplate } from "@/lib/template-detection";

export const dynamic = "force-dynamic";

type PagesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PagesPage({ searchParams }: PagesPageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedDomainId = getSingle(params.domainId);
  const { workspace, domains, pages, templateGroups } =
    await getPageInventoryData({
      domainId: selectedDomainId,
    });
  const selectedDomain = domains.find(
    (domain) => domain.id === selectedDomainId,
  );

  const criticalPages = pages.filter((page) =>
    page.issues.some((issue) => issue.severity === "CRITICAL"),
  ).length;
  const pagesWithTitles = pages.filter(
    (page) => page.snapshots.at(0)?.title,
  ).length;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
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

          {selectedDomain ? (
            <ActiveProjectBanner
              clientName={selectedDomain.client?.name}
              domain={selectedDomain.domain}
              domainId={selectedDomain.id}
              note="Page inventory and template groups are filtered to this domain."
            />
          ) : null}

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
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Page inventory</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedDomain
                    ? `Focused on ${selectedDomain.domain}.`
                    : "Crawl-backed page list across all agency clients and domains."}
                </p>
              </div>

              <form className="grid gap-2 sm:grid-cols-[minmax(0,260px)_auto_auto]">
                <label className="grid gap-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                    Site
                  </span>
                  <select
                    name="domainId"
                    defaultValue={selectedDomainId ?? ""}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">All sites</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.domain}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                    Filter
                  </button>
                </div>
                {selectedDomainId ? (
                  <div className="flex items-end">
                    <Link
                      href={`/domains/${selectedDomainId}/workspace`}
                      className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                    >
                      Workspace
                    </Link>
                  </div>
                ) : null}
              </form>
            </div>

            <div className="divide-y divide-slate-100">
              {pages.length ? (
                <>
                  <div className="hidden grid-cols-[minmax(0,1fr)_150px_90px_90px_120px_120px] gap-4 bg-slate-50 px-5 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500 xl:grid">
                    <span>Page</span>
                    <span>Template</span>
                    <span>Status</span>
                    <span>Issues</span>
                    <span>Links</span>
                    <span>Last crawl</span>
                  </div>

                  {pages.map((page) => {
                    const snapshot = page.snapshots.at(0);
                    const critical = page.issues.filter(
                      (issue) => issue.severity === "CRITICAL",
                    ).length;
                    const warnings = page.issues.filter(
                      (issue) => issue.severity === "WARNING",
                    ).length;

                    return (
                      <article
                        key={page.id}
                        className="grid gap-4 px-5 py-4 text-sm xl:grid-cols-[minmax(0,1fr)_150px_90px_90px_120px_120px] xl:items-center"
                      >
                        <div className="min-w-0">
                          <Link
                            href={`/pages/${page.id}`}
                            className="font-medium underline-offset-4 hover:underline"
                          >
                            {page.url}
                          </Link>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {snapshot?.title ?? "Missing title"}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {page.domain.client?.name ?? "Unassigned"} -{" "}
                            <Link
                              href={`/domains/${page.domain.id}`}
                              className="font-medium text-slate-700 underline-offset-4 hover:underline"
                            >
                              {page.domain.domain}
                            </Link>
                          </p>
                        </div>

                        <MetaBlock label="Template">
                          {getTemplateLabel(inferPageTemplate(page))}
                        </MetaBlock>

                        <MetaBlock label="Status">
                          <span className="whitespace-nowrap">
                            {snapshot?.statusCode ?? "Pending"}
                          </span>
                        </MetaBlock>

                        <MetaBlock label="Issues">
                          <span className="whitespace-nowrap">
                            <span className="font-medium text-red-600">
                              {critical}
                            </span>
                            <span className="text-slate-400"> / </span>
                            <span className="font-medium text-amber-600">
                              {warnings}
                            </span>
                          </span>
                        </MetaBlock>

                        <MetaBlock label="Links">
                          <span className="inline-flex items-center gap-1 whitespace-nowrap">
                            <Link2 className="size-4" aria-hidden="true" />
                            {page.incomingLinks.length} in /{" "}
                            {page.outgoingLinks.length} out
                          </span>
                        </MetaBlock>

                        <MetaBlock label="Last crawl">
                          <span className="whitespace-nowrap">
                            {page.lastCrawledAt
                              ? page.lastCrawledAt.toLocaleDateString()
                              : "Pending"}
                          </span>
                        </MetaBlock>
                      </article>
                    );
                  })}
                </>
              ) : (
                <div className="px-5 py-8 text-center text-sm text-slate-500">
                  No pages yet. Run a verified domain crawl to populate the page
                  inventory.
                </div>
              )}
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

function MetaBlock({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <div className="text-slate-600">
      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-400 xl:hidden">
        {label}
      </p>
      <div>{children}</div>
    </div>
  );
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

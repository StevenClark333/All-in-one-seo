import Link from "next/link";
import { CheckCircle2, FileSearch, Layers3, Link2, Wand2 } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { getPageInventoryData } from "@/lib/management-queries";
import {
  formatPageCheckDate,
  formatPageClient,
  formatPageMetaText,
  formatPageResponse,
} from "@/lib/page-display-labels";
import { getTemplateLabel, inferPageTemplate } from "@/lib/template-detection";

export const dynamic = "force-dynamic";

type PagesPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type PageInventoryData = Awaited<ReturnType<typeof getPageInventoryData>>;
type TemplateGroup = PageInventoryData["templateGroups"][number];
type InventoryPage = PageInventoryData["pages"][number];

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
  const pagesMissingTitles = pages.length - pagesWithTitles;
  const pagesWithIssues = pages.filter((page) => page.issues.length > 0).length;
  const bestTemplateGroup = templateGroups.at(0);
  const visibleTemplateGroups = templateGroups.slice(0, 8);
  const hiddenTemplateGroups = templateGroups.slice(8);
  const visiblePages = pages.slice(0, 15);
  const hiddenPages = pages.slice(15);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Pages" activeDomainId={selectedDomainId} />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Pages
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Review the pages Google and AI search will judge first, without
                digging through a long checklist.
              </p>
            </div>

            <a
              href="#page-inventory"
              className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-orange-50"
            >
              <FileSearch className="size-4" aria-hidden="true" />
              Review {pages.length} pages
            </a>
          </header>

          <PageCarePlan
            criticalPages={criticalPages}
            pagesMissingTitles={pagesMissingTitles}
            pagesWithIssues={pagesWithIssues}
            selectedDomain={selectedDomain?.domain}
            topTemplateLabel={bestTemplateGroup?.label}
            topTemplateIssues={bestTemplateGroup?.issueCount ?? 0}
          />

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Pages checked" value={pages.length} />
            <Metric label="Page patterns" value={templateGroups.length} />
            <Metric label="Urgent pages" value={criticalPages} />
            <Metric label="Titles ready" value={pagesWithTitles} />
          </section>

          <ProjectWorkspaceBar
            active="pages"
            domainId={selectedDomainId}
            note="Pages and repeated page fixes are filtered to this website."
            returnPath="/pages"
          />

          <section
            id="template-groups"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Repeated page fixes</h3>
              <p className="mt-1 text-sm text-slate-500">
                Groups of similar pages, so one fix can improve many pages at
                once.
              </p>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
              {visibleTemplateGroups.length ? (
                visibleTemplateGroups.map((group) => (
                  <TemplateGroupCard
                    key={group.key}
                    group={group}
                    selectedDomainId={selectedDomainId}
                  />
                ))
              ) : (
                <EmptyState
                  title="No page patterns yet"
                  body="Add a website and run the first website check, then similar pages will be grouped here."
                />
              )}
            </div>

            {hiddenTemplateGroups.length ? (
              <details className="border-t border-slate-100 px-5 py-4">
                <summary className="cursor-pointer text-sm font-semibold text-slate-700 marker:text-slate-400">
                  More page patterns ({hiddenTemplateGroups.length})
                </summary>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  These are kept out of the first view so the most repeated
                  fixes stay easy to scan.
                </p>
                <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                  {hiddenTemplateGroups.map((group) => (
                    <TemplateGroupCard
                      key={group.key}
                      group={group}
                      selectedDomainId={selectedDomainId}
                    />
                  ))}
                </div>
              </details>
            ) : null}
          </section>

          <section
            id="page-inventory"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
          >
            <div className="flex flex-col gap-4 border-b border-slate-200 p-5 xl:flex-row xl:items-end xl:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Page list</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {selectedDomain
                    ? `Focused on ${selectedDomain.domain}.`
                    : "Pages found from your website checks."}
                </p>
              </div>

              <form className="grid gap-2 sm:grid-cols-[minmax(0,260px)_auto_auto]">
                <label className="grid gap-2">
                  <FieldLabel>Website</FieldLabel>
                  <select
                    name="domainId"
                    defaultValue={selectedDomainId ?? ""}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">All websites</option>
                    {domains.map((domain) => (
                      <option key={domain.id} value={domain.id}>
                        {domain.domain}
                      </option>
                    ))}
                  </select>
                </label>
                <div className="flex items-end">
                  <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                    Show pages
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
                  <div className="hidden grid-cols-[minmax(0,1fr)_150px_90px_90px_120px_120px] gap-4 bg-slate-50 px-5 py-3 text-sm font-medium text-slate-500 xl:grid">
                    <span>Page</span>
                    <span>Pattern</span>
                    <span>Response</span>
                    <span>Problems</span>
                    <span>Links</span>
                    <span>Last check</span>
                  </div>

                  {visiblePages.map((page) => (
                    <PageRow key={page.id} page={page} />
                  ))}

                  {hiddenPages.length ? (
                    <details className="border-t border-slate-100 px-5 py-4">
                      <summary className="cursor-pointer text-sm font-semibold text-slate-700 marker:text-slate-400">
                        More pages ({hiddenPages.length})
                      </summary>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        These pages are still available, but the first view
                        stays focused on the pages most likely to need
                        attention.
                      </p>
                      <div className="mt-3 divide-y divide-slate-100 rounded-lg border border-slate-100">
                        {hiddenPages.map((page) => (
                          <PageRow key={page.id} page={page} />
                        ))}
                      </div>
                    </details>
                  ) : null}
                </>
              ) : (
                <EmptyState
                  title="No pages checked yet"
                  body="Verify a website and run the first website check. Page titles, problems, links, and page groups will appear here."
                />
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function PageCarePlan({
  criticalPages,
  pagesMissingTitles,
  pagesWithIssues,
  selectedDomain,
  topTemplateIssues,
  topTemplateLabel,
}: {
  criticalPages: number;
  pagesMissingTitles: number;
  pagesWithIssues: number;
  selectedDomain?: string;
  topTemplateIssues: number;
  topTemplateLabel?: string;
}) {
  const scope = selectedDomain ?? "all websites";
  const firstAction =
    criticalPages > 0
      ? `${criticalPages} critical pages need care`
      : pagesWithIssues > 0
        ? `${pagesWithIssues} pages have fixable problems`
        : "No urgent page problems";

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Page care plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Start with the pages that can move results.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            This view is focused on {scope}. Check critical pages first, then
            use templates when one repeated fix can help a whole group.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={<FileSearch className="size-4" aria-hidden="true" />}
            label="Check first"
            value={firstAction}
            detail="Open the page list and work from the highest-risk pages."
            href="#page-inventory"
          />
          <PlanTile
            icon={<Layers3 className="size-4" aria-hidden="true" />}
            label="Best group fix"
            value={
              topTemplateLabel
                ? `${topTemplateLabel}: ${topTemplateIssues} problems`
                : "No template group yet"
            }
            detail="Use page groups when the same problem repeats."
            href="#template-groups"
          />
          <PlanTile
            icon={
              pagesMissingTitles > 0 ? (
                <Wand2 className="size-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )
            }
            label="Quick content check"
            value={
              pagesMissingTitles > 0
                ? `${pagesMissingTitles} missing titles`
                : "Titles look covered"
            }
            detail="Page titles are the easiest scan before deeper SEO fields."
            href="#page-inventory"
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

function Metric({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function TemplateGroupCard({
  group,
  selectedDomainId,
}: {
  group: TemplateGroup;
  selectedDomainId?: string;
}) {
  return (
    <Link
      href={`/issues?templateKey=${encodeURIComponent(group.key)}${
        selectedDomainId ? `&domainId=${selectedDomainId}` : ""
      }`}
      className="rounded-lg border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-200 hover:bg-white"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold">{group.label}</p>
          <p className="mt-1 text-sm text-slate-500">{group.pageCount} pages</p>
        </div>
        <span className="rounded-full border border-orange-100 bg-white px-2 py-1 text-xs font-semibold text-orange-700">
          {getPriorityLabel(group.priorityScore)}
        </span>
      </div>
      <p className="mt-3 text-sm text-slate-600">
        {group.issueCount} open problems, {group.criticalCount} urgent
      </p>
    </Link>
  );
}

function PageRow({ page }: { page: InventoryPage }) {
  const snapshot = page.snapshots.at(0);
  const critical = page.issues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;
  const warnings = page.issues.filter(
    (issue) => issue.severity === "WARNING",
  ).length;

  return (
    <article className="grid gap-4 px-5 py-4 text-sm xl:grid-cols-[minmax(0,1fr)_150px_90px_90px_120px_120px] xl:items-center">
      <div className="min-w-0">
        <Link
          href={`/pages/${page.id}`}
          className="font-medium underline-offset-4 hover:underline"
        >
          {page.url}
        </Link>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {formatPageMetaText(snapshot?.title)}
        </p>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {formatPageClient(page.domain.client?.name)} -{" "}
          <Link
            href={`/domains/${page.domain.id}`}
            className="font-medium text-slate-700 underline-offset-4 hover:underline"
          >
            {page.domain.domain}
          </Link>
        </p>
      </div>

      <MetaBlock label="Pattern">
        {getTemplateLabel(inferPageTemplate(page))}
      </MetaBlock>

      <MetaBlock label="Response">
        <span className="whitespace-nowrap">
          {formatPageResponse(snapshot?.statusCode)}
        </span>
      </MetaBlock>

      <MetaBlock label="Problems">
        <span className="whitespace-nowrap">
          <span className="font-medium text-red-600">{critical}</span>
          <span className="text-slate-400"> / </span>
          <span className="font-medium text-amber-600">{warnings}</span>
        </span>
      </MetaBlock>

      <MetaBlock label="Links">
        <span className="inline-flex items-center gap-1 whitespace-nowrap">
          <Link2 className="size-4" aria-hidden="true" />
          {page.incomingLinks.length} in / {page.outgoingLinks.length} out
        </span>
      </MetaBlock>

      <MetaBlock label="Last check">
        <span className="whitespace-nowrap">
          {formatPageCheckDate(page.lastCrawledAt)}
        </span>
      </MetaBlock>
    </article>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="text-sm font-medium text-slate-500">{children}</span>;
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
      <p className="mb-1 text-sm font-medium text-slate-500 xl:hidden">
        {label}
      </p>
      <div>{children}</div>
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

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function getPriorityLabel(score: number) {
  if (score >= 80) {
    return "High priority";
  }

  if (score >= 45) {
    return "Medium priority";
  }

  return "Low priority";
}

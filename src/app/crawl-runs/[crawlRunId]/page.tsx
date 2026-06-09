import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2, FileSearch, Radar } from "lucide-react";
import { cancelCrawl } from "@/app/actions";
import {
  formatCrawlRunChangeValue,
  formatCrawlRunResponse,
} from "@/lib/crawl-run-display-labels";
import {
  formatPageMetaText,
  formatPageWordCount,
} from "@/lib/page-display-labels";
import { getPrisma } from "@/lib/prisma";
import { formatWebsiteClient } from "@/lib/website-display-labels";

export const dynamic = "force-dynamic";

type CrawlRunPageProps = {
  params: Promise<{ crawlRunId: string }>;
};

export default async function CrawlRunPage({ params }: CrawlRunPageProps) {
  const { crawlRunId } = await params;
  const crawlRun = await getPrisma().crawlRun.findUnique({
    where: { id: crawlRunId },
    include: {
      domain: {
        include: { client: true },
      },
      snapshots: {
        include: { page: true },
        orderBy: { createdAt: "desc" },
      },
      changeEvents: {
        include: { page: true },
        orderBy: { createdAt: "desc" },
      },
      artifacts: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!crawlRun) {
    notFound();
  }

  const isActive = crawlRun.status === "QUEUED" || crawlRun.status === "RUNNING";
  const changedPageCount = new Set(
    crawlRun.changeEvents
      .map((event) => event.pageId)
      .filter((pageId): pageId is string => Boolean(pageId)),
  ).size;
  const crawlResult =
    crawlRun.status === "COMPLETED"
      ? crawlRun.pagesFailed > 0
        ? "Website check finished with a few pages to review"
        : "Website check finished successfully"
      : crawlRun.status === "FAILED"
        ? "Website check could not finish"
        : "Website check is still running";
  const nextStep =
    crawlRun.status === "FAILED"
      ? "Review the message below, then try another website check from the workspace."
      : crawlRun.changeEvents.length
        ? "Start with the page changes before opening every detail."
        : crawlRun.pagesFailed > 0
          ? "Review the pages that need another look, then run a fresh check."
          : "No urgent follow-up is needed right now.";

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href={`/domains/${crawlRun.domain.id}/workspace`}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Website workspace
        </Link>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-orange-50 text-orange-700">
                <Radar className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {formatWebsiteClient(crawlRun.domain.client?.name)}
                </p>
                <h1 className="text-2xl font-semibold tracking-normal">
                  Website check recap
                </h1>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {crawlRun.domain.domain} was checked for pages, problems, and
                  important changes.
                </p>
              </div>
            </div>

            <span
              className={`inline-flex h-8 items-center rounded-full border px-3 text-xs font-semibold ${
                crawlRun.status === "COMPLETED"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : crawlRun.status === "FAILED"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : "border-blue-200 bg-blue-50 text-blue-700"
              }`}
            >
              {formatCheckStatus(crawlRun.status)}
            </span>
          </div>

          <CrawlRecapPlan
            changedPageCount={changedPageCount}
            crawlResult={crawlResult}
            nextStep={nextStep}
            pagesCrawled={crawlRun.pagesCrawled}
            pagesFailed={crawlRun.pagesFailed}
          />

          {isActive ? (
            <form action={cancelCrawl} className="mt-5">
              <input type="hidden" name="crawlRunId" value={crawlRun.id} />
              <button className="inline-flex h-10 items-center rounded-md border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100">
                Stop check
              </button>
            </form>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Pages found" value={crawlRun.pagesDiscovered} />
            <Metric label="Pages checked" value={crawlRun.pagesCrawled} />
            <Metric label="Need another look" value={crawlRun.pagesFailed} />
            <Metric
              label="Started from"
              value={formatCheckTrigger(crawlRun.trigger)}
            />
          </div>

          {crawlRun.errorMessage ? (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {crawlRun.errorMessage}
            </div>
          ) : null}
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <details>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <div>
                <h2 className="text-lg font-semibold">
                  Website setup files
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Optional setup files checked before page review.
                </p>
              </div>
              <span className="text-sm font-medium text-orange-600">
                {crawlRun.artifacts.length} items
              </span>
            </summary>

            <div className="grid divide-y divide-slate-100 border-t border-slate-200">
              {crawlRun.artifacts.length ? (
                crawlRun.artifacts.map((artifact) => (
                  <article
                    key={artifact.id}
                    className="grid gap-4 p-5 lg:grid-cols-[180px_1fr_120px]"
                  >
                    <Meta
                      label="Setup file"
                      value={formatSetupFileType(artifact.type)}
                    />
                    <Meta label="Link" value={artifact.url} />
                    <Meta
                      label="Response"
                      value={formatCrawlRunResponse(artifact.statusCode)}
                    />
                  </article>
                ))
              ) : (
                <EmptyNote
                  title="No setup files saved"
                  message="This website check did not save page-list or access-helper file details."
                />
              )}
            </div>
          </details>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold">Page changes</h2>
            <p className="mt-1 text-sm text-slate-500">
              Important differences found since the previous website check.
            </p>
          </div>

          <div className="grid divide-y divide-slate-100">
            {crawlRun.changeEvents.length ? (
              crawlRun.changeEvents.map((event) => (
                <article
                  key={event.id}
                  className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_1fr_1fr]"
                >
                  <div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        event.severity === "CRITICAL"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {formatChangeImportance(event.severity)}
                    </span>
                    <h3 className="mt-3 font-semibold">
                      {formatChangeType(event.changeType)}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {event.page?.url ?? "Whole website change"}
                    </p>
                  </div>
                  <Meta
                    label="Previous"
                    value={formatCrawlRunChangeValue(event.previousValue)}
                  />
                  <Meta
                    label="Current"
                    value={formatCrawlRunChangeValue(event.newValue)}
                  />
                </article>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No important changes were found for this website check.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <details>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-5">
              <div>
                <h2 className="text-lg font-semibold">More page detail</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Optional page-by-page details for deeper review.
                </p>
              </div>
              <span className="text-sm font-medium text-orange-600">
                {crawlRun.snapshots.length} pages
              </span>
            </summary>

            <div className="grid divide-y divide-slate-100 border-t border-slate-200">
              {crawlRun.snapshots.length ? (
                crawlRun.snapshots.map((snapshot) => (
                  <article key={snapshot.id} className="grid gap-4 p-5">
                    <div>
                      <h3 className="font-semibold">{snapshot.page.url}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        Response {formatCrawlRunResponse(snapshot.statusCode)} -{" "}
                        {formatPageWordCount(snapshot.wordCount)}
                      </p>
                    </div>
                    <dl className="grid gap-3 text-sm md:grid-cols-2">
                      <Meta
                        label="Title"
                        value={formatPageMetaText(snapshot.title)}
                      />
                      <Meta
                        label="Page description"
                        value={formatPageMetaText(snapshot.metaDescription)}
                      />
                      <Meta
                        label="Main heading"
                        value={formatPageMetaText(snapshot.h1)}
                      />
                      <Meta
                        label="Preferred page"
                        value={formatPageMetaText(snapshot.canonical)}
                      />
                    </dl>
                  </article>
                ))
              ) : (
                <EmptyNote
                  title="No page details saved"
                  message="Run another website check when you want fresh page details."
                />
              )}
            </div>
          </details>
        </section>
      </div>
    </main>
  );
}

function CrawlRecapPlan({
  changedPageCount,
  crawlResult,
  nextStep,
  pagesCrawled,
  pagesFailed,
}: {
  changedPageCount: number;
  crawlResult: string;
  nextStep: string;
  pagesCrawled: number;
  pagesFailed: number;
}) {
  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/70 p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Website check recap
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">
            {crawlResult}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{nextStep}</p>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <RecapTile
            icon={<CheckCircle2 className="size-4" aria-hidden="true" />}
            label="Pages checked"
            value={`${pagesCrawled} checked`}
            detail={
              pagesFailed
                ? `${pagesFailed} pages need another look.`
                : "No pages need another look."
            }
          />
          <RecapTile
            icon={<FileSearch className="size-4" aria-hidden="true" />}
            label="Changed pages"
            value={`${changedPageCount} pages`}
            detail="Changes are listed below when they affect page health."
          />
          <RecapTile
            icon={<Radar className="size-4" aria-hidden="true" />}
            label="Best next step"
            value={pagesFailed || changedPageCount ? "Review below" : "Move on"}
            detail="Open details only when something needs attention."
          />
        </div>
      </div>
    </section>
  );
}

function RecapTile({
  detail,
  icon,
  label,
  value,
}: {
  detail: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-md border border-orange-100 bg-white p-4">
      <span className="inline-flex size-8 items-center justify-center rounded-md bg-orange-50 text-orange-700">
        {icon}
      </span>
      <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{detail}</p>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-sm font-medium text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">
        {label}
      </dt>
      <dd className="mt-1 text-slate-700">{value}</dd>
    </div>
  );
}

function EmptyNote({ message, title }: { message: string; title: string }) {
  return (
    <div className="p-8 text-center">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {message}
      </p>
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

function formatCheckStatus(value: string) {
  const statusLabels: Record<string, string> = {
    CANCELLED: "Stopped",
    COMPLETED: "Finished",
    FAILED: "Needs another try",
    QUEUED: "Waiting to start",
    RUNNING: "Checking now",
  };

  return statusLabels[value] ?? formatEnum(value);
}

function formatCheckTrigger(value: string) {
  const triggerLabels: Record<string, string> = {
    MANUAL: "I started it",
    SCHEDULED: "Scheduled check",
    SYSTEM: "Automatic check",
  };

  return triggerLabels[value] ?? formatEnum(value);
}

function formatSetupFileType(value: string) {
  const setupFileLabels: Record<string, string> = {
    ROBOTS_TXT: "Access-helper file",
    SITEMAP: "Page-list file",
    SITEMAP_XML: "Page-list file",
  };

  return setupFileLabels[value] ?? formatEnum(value);
}

function formatChangeImportance(severity: string) {
  const importanceLabels: Record<string, string> = {
    CRITICAL: "Urgent",
    WARNING: "Planned",
    INFO: "Idea",
  };

  return importanceLabels[severity] ?? "Idea";
}

function formatChangeType(value: string) {
  const changeTypeLabels: Record<string, string> = {
    MISSING_TITLE: "Page title missing",
    DUPLICATE_TITLE: "Page title repeats",
    TITLE_CHANGED: "Page title changed",
    MISSING_META_DESCRIPTION: "Page description missing",
    DUPLICATE_META_DESCRIPTION: "Page description repeats",
    META_DESCRIPTION_CHANGED: "Page description changed",
    MISSING_H1: "Main heading missing",
    H1_CHANGED: "Main heading changed",
    MISSING_CANONICAL: "Preferred page missing",
    CANONICAL_CHANGED: "Preferred page changed",
    CANONICAL_NON_200: "Preferred page is not loading",
    PAGE_NOINDEX: "Page hidden from Google",
    ROBOTS_TXT_CHANGED: "Access-helper file changed",
    SITEMAP_CHANGED: "Page-list file changed",
  };

  if (changeTypeLabels[value]) {
    return changeTypeLabels[value];
  }

  return formatEnum(value)
    .replace(/\bMeta Description\b/g, "Page description")
    .replace(/\bH1\b/g, "Main heading")
    .replace(/\bCanonical\b/g, "Preferred page")
    .replace(/\bRobots Txt\b/g, "Access-helper file")
    .replace(/\bSitemap\b/g, "Page-list file")
    .replace(/\bNoindex\b/g, "Hidden from Google");
}

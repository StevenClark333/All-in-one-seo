import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Radar } from "lucide-react";
import { cancelCrawl } from "@/app/actions";
import { getPrisma } from "@/lib/prisma";

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

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/domains"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Domains
        </Link>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
                <Radar className="size-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  {crawlRun.domain.client?.name ?? "Unassigned"}
                </p>
                <h1 className="text-2xl font-semibold tracking-normal">
                  Crawl run for {crawlRun.domain.domain}
                </h1>
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
              {formatEnum(crawlRun.status)}
            </span>
          </div>

          {crawlRun.status === "QUEUED" || crawlRun.status === "RUNNING" ? (
            <form action={cancelCrawl} className="mt-5">
              <input type="hidden" name="crawlRunId" value={crawlRun.id} />
              <button className="inline-flex h-10 items-center rounded-md border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-700 transition hover:bg-red-100">
                Cancel crawl
              </button>
            </form>
          ) : null}

          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric label="Discovered" value={crawlRun.pagesDiscovered} />
            <Metric label="Crawled" value={crawlRun.pagesCrawled} />
            <Metric label="Failed" value={crawlRun.pagesFailed} />
            <Metric label="Trigger" value={formatEnum(crawlRun.trigger)} />
          </div>

          {crawlRun.errorMessage ? (
            <div className="mt-6 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
              {crawlRun.errorMessage}
            </div>
          ) : null}
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold">
              Robots and sitemap discovery
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Crawl artifacts captured before page fetching.
            </p>
          </div>

          <div className="grid divide-y divide-slate-100">
            {crawlRun.artifacts.length ? (
              crawlRun.artifacts.map((artifact) => (
                <article
                  key={artifact.id}
                  className="grid gap-4 p-5 lg:grid-cols-[180px_1fr_120px]"
                >
                  <Meta label="Type" value={formatEnum(artifact.type)} />
                  <Meta label="URL" value={artifact.url} />
                  <Meta
                    label="Status"
                    value={artifact.statusCode?.toString() ?? "Unavailable"}
                  />
                </article>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No crawl artifacts were stored for this run.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold">Detected changes</h2>
            <p className="mt-1 text-sm text-slate-500">
              SEO-relevant differences between this crawl and the previous
              snapshot.
            </p>
          </div>

          <div className="grid divide-y divide-slate-100">
            {crawlRun.changeEvents.length ? (
              crawlRun.changeEvents.map((event) => (
                <article
                  key={event.id}
                  className="grid gap-4 p-5 lg:grid-cols-[1fr_1fr_1fr]"
                >
                  <div>
                    <span
                      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                        event.severity === "CRITICAL"
                          ? "border-red-200 bg-red-50 text-red-700"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      {formatEnum(event.severity)}
                    </span>
                    <h3 className="mt-3 font-semibold">
                      {formatEnum(event.changeType)}
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      {event.page?.url ?? "Site-level change"}
                    </p>
                  </div>
                  <Meta
                    label="Previous"
                    value={event.previousValue ?? "Missing"}
                  />
                  <Meta label="Current" value={event.newValue ?? "Missing"} />
                </article>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No changes were detected for this crawl run.
              </div>
            )}
          </div>
        </section>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="text-lg font-semibold">Page snapshots</h2>
            <p className="mt-1 text-sm text-slate-500">
              First crawler boundary stores homepage metadata and discovered
              internal links.
            </p>
          </div>

          <div className="grid divide-y divide-slate-100">
            {crawlRun.snapshots.length ? (
              crawlRun.snapshots.map((snapshot) => (
                <article key={snapshot.id} className="grid gap-4 p-5">
                  <div>
                    <h3 className="font-semibold">{snapshot.page.url}</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      HTTP {snapshot.statusCode} - {snapshot.wordCount ?? 0}{" "}
                      words
                    </p>
                  </div>
                  <dl className="grid gap-3 text-sm md:grid-cols-2">
                    <Meta label="Title" value={snapshot.title} />
                    <Meta
                      label="Meta description"
                      value={snapshot.metaDescription}
                    />
                    <Meta label="H1" value={snapshot.h1} />
                    <Meta label="Canonical" value={snapshot.canonical} />
                  </dl>
                </article>
              ))
            ) : (
              <div className="p-8 text-center text-sm text-slate-500">
                No snapshots were stored for this crawl run.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-slate-700">{value ?? "Missing"}</dd>
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

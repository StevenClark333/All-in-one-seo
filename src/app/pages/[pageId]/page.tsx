import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, GitBranch, Link2 } from "lucide-react";
import { generatePageRecommendations } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { getPageDetailData } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

type PageDetailPageProps = {
  params: Promise<{ pageId: string }>;
};

export default async function PageDetailPage({ params }: PageDetailPageProps) {
  const { pageId } = await params;
  const { workspace, page } = await getPageDetailData(pageId);

  if (!page) {
    notFound();
  }

  const latestSnapshot = page.snapshots.at(0);
  const openIssues = page.issues.filter((issue) => issue.status !== "FIXED");
  const criticalIssues = openIssues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_1fr]">
        <AppSidebar active="Pages" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <Link
            href="/pages"
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Pages
          </Link>

          <header className="mt-6 border-b border-slate-200 pb-6">
            <p className="text-sm font-medium text-slate-500">
              {workspace?.name ?? "Workspace"} -{" "}
              {page.domain.client?.name ?? "Unassigned client"} -{" "}
              <Link
                href={`/domains/${page.domain.id}`}
                className="underline-offset-4 hover:underline"
              >
                {page.domain.domain}
              </Link>
            </p>
            <h2 className="mt-2 break-words text-3xl font-semibold tracking-normal">
              {page.url}
            </h2>
          </header>

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric
              label="HTTP status"
              value={latestSnapshot?.statusCode ?? "Pending"}
            />
            <Metric label="Open issues" value={openIssues.length} />
            <Metric label="Critical issues" value={criticalIssues} />
            <Metric
              label="Internal links"
              value={`${page.incomingLinks.length} in / ${page.outgoingLinks.length} out`}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_380px]">
            <div className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <h3 className="text-lg font-semibold">Latest SEO snapshot</h3>
                {latestSnapshot ? (
                  <dl className="mt-5 grid gap-4 md:grid-cols-2">
                    <Meta
                      label="Title"
                      value={latestSnapshot.title ?? "Missing"}
                    />
                    <Meta
                      label="Meta description"
                      value={latestSnapshot.metaDescription ?? "Missing"}
                    />
                    <Meta label="H1" value={latestSnapshot.h1 ?? "Missing"} />
                    <Meta
                      label="Canonical"
                      value={latestSnapshot.canonical ?? "Missing"}
                    />
                    <Meta
                      label="Robots"
                      value={latestSnapshot.robotsDirective ?? "Not set"}
                    />
                    <Meta
                      label="Word count"
                      value={latestSnapshot.wordCount ?? "Unknown"}
                    />
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    This page has not been snapshotted by a crawl yet.
                  </p>
                )}
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h3 className="text-lg font-semibold">Issue history</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Page-level issues with owner and workflow state.
                  </p>
                </div>
                <div className="grid divide-y divide-slate-100">
                  {page.issues.length ? (
                    page.issues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/issues/${issue.id}`}
                        className="grid gap-3 p-5 transition hover:bg-slate-50 md:grid-cols-[1fr_120px_130px]"
                      >
                        <div>
                          <p className="font-semibold">{issue.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatIssueType(issue.issueType)}
                          </p>
                        </div>
                        <Meta
                          label="Severity"
                          value={formatEnum(issue.severity)}
                        />
                        <Meta label="Status" value={formatEnum(issue.status)} />
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No page-level issues detected.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <Bot className="size-5 text-slate-500" aria-hidden="true" />
                  <h3 className="font-semibold">AI recommendations</h3>
                </div>
                <form action={generatePageRecommendations} className="mt-4">
                  <input type="hidden" name="pageId" value={page.id} />
                  <button className="inline-flex h-10 items-center rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                    Generate page suggestions
                  </button>
                </form>
                <div className="mt-4 grid gap-3 border-t border-slate-200 pt-4">
                  {page.recommendations.length ? (
                    page.recommendations.map((recommendation) => (
                      <div
                        key={recommendation.id}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
                          {formatEnum(recommendation.type)}
                        </p>
                        <p className="mt-2 text-sm font-semibold">
                          {readPayload(recommendation.recommendationJson).title}
                        </p>
                        <p className="mt-1 text-sm leading-6 text-slate-600">
                          {readPayload(recommendation.recommendationJson)
                            .suggestedValue ??
                            readPayload(recommendation.recommendationJson)
                              .summary}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No AI recommendations generated for this page yet.
                    </p>
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-2">
                  <GitBranch
                    className="size-5 text-slate-500"
                    aria-hidden="true"
                  />
                  <h3 className="font-semibold">Change timeline</h3>
                </div>
                <div className="mt-4 grid gap-3">
                  {page.changeEvents.length ? (
                    page.changeEvents.map((event) => (
                      <div
                        key={event.id}
                        className="rounded-md border border-slate-200 bg-slate-50 p-3"
                      >
                        <p className="text-sm font-semibold">
                          {formatIssueType(event.changeType)}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {event.createdAt.toLocaleString()}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-slate-500">
                      No tracked page changes yet.
                    </p>
                  )}
                </div>
              </section>

              <LinkPanel
                title="Incoming links"
                links={page.incomingLinks}
                inbound
              />
              <LinkPanel title="Outgoing links" links={page.outgoingLinks} />
            </aside>
          </section>
        </section>
      </div>
    </main>
  );
}

function LinkPanel({
  inbound = false,
  links,
  title,
}: {
  inbound?: boolean;
  links: Array<{
    id: string;
    href: string;
    anchorText: string | null;
    sourcePage?: { id: string; url: string } | null;
    targetPage?: { id: string; url: string } | null;
  }>;
  title: string;
}) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <Link2 className="size-5 text-slate-500" aria-hidden="true" />
        <h3 className="font-semibold">{title}</h3>
      </div>
      <div className="mt-4 grid gap-3">
        {links.length ? (
          links.map((link) => {
            const linkedPage = inbound ? link.sourcePage : link.targetPage;

            return (
              <div
                key={link.id}
                className="rounded-md border border-slate-200 bg-slate-50 p-3"
              >
                {linkedPage ? (
                  <Link
                    href={`/pages/${linkedPage.id}`}
                    className="text-sm font-semibold underline-offset-4 hover:underline"
                  >
                    {linkedPage.url}
                  </Link>
                ) : (
                  <p className="truncate text-sm font-semibold">{link.href}</p>
                )}
                <p className="mt-1 truncate text-xs text-slate-500">
                  {link.anchorText ?? "No anchor text"}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">No links recorded.</p>
        )}
      </div>
    </section>
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

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
        {label}
      </dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{value}</dd>
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

function formatIssueType(value: string) {
  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function readPayload(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "title" in value &&
    "summary" in value
  ) {
    return value as {
      title: string;
      summary: string;
      suggestedValue?: string;
    };
  }

  return { title: "Recommendation", summary: "Stored recommendation output." };
}

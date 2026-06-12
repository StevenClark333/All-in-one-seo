import Link from "next/link";
import { notFound } from "next/navigation";
import {
  AlertTriangle,
  ArrowLeft,
  Bot,
  CheckCircle2,
  FileText,
  GitBranch,
  Link2,
} from "lucide-react";
import { generatePageRecommendations } from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { getPageDetailData } from "@/lib/management-queries";
import {
  formatPageClient,
  formatPageMetaText,
  formatPageResponse,
  formatPageWordCount,
} from "@/lib/page-display-labels";
import {
  formatProductPageDetailType,
  formatProductPageSearchVisibility,
  PRODUCT_BEGINNER_COPY,
} from "@/lib/product-copy";

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
  const importantIssues = openIssues.filter(
    (issue) => issue.severity === "CRITICAL",
  ).length;
  const firstIssue = openIssues.at(0);
  const hasSearchVisibilityProblem = openIssues.some((issue) =>
    `${issue.title} ${issue.issueType}`
      .toLowerCase()
      .match(/noindex|robots|canonical|blocked/),
  );
  const hasTitle = Boolean(latestSnapshot?.title);
  const hasDescription = Boolean(latestSnapshot?.metaDescription);
  const isSearchable =
    latestSnapshot?.robotsDirective?.toLowerCase().includes("noindex") !==
      true && !hasSearchVisibilityProblem;

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Pages" activeDomainId={page.domain.id} />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <Link
            href={`/domains/${page.domain.id}/workspace`}
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Website workspace
          </Link>

          <header className="mt-6 border-b border-slate-200 pb-6">
            <p className="text-sm font-medium text-slate-500">
              {workspace?.name ?? "Workspace"} -{" "}
              {formatPageClient(page.domain.client?.name)} -{" "}
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
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500">
              {PRODUCT_BEGINNER_COPY.pageDetailHeaderIntro}
            </p>
          </header>

          <PageFocusPlan
            firstIssue={firstIssue}
            hasDescription={hasDescription}
            hasTitle={hasTitle}
            isSearchable={isSearchable}
            pageId={page.id}
          />

          <section className="mt-6 grid gap-4 md:grid-cols-4">
            <Metric
              label="Page response"
              value={formatPageResponse(latestSnapshot?.statusCode)}
            />
            <Metric label="Open problems" value={openIssues.length} />
            <Metric
              label={PRODUCT_BEGINNER_COPY.pagesImportantCountLabel}
              value={importantIssues}
            />
            <Metric
              label="Helpful links"
              value={`${page.incomingLinks.length} in / ${page.outgoingLinks.length} out`}
            />
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <div className="grid gap-6">
              <section
                id="page-basics"
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h3 className="text-lg font-semibold">
                  {PRODUCT_BEGINNER_COPY.pageDetailBasicsTitle}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {PRODUCT_BEGINNER_COPY.pageDetailBasicsIntro}
                </p>
                {latestSnapshot ? (
                  <dl className="mt-5 grid gap-4 md:grid-cols-2">
                    <Meta
                      label={PRODUCT_BEGINNER_COPY.pageDetailTitleLabel}
                      value={formatPageMetaText(latestSnapshot.title)}
                    />
                    <Meta
                      label={PRODUCT_BEGINNER_COPY.pageDetailDescriptionLabel}
                      value={formatPageMetaText(
                        latestSnapshot.metaDescription,
                      )}
                    />
                    <Meta
                      label={PRODUCT_BEGINNER_COPY.pageDetailHeadingLabel}
                      value={formatPageMetaText(latestSnapshot.h1)}
                    />
                    <Meta
                      label={PRODUCT_BEGINNER_COPY.pageDetailPreferredPageLabel}
                      value={formatPageMetaText(latestSnapshot.canonical)}
                    />
                    <Meta
                      label={PRODUCT_BEGINNER_COPY.pageDetailVisibilityLabel}
                      value={formatProductPageSearchVisibility(
                        latestSnapshot.robotsDirective,
                      )}
                    />
                    <Meta
                      label={PRODUCT_BEGINNER_COPY.pageDetailCopyLabel}
                      value={formatPageWordCount(latestSnapshot.wordCount)}
                    />
                  </dl>
                ) : (
                  <p className="mt-3 text-sm text-slate-500">
                    {PRODUCT_BEGINNER_COPY.pageDetailNotChecked}
                  </p>
                )}
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h3 className="text-lg font-semibold">
                    Problems on this page
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Open the first important item, follow the suggested fix, and
                    come back here to check the page again.
                  </p>
                </div>
                <div className="grid divide-y divide-slate-100">
                  {openIssues.length ? (
                    openIssues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/issues/${issue.id}`}
                        className="grid gap-3 p-5 transition hover:bg-slate-50 md:grid-cols-[minmax(0,1fr)_120px_130px]"
                      >
                        <div>
                          <p className="font-semibold">{issue.title}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatProductPageDetailType(issue.issueType)}
                          </p>
                        </div>
                        <Meta
                          label="Importance"
                          value={getImportanceLabel(issue.severity)}
                        />
                        <Meta
                          label="Progress"
                          value={getProgressLabel(issue.status)}
                        />
                      </Link>
                    ))
                  ) : (
                    <div className="p-8 text-center text-sm text-slate-500">
                      No open problems on this page. Nice and quiet here.
                    </div>
                  )}
                </div>
              </section>
            </div>

            <aside className="grid gap-6">
              <section
                id="page-suggestions"
                className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <Bot className="size-5 text-slate-500" aria-hidden="true" />
                  <h3 className="font-semibold">Page suggestions</h3>
                </div>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Create plain title, description, and content ideas for this
                  page.
                </p>
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
                        <p className="text-xs font-semibold text-slate-500">
                          {formatRecommendationType(recommendation.type)}
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
                      No suggestions generated for this page yet.
                    </p>
                  )}
                </div>
              </section>

              <details className="group rounded-lg border border-slate-200 bg-white shadow-sm">
                <summary className="flex items-center justify-between gap-4 p-5">
                  <div>
                    <h3 className="font-semibold">
                      {PRODUCT_BEGINNER_COPY.pageDetailMoreTitle}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-slate-500">
                      {PRODUCT_BEGINNER_COPY.pageDetailMoreIntro}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-medium text-orange-600 group-open:hidden">
                    Show detail
                  </span>
                  <span className="hidden shrink-0 text-sm font-medium text-slate-500 group-open:inline">
                    Hide
                  </span>
                </summary>
                <div className="grid gap-5 border-t border-slate-100 p-5">
                  <section>
                    <div className="flex items-center gap-2">
                      <GitBranch
                        className="size-5 text-slate-500"
                        aria-hidden="true"
                      />
                      <h3 className="font-semibold">Page changes</h3>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {page.changeEvents.length ? (
                        page.changeEvents.map((event) => (
                          <div
                            key={event.id}
                            className="rounded-md border border-slate-200 bg-slate-50 p-3"
                          >
                            <p className="text-sm font-semibold">
                              {formatProductPageDetailType(event.changeType)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {event.createdAt.toLocaleString()}
                            </p>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-slate-500">
                          {PRODUCT_BEGINNER_COPY.pagesPageChangesEmpty}
                        </p>
                      )}
                    </div>
                  </section>

                  <LinkPanel
                    title="Links pointing here"
                    links={page.incomingLinks}
                    inbound
                  />
                  <LinkPanel
                    title="Links from this page"
                    links={page.outgoingLinks}
                  />
                </div>
              </details>
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
                  {link.anchorText ??
                    PRODUCT_BEGINNER_COPY.pageDetailMissingLinkText}
                </p>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-500">
            {PRODUCT_BEGINNER_COPY.pageDetailNoLinks}
          </p>
        )}
      </div>
    </section>
  );
}

function PageFocusPlan({
  firstIssue,
  hasDescription,
  hasTitle,
  isSearchable,
  pageId,
}: {
  firstIssue?: {
    id: string;
    issueType: string;
    severity: string;
    title: string;
  };
  hasDescription: boolean;
  hasTitle: boolean;
  isSearchable: boolean;
  pageId: string;
}) {
  const pageBasicsReady = hasTitle && hasDescription && isSearchable;

  const plan = [
    {
      detail: firstIssue
        ? `${getImportanceLabel(firstIssue.severity)}: ${formatProductPageDetailType(
            firstIssue.issueType,
          )}`
        : "No open page problem is waiting right now.",
      href: firstIssue ? `/issues/${firstIssue.id}` : "#page-basics",
      icon: firstIssue ? (
        <AlertTriangle className="size-4" aria-hidden="true" />
      ) : (
        <CheckCircle2 className="size-4" aria-hidden="true" />
      ),
      label: firstIssue ? "Fix this first" : "Page looks calm",
      value: firstIssue?.title ?? PRODUCT_BEGINNER_COPY.pagesNoQuickFix,
    },
    {
      detail: pageBasicsReady
        ? PRODUCT_BEGINNER_COPY.pageDetailBasicsReady
        : PRODUCT_BEGINNER_COPY.pageDetailBasicsNeedsLook,
      href: "#page-basics",
      icon: <FileText className="size-4" aria-hidden="true" />,
      label: PRODUCT_BEGINNER_COPY.pageDetailBasicsPlanLabel,
      value: pageBasicsReady ? "Looks ready" : "Needs a quick look",
    },
    {
      detail:
        "Create a plain suggestion when the page needs better copy or a clearer search result.",
      href: "#page-suggestions",
      icon: <Bot className="size-4" aria-hidden="true" />,
      label: "Need wording help?",
      value: "Generate suggestions",
    },
  ];

  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Page care plan
          </p>
          <h3 className="mt-1 text-2xl font-semibold tracking-normal text-slate-950">
            Open the next useful thing for this page.
          </h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
            This keeps the page focused on decisions, not extra fields. Start
            with an open problem, then check the search result basics.
          </p>
        </div>
      </div>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {plan.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="rounded-md border border-orange-100 bg-white p-4 text-left transition hover:border-orange-200 hover:bg-orange-50"
          >
            <span className="inline-flex size-8 items-center justify-center rounded-md bg-orange-50 text-orange-600">
              {item.icon}
            </span>
            <span className="mt-3 block text-sm font-semibold text-slate-950">
              {item.label}
            </span>
            <span className="mt-2 block text-sm font-medium text-orange-700">
              {item.value}
            </span>
            <span className="mt-2 block text-sm leading-6 text-slate-500">
              {item.detail}
            </span>
          </Link>
        ))}
      </div>
      <form action={generatePageRecommendations} className="mt-4">
        <input type="hidden" name="pageId" value={pageId} />
        <button className="inline-flex h-10 items-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
          Generate page suggestions
        </button>
      </form>
    </section>
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

function Meta({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function getImportanceLabel(value: string) {
  if (value === "CRITICAL") {
    return "Needs quick care";
  }

  if (value === "WARNING") {
    return "Planned";
  }

  return "Idea";
}

function getProgressLabel(value: string) {
  const labels: Record<string, string> = {
    FIXED: "Fixed",
    IGNORED: "Set aside",
    IN_PROGRESS: "Being handled",
    OPEN: "Open",
    REAPPEARED: "Needs another look",
  };

  return labels[value] ?? formatEnum(value);
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatRecommendationType(value: string) {
  const normalized = value.toLowerCase();

  if (normalized.includes("template")) {
    return "Shared note";
  }

  if (normalized.includes("issue") || normalized.includes("fix")) {
    return "Fix note";
  }

  if (normalized.includes("page")) {
    return "Page idea";
  }

  if (normalized.includes("title")) {
    return "Title idea";
  }

  if (normalized.includes("description")) {
    return "Description idea";
  }

  if (normalized.includes("content")) {
    return "Content idea";
  }

  return formatEnum(value);
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

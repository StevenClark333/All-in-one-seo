import Link from "next/link";
import { Bot, WandSparkles } from "lucide-react";
import {
  generateIssueRecommendations,
  generatePageRecommendations,
  generateTemplateFixBrief,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { ActiveProjectBanner } from "@/components/active-project-banner";
import { getAiRecommendationCenterData } from "@/lib/ai";
import { getActiveProjectDomain } from "@/lib/management-queries";

export const dynamic = "force-dynamic";

type RecommendationsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function RecommendationsPage({
  searchParams,
}: RecommendationsPageProps) {
  const params = searchParams ? await searchParams : {};
  const selectedDomainId = getSingle(params.domainId);
  const {
    workspace,
    pages,
    issues,
    templateIssueGroups,
    recommendations,
    usage,
  } = await getAiRecommendationCenterData({ domainId: selectedDomainId });
  const selectedDomain = await getActiveProjectDomain(selectedDomainId);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="AI" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                AI recommendations
              </h2>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <Bot className="size-4" aria-hidden="true" />
              {usage.used} / {usage.quota} this month
            </div>
          </header>

          {selectedDomain ? (
            <ActiveProjectBanner
              clientName={selectedDomain.client?.name}
              domain={selectedDomain.domain}
              domainId={selectedDomain.id}
              note="AI suggestions, fix briefs, templates, and cached recommendations are filtered to this domain."
            />
          ) : null}

          <section className="mt-6 grid gap-6 xl:grid-cols-2">
            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">Page SEO suggestions</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Generate title, meta description, and H1 suggestions from the
                  latest crawl snapshot.
                </p>
              </div>
              <div className="grid divide-y divide-slate-100">
                {pages.length ? (
                  pages.map((page) => (
                    <article
                      key={page.id}
                      className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_150px]"
                    >
                      <div>
                        <Link
                          href={`/pages/${page.id}`}
                          className="font-semibold underline-offset-4 hover:underline"
                        >
                          {page.url}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">
                          {page.domain.client?.name ?? "Unassigned"} -{" "}
                          {page.domain.domain}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {page.recommendations.length} recent recommendations
                        </p>
                      </div>
                      <form action={generatePageRecommendations}>
                        <input type="hidden" name="pageId" value={page.id} />
                        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                          <WandSparkles className="size-4" aria-hidden="true" />
                          Generate
                        </button>
                      </form>
                    </article>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No crawled pages available for recommendations.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 p-5">
                <h3 className="text-lg font-semibold">Issue fix briefs</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Generate plain-language explanations, developer briefs, and
                  CMS-specific instructions.
                </p>
              </div>
              <div className="grid divide-y divide-slate-100">
                {issues.length ? (
                  issues.map((issue) => (
                    <article
                      key={issue.id}
                      className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_150px]"
                    >
                      <div>
                        <Link
                          href={`/issues/${issue.id}`}
                          className="font-semibold underline-offset-4 hover:underline"
                        >
                          {issue.title}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatEnum(issue.severity)} - {issue.domain.domain}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">
                          {issue.recommendations.length} recent recommendations
                        </p>
                      </div>
                      <form action={generateIssueRecommendations}>
                        <input type="hidden" name="issueId" value={issue.id} />
                        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                          <WandSparkles className="size-4" aria-hidden="true" />
                          Generate
                        </button>
                      </form>
                    </article>
                  ))
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No active issues need AI fix briefs.
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Template fix briefs</h3>
              <p className="mt-1 text-sm text-slate-500">
                Generate one shared brief for repeated issues on a URL pattern
                or CMS template.
              </p>
            </div>
            <div className="grid divide-y divide-slate-100">
              {templateIssueGroups.length ? (
                templateIssueGroups.map((group) => (
                  <article
                    key={`${group.domainId}:${group.templateKey}`}
                    className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_170px]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/issues?templateKey=${encodeURIComponent(group.templateKey)}`}
                          className="font-semibold underline-offset-4 hover:underline"
                        >
                          {group.label} template
                        </Link>
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          P{group.priorityScore}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {group.clientName ?? "Unassigned"} - {group.domain}
                      </p>
                      <p className="mt-2 text-xs text-slate-500">
                        {group.issueCount} issues across {group.pageCount}{" "}
                        pages, {group.criticalCount} critical,{" "}
                        {group.recommendations.length} recent briefs
                      </p>
                    </div>
                    <form action={generateTemplateFixBrief}>
                      <input
                        type="hidden"
                        name="domainId"
                        value={group.domainId}
                      />
                      <input
                        type="hidden"
                        name="templateKey"
                        value={group.templateKey}
                      />
                      <button className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white transition hover:bg-slate-800">
                        <WandSparkles className="size-4" aria-hidden="true" />
                        Generate
                      </button>
                    </form>
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No repeated template issue groups are ready for AI briefs.
                </div>
              )}
            </div>
          </section>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Recent recommendations</h3>
              <p className="mt-1 text-sm text-slate-500">
                Stored output is cached by input hash to avoid repeated AI
                spend.
              </p>
            </div>
            <div className="grid divide-y divide-slate-100">
              {recommendations.length ? (
                recommendations.map((recommendation) => (
                  <article key={recommendation.id} className="p-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                        {formatEnum(recommendation.type)}
                      </span>
                      <span className="text-xs text-slate-500">
                        {recommendation.createdAt.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-3 font-semibold">
                      {readPayload(recommendation.recommendationJson).title}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {readPayload(recommendation.recommendationJson).summary}
                    </p>
                  </article>
                ))
              ) : (
                <div className="p-8 text-center text-sm text-slate-500">
                  No recommendations generated yet.
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function readPayload(value: unknown) {
  if (
    value &&
    typeof value === "object" &&
    "title" in value &&
    "summary" in value
  ) {
    return value as { title: string; summary: string };
  }

  return { title: "Recommendation", summary: "Stored recommendation output." };
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

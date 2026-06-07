import Link from "next/link";
import { Bot, WandSparkles } from "lucide-react";
import { AlertCircle, Layers3, Lightbulb } from "lucide-react";
import {
  generateIssueRecommendations,
  generatePageRecommendations,
  generateTemplateFixBrief,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { EmptyState } from "@/components/empty-state";
import { ProjectWorkspaceBar } from "@/components/project-workspace-bar";
import { getAiRecommendationCenterData } from "@/lib/ai";

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
  const quotaRemaining = Math.max(0, usage.quota - usage.used);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="AI" activeDomainId={selectedDomainId} />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Content Ideas
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Turn crawled pages and open problems into clear titles, fix
                briefs, and repeated-template notes without making the user
                understand AI prompts.
              </p>
            </div>

            <div className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm">
              <Bot className="size-4" aria-hidden="true" />
              {quotaRemaining} ideas left this month
            </div>
          </header>

          <ContentIdeaPlan
            issueCount={issues.length}
            pageCount={pages.length}
            quotaRemaining={quotaRemaining}
            templateCount={templateIssueGroups.length}
          />

          <ProjectWorkspaceBar
            active="ai"
            domainId={selectedDomainId}
            note="Content ideas, fix briefs, templates, and saved outputs are filtered to this project."
            returnPath="/recommendations"
          />

          <section className="mt-6 grid gap-6">
            <details
              id="page-ideas"
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
              open={pages.length > 0}
            >
              <summary className="p-5">
                <h3 className="text-lg font-semibold">Page copy ideas</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Improve titles, meta descriptions, and H1s from crawled page
                  data.
                </p>
              </summary>
              <div className="grid divide-y divide-slate-100 border-t border-slate-200">
                {pages.length ? (
                  pages.map((page) => (
                    <article
                      key={page.id}
                      className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_180px]"
                    >
                      <div>
                        <Link
                          href={`/pages/${page.id}`}
                          className="font-semibold underline-offset-4 hover:underline"
                        >
                          {page.url}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">
                          {page.domain.client?.name ?? "Unassigned"} ·{" "}
                          {page.domain.domain}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {page.recommendations.length} saved ideas
                        </p>
                      </div>
                      <form action={generatePageRecommendations}>
                        <input type="hidden" name="pageId" value={page.id} />
                        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                          <WandSparkles className="size-4" aria-hidden="true" />
                          Create page ideas
                        </button>
                      </form>
                    </article>
                  ))
                ) : (
                  <FriendlyEmpty
                    title="No crawled pages yet"
                    body="Run a project crawl first, then come back for title, description, and H1 ideas."
                  />
                )}
              </div>
            </details>

            <details
              id="fix-briefs"
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
              open={issues.length > 0}
            >
              <summary className="p-5">
                <h3 className="text-lg font-semibold">Fix briefs</h3>
                <p className="mt-1 text-sm text-slate-500">
                  Turn active problems into plain-language briefs for a CMS,
                  developer, or client.
                </p>
              </summary>
              <div className="grid divide-y divide-slate-100 border-t border-slate-200">
                {issues.length ? (
                  issues.map((issue) => (
                    <article
                      key={issue.id}
                      className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_180px]"
                    >
                      <div>
                        <Link
                          href={`/issues/${issue.id}`}
                          className="font-semibold underline-offset-4 hover:underline"
                        >
                          {issue.title}
                        </Link>
                        <p className="mt-1 text-sm text-slate-500">
                          {formatEnum(issue.severity)} · {issue.domain.domain}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          {issue.recommendations.length} saved briefs
                        </p>
                      </div>
                      <form action={generateIssueRecommendations}>
                        <input type="hidden" name="issueId" value={issue.id} />
                        <button className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                          <WandSparkles className="size-4" aria-hidden="true" />
                          Create fix brief
                        </button>
                      </form>
                    </article>
                  ))
                ) : (
                  <FriendlyEmpty
                    title="No active problems need briefs"
                    body="When a problem needs a handoff, this page can turn it into a clear fix note."
                  />
                )}
              </div>
            </details>
          </section>

          <details
            id="template-briefs"
            className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm"
            open={templateIssueGroups.length > 0}
          >
            <summary className="p-5">
              <h3 className="text-lg font-semibold">Repeated-page briefs</h3>
              <p className="mt-1 text-sm text-slate-500">
                Create one shared note for template problems that affect many
                similar pages.
              </p>
            </summary>
            <div className="grid divide-y divide-slate-100 border-t border-slate-200">
              {templateIssueGroups.length ? (
                templateIssueGroups.map((group) => (
                  <article
                    key={`${group.domainId}:${group.templateKey}`}
                    className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_170px]"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/issues?templateKey=${encodeURIComponent(group.templateKey)}&domainId=${group.domainId}`}
                          className="font-semibold underline-offset-4 hover:underline"
                        >
                          {group.label} template
                        </Link>
                        <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          P{group.priorityScore}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">
                        {group.clientName ?? "Unassigned"} · {group.domain}
                      </p>
                      <p className="mt-2 text-sm text-slate-500">
                        {group.issueCount} issues across {group.pageCount}{" "}
                        pages, {group.criticalCount} critical,{" "}
                        {group.recommendations.length} saved briefs
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
                      <button className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                        <WandSparkles className="size-4" aria-hidden="true" />
                        Create shared brief
                      </button>
                    </form>
                  </article>
                ))
              ) : (
                <FriendlyEmpty
                  title="No repeated-page briefs needed"
                  body="When the same problem appears across many similar pages, this section will create one shared handoff."
                />
              )}
            </div>
          </details>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h3 className="text-lg font-semibold">Saved ideas and briefs</h3>
              <p className="mt-1 text-sm text-slate-500">
                Reuse earlier output instead of generating the same idea twice.
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
                <div className="p-5">
                  <EmptyState
                    action={
                      <Link
                        href="/issues"
                        className="inline-flex h-10 items-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700"
                      >
                        <WandSparkles className="size-4" aria-hidden="true" />
                        Find a problem to solve
                      </Link>
                    }
                    description="Open a problem first, then generate a clear fix brief or recommendation from the issue details."
                    icon={WandSparkles}
                    title="No content ideas or fix briefs yet"
                  />
                </div>
              )}
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}

function ContentIdeaPlan({
  issueCount,
  pageCount,
  quotaRemaining,
  templateCount,
}: {
  issueCount: number;
  pageCount: number;
  quotaRemaining: number;
  templateCount: number;
}) {
  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Content idea plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Pick the easiest writing help for today.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start with page copy when a page needs a better title, use fix
            briefs when someone needs instructions, and use repeated-page briefs
            when one template fix helps many pages.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={<Lightbulb className="size-4" aria-hidden="true" />}
            label="Page copy"
            value={pageCount ? `${pageCount} pages ready` : "Run a crawl first"}
            detail={`${quotaRemaining} ideas left this month.`}
            href="#page-ideas"
          />
          <PlanTile
            icon={<AlertCircle className="size-4" aria-hidden="true" />}
            label="Fix briefs"
            value={issueCount ? `${issueCount} problems ready` : "No briefs needed"}
            detail="Create a plain handoff for CMS or developer work."
            href="#fix-briefs"
          />
          <PlanTile
            icon={<Layers3 className="size-4" aria-hidden="true" />}
            label="Repeated pages"
            value={templateCount ? `${templateCount} groups ready` : "No repeats"}
            detail="Use one shared note when many pages need the same fix."
            href="#template-briefs"
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
      className="block rounded-lg border border-orange-100 bg-white p-4 shadow-sm transition hover:border-orange-200"
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

function FriendlyEmpty({ body, title }: { body: string; title: string }) {
  return (
    <div className="p-8 text-center text-sm text-slate-500">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mx-auto mt-1 max-w-md leading-6">{body}</p>
    </div>
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

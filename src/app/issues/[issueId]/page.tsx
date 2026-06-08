import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Bot, Download, MessageSquareText } from "lucide-react";
import {
  addIssueNote,
  assignIssue,
  generateLinkFixesAction,
  generateIssueRecommendations,
  updateIssueStatus,
} from "@/app/actions";
import { getIssueDetailData } from "@/lib/issue-queries";
import { buildIssueSolution } from "@/lib/issue-solutions";

export const dynamic = "force-dynamic";

type IssueDetailPageProps = {
  params: Promise<{ issueId: string }>;
};

const statuses = ["OPEN", "IN_PROGRESS", "FIXED", "IGNORED", "REAPPEARED"];

const availabilityStyles = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  blue: "border-blue-200 bg-blue-50 text-blue-800",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-800",
};

export default async function IssueDetailPage({
  params,
}: IssueDetailPageProps) {
  const { issueId } = await params;
  const { workspace, issue, members } = await getIssueDetailData(issueId);

  if (!issue) {
    notFound();
  }

  const latestSnapshot = issue.page?.snapshots.at(0);
  const solution = buildIssueSolution({
    issueType: issue.issueType,
    platform: issue.domain.platform,
    recommendation: issue.recommendation,
    title: issue.title,
  });
  const canExportHandoff =
    solution.fixAvailability.label === "Needs website editor" ||
    solution.fixAvailability.label === "Needs site helper";
  const timeline = [
    {
      id: "created",
      label: "Problem found",
      detail: "A website check added this to the fix list.",
      date: issue.firstDetectedAt,
    },
    {
      id: "detected",
      label: "Last seen",
      detail: "The latest website check still saw this problem.",
      date: issue.lastDetectedAt,
    },
    ...(issue.resolvedAt
      ? [
          {
            id: "resolved",
            label: "Solved",
            detail: "This problem was marked fixed.",
            date: issue.resolvedAt,
          },
        ]
      : []),
    ...issue.notes.map((note) => ({
      id: note.id,
      label: `${formatEnum(note.visibility)} note`,
      detail: note.body,
      date: note.createdAt,
    })),
  ].sort((left, right) => right.date.getTime() - left.date.getTime());

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href={`/domains/${issue.domain.id}/workspace`}
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Website workspace
        </Link>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={issue.severity === "CRITICAL" ? "red" : "amber"}>
                {formatEnum(issue.severity)}
              </Badge>
              <Badge tone={issue.status === "FIXED" ? "emerald" : "slate"}>
                {formatEnum(issue.status)}
              </Badge>
              <span className="text-sm font-medium text-slate-500">
                Priority score {issue.priorityScore}
              </span>
            </div>

            <h1 className="mt-4 text-3xl font-semibold tracking-normal">
              {issue.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              {softenProblemText(issue.description)}
            </p>

            <div className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-emerald-700">
                    Best next step
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-emerald-950">
                    {solution.title}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-emerald-900">
                    {softenProblemText(solution.detail)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
                  <span className="inline-flex h-9 items-center rounded-md bg-white px-3 text-sm font-semibold text-emerald-800">
                    {solution.effort}
                  </span>
                  <span
                    className={`inline-flex h-9 items-center rounded-md border bg-white px-3 text-sm font-semibold ${availabilityStyles[solution.fixAvailability.tone]}`}
                  >
                    {solution.fixAvailability.label}
                  </span>
                </div>
              </div>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-md border border-emerald-200 bg-white/70 p-3">
                  <p className="text-sm font-semibold text-emerald-950">
                    Why this matters
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-900">
                    {softenProblemText(solution.whyMatters)}
                  </p>
                </div>
                <div className="rounded-md border border-emerald-200 bg-white/70 p-3">
                  <p className="text-sm font-semibold text-emerald-950">
                    Can I prepare this here?
                  </p>
                  <p className="mt-1 text-sm leading-6 text-emerald-900">
                    {softenProblemText(solution.fixAvailability.detail)}
                  </p>
                  {canExportHandoff ? (
                    <Link
                      href={`/api/exports/fix-brief?issueId=${issue.id}`}
                      className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-emerald-300 bg-white px-3 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                    >
                      <Download className="size-4" aria-hidden="true" />
                      Download fix note
                    </Link>
                  ) : null}
                </div>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
                <ol className="grid gap-2 text-sm leading-6 text-emerald-950">
                  {solution.steps.map((step, index) => (
                    <li key={step}>
                      <span className="font-semibold">{index + 1}.</span>{" "}
                      {softenProblemText(step)}
                    </li>
                  ))}
                </ol>
                <div className="flex flex-wrap items-start gap-2 lg:justify-end">
                  {solution.primaryAction === "fix-center" ? (
                    <form action={generateLinkFixesAction}>
                      <input
                        type="hidden"
                        name="domainId"
                        value={issue.domain.id}
                      />
                      <button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
                        Create fix note
                      </button>
                    </form>
                  ) : (
                    <form action={generateIssueRecommendations}>
                      <input type="hidden" name="issueId" value={issue.id} />
                      <button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
                        Create fix note
                      </button>
                    </form>
                  )}
                  <Link
                    href={
                      solution.primaryAction === "fix-center"
                        ? `/fix-center?domainId=${issue.domain.id}`
                        : `/recommendations?domainId=${issue.domain.id}`
                    }
                    className="inline-flex h-10 items-center justify-center rounded-md border border-emerald-300 bg-white px-4 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100"
                  >
                    Open fix workspace
                  </Link>
                </div>
              </div>
            </div>

            <dl className="mt-6 grid gap-4 border-t border-slate-100 pt-6 md:grid-cols-2">
              <Meta label="Workspace" value={workspace?.name ?? "Workspace"} />
              <Meta label="Client" value={issue.client?.name ?? "Unassigned"} />
              <Meta label="Website" value={issue.domain.domain} />
              <Meta
                label="Problem area"
                value={formatIssueType(issue.issueType)}
              />
              <Meta
                label="Page"
                value={issue.page?.url ?? "Whole-website problem"}
              />
              <Meta
                label="Owner"
                value={
                  issue.assignedTo?.name ??
                  issue.assignedTo?.email ??
                  "Unassigned"
                }
              />
            </dl>

            <div className="mt-6 rounded-md border border-slate-200 bg-slate-50 p-4">
              <h2 className="font-semibold">Fix note</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {issue.recommendation
                  ? softenProblemText(issue.recommendation)
                  : "No fix note has been created yet."}
              </p>
            </div>

            {latestSnapshot ? (
              <div className="mt-6 rounded-md border border-slate-200 bg-white p-4">
                <h2 className="font-semibold">Latest page details</h2>
                <dl className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <Meta
                    label="HTTP status"
                    value={latestSnapshot.statusCode.toString()}
                  />
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
                </dl>
              </div>
            ) : null}
          </section>

          <aside className="grid gap-6">
            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Bot className="size-5 text-slate-500" aria-hidden="true" />
                <h2 className="font-semibold">Fix ideas</h2>
              </div>

              <form action={generateIssueRecommendations} className="mt-4">
                <input type="hidden" name="issueId" value={issue.id} />
                <button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                  Create fix ideas
                </button>
              </form>

              <div className="mt-4 grid gap-3 border-t border-slate-100 pt-4">
                {issue.recommendations.length ? (
                  issue.recommendations.map((recommendation) => (
                    <article
                      key={recommendation.id}
                      className="rounded-md border border-slate-200 bg-slate-50 p-3"
                    >
                      <p className="text-sm font-semibold text-slate-500">
                        {formatEnum(recommendation.type)}
                      </p>
                      <p className="mt-2 text-sm font-semibold">
                        {readPayload(recommendation.recommendationJson).title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-slate-600">
                        {softenProblemText(
                          readPayload(recommendation.recommendationJson)
                            .summary,
                        )}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    No fix ideas created yet.
                  </p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Progress</h2>

              <form action={updateIssueStatus} className="mt-4 grid gap-3">
                <input type="hidden" name="issueId" value={issue.id} />
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Status
                  </span>
                  <select
                    name="status"
                    defaultValue={issue.status}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    {statuses.map((status) => (
                      <option key={status} value={status}>
                        {formatEnum(status)}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                  Save progress
                </button>
              </form>

              <form
                action={assignIssue}
                className="mt-5 grid gap-3 border-t border-slate-100 pt-5"
              >
                <input type="hidden" name="issueId" value={issue.id} />
                <label className="grid gap-2">
                  <span className="text-sm font-medium text-slate-700">
                    Owner
                  </span>
                  <select
                    name="assignedToId"
                    defaultValue={issue.assignedToId ?? ""}
                    className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                  >
                    <option value="">Unassigned</option>
                    {members.map((member) => (
                      <option key={member.userId} value={member.userId}>
                        {member.user.name ?? member.user.email}
                      </option>
                    ))}
                  </select>
                </label>
                <button className="inline-flex h-10 items-center justify-center rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                  Assign person
                </button>
              </form>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2">
                <MessageSquareText
                  className="size-5 text-slate-500"
                  aria-hidden="true"
                />
                <h2 className="font-semibold">Notes</h2>
              </div>

              <form action={addIssueNote} className="mt-4 grid gap-3">
                <input type="hidden" name="issueId" value={issue.id} />
                <select
                  name="authorId"
                  defaultValue={members.at(0)?.userId ?? ""}
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="">No author</option>
                  {members.map((member) => (
                    <option key={member.userId} value={member.userId}>
                      {member.user.name ?? member.user.email}
                    </option>
                  ))}
                </select>
                <select
                  name="visibility"
                  defaultValue="INTERNAL"
                  className="h-10 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                >
                  <option value="INTERNAL">Internal note</option>
                  <option value="CLIENT_VISIBLE">Client-visible note</option>
                </select>
                <textarea
                  name="body"
                  required
                  rows={4}
                  placeholder="Add context, decision notes, or a client-friendly explanation..."
                  className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
                />
                <button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-medium text-white transition hover:bg-orange-700">
                  Add note
                </button>
              </form>

              <div className="mt-5 grid gap-3 border-t border-slate-100 pt-5">
                {issue.notes.length ? (
                  issue.notes.map((note) => (
                    <article
                      key={note.id}
                      className="rounded-md border border-slate-200 bg-slate-50 p-3"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          tone={
                            note.visibility === "CLIENT_VISIBLE"
                              ? "blue"
                              : "slate"
                          }
                        >
                          {formatEnum(note.visibility)}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {note.author?.name ?? note.author?.email ?? "Unknown"}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-700">
                        {note.body}
                      </p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No notes yet.</p>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold">Progress history</h2>
              <div className="mt-4 grid gap-3">
                {timeline.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-md border border-slate-200 bg-slate-50 p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold">{event.label}</p>
                      <span className="text-xs text-slate-500">
                        {event.date.toLocaleString()}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {event.detail}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-medium text-slate-700">{value}</dd>
    </div>
  );
}

function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "amber" | "blue" | "emerald" | "red" | "slate";
}) {
  const styles = {
    amber: "border-amber-200 bg-amber-50 text-amber-700",
    blue: "border-blue-200 bg-blue-50 text-blue-700",
    emerald: "border-emerald-200 bg-emerald-50 text-emerald-700",
    red: "border-red-200 bg-red-50 text-red-700",
    slate: "border-slate-200 bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${styles[tone]}`}
    >
      {children}
    </span>
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

function softenProblemText(value: string) {
  return value
    .replace(/\banalyzer pass\b/gi, "website check")
    .replace(/\blatest crawl\b/gi, "latest website check")
    .replace(/\bdisallows crawling\b/gi, "blocks search-engine access to")
    .replace(/\ballow crawling\b/gi, "allow search-engine access")
    .replace(/\beasier to crawl\b/gi, "easier for search engines to read")
    .replace(/\bcrawlability\b/gi, "findability")
    .replace(/\bcrawlable\b/gi, "easy for search engines to read")
    .replace(/\bcrawling\b/gi, "search-engine access")
    .replace(/\bcrawled\b/gi, "checked")
    .replace(/\brecrawl\b/gi, "run a new website check")
    .replace(/\bcrawl\b/gi, "website check")
    .replace(/\bcrawlers\b/gi, "search engines")
    .replace(/\bcrawler\b/gi, "search engine")
    .replace(/\bissue\b/gi, "problem");
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

  return { title: "Fix idea", summary: "Saved fix idea." };
}

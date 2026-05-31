import { readFile } from "node:fs/promises";
import { join } from "node:path";
import Link from "next/link";
import { ArrowLeft, ListChecks } from "lucide-react";

export default async function ProductionTaskListPage() {
  const markdown = await readFile(
    join(process.cwd(), "PRODUCTION_TASK_LIST.md"),
    "utf8",
  );

  return (
    <main className="min-h-screen bg-[#f6f8fb] px-5 py-6 text-slate-950 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/"
          className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Dashboard
        </Link>

        <header className="mt-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
              <ListChecks className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">
                Execution source of truth
              </p>
              <h1 className="text-2xl font-semibold tracking-normal">
                Production task list
              </h1>
            </div>
          </div>
        </header>

        <article className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
          <pre className="max-h-[72vh] overflow-auto whitespace-pre-wrap p-6 font-mono text-sm leading-7 text-slate-700">
            {markdown}
          </pre>
        </article>
      </div>
    </main>
  );
}

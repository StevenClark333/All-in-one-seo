import Link from "next/link";
import { Search } from "lucide-react";
import { AppSidebar } from "@/components/app-sidebar";
import { getGlobalSearchResults } from "@/lib/global-search";

export const dynamic = "force-dynamic";

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = searchParams ? await searchParams : {};
  const query = getSingle(params.q)?.trim() ?? "";
  const { results, workspaceName } = await getGlobalSearchResults(query);
  const groups = groupResults(results);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Search" />

        <section className="min-w-0 px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspaceName}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Search
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
                Find projects, clients, pages, issues, reports, and common
                actions from one command surface.
              </p>
            </div>
          </header>

          <section className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <form action="/search" className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="global-search-input"
                name="q"
                type="search"
                defaultValue={query}
                placeholder="Search domain, client, page, issue, report, or action"
                className="h-11 w-full rounded-md border border-slate-300 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
            </form>
          </section>

          <section className="mt-6 grid gap-6">
            {groups.length ? (
              groups.map((group) => (
                <div
                  key={group.category}
                  className="rounded-lg border border-slate-200 bg-white shadow-sm"
                >
                  <div className="border-b border-slate-200 px-5 py-4">
                    <h3 className="text-lg font-semibold">{group.category}</h3>
                  </div>
                  <div className="grid divide-y divide-slate-100">
                    {group.results.map((result) => {
                      const Icon = result.icon;

                      return (
                        <Link
                          key={`${result.category}:${result.href}:${result.title}`}
                          href={result.href}
                          className="grid gap-3 px-5 py-4 transition hover:bg-slate-50 sm:grid-cols-[40px_minmax(0,1fr)]"
                        >
                          <div className="flex size-10 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                            <Icon className="size-4" aria-hidden="true" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold">
                              {result.title}
                            </p>
                            <p className="mt-1 truncate text-sm text-slate-500">
                              {result.description}
                            </p>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No results found. Try a domain, client, URL, issue title,
                report title, or action such as run crawl.
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

function groupResults(results: Awaited<ReturnType<typeof getGlobalSearchResults>>["results"]) {
  const groups = new Map<
    string,
    Awaited<ReturnType<typeof getGlobalSearchResults>>["results"]
  >();

  for (const result of results) {
    groups.set(result.category, [...(groups.get(result.category) ?? []), result]);
  }

  return Array.from(groups.entries()).map(([category, groupResults]) => ({
    category,
    results: groupResults,
  }));
}

function getSingle(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

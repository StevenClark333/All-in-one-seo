export function RouteLoadingShell({ title = "Loading analytics" }: { title?: string }) {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="hidden border-r border-slate-200 bg-white lg:block">
          <div className="space-y-5 p-5">
            <div className="h-10 w-32 animate-pulse rounded bg-slate-200" />
            <div className="h-10 animate-pulse rounded bg-slate-100" />
            {Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="h-8 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        </aside>
        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <div className="border-b border-slate-200 pb-6">
            <div className="h-4 w-32 animate-pulse rounded bg-slate-200" />
            <div className="mt-3 h-9 w-80 max-w-full animate-pulse rounded bg-slate-200" />
            <p className="mt-3 text-sm font-medium text-slate-500">{title}</p>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-36 animate-pulse rounded-lg border border-slate-200 bg-white"
              />
            ))}
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white" />
            <div className="h-96 animate-pulse rounded-lg border border-slate-200 bg-white" />
          </div>
        </section>
      </div>
    </main>
  );
}

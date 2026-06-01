export default function Loading() {
  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="border-b border-slate-200 bg-white px-5 py-5 lg:border-b-0 lg:border-r">
          <div className="h-10 w-40 animate-pulse rounded-md bg-slate-200" />
          <div className="mt-8 grid gap-2">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-11 animate-pulse rounded-md bg-slate-100"
              />
            ))}
          </div>
        </aside>
        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <div className="h-20 animate-pulse rounded-md bg-slate-200" />
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-lg bg-white shadow-sm"
              />
            ))}
          </div>
          <div className="mt-6 h-96 animate-pulse rounded-lg bg-white shadow-sm" />
        </section>
      </div>
    </main>
  );
}

import Link from "next/link";
import { BookmarkPlus, Star } from "lucide-react";
import { saveAnalyticsViewAction } from "@/app/actions";
import {
  buildSavedViewHref,
  getSavedAnalyticsViews,
  normalizeSavedViewFilters,
  type SavedAnalyticsFilters,
  type SavedAnalyticsRoute,
} from "@/lib/saved-analytics-views";

export async function SavedViewsBar({
  filters,
  route,
}: {
  filters: SavedAnalyticsFilters;
  route: SavedAnalyticsRoute;
}) {
  const views = await getSavedAnalyticsViews(route);
  const normalizedFilters = normalizeSavedViewFilters(filters);

  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Saved views
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {views.length ? (
              views.map((view) => (
                <Link
                  key={view.id}
                  href={buildSavedViewHref({
                    filters: view.filtersJson,
                    route,
                  })}
                  className="inline-flex h-9 max-w-full items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-100"
                >
                  {view.isDefault ? (
                    <Star className="size-3.5 fill-amber-400 text-amber-500" aria-hidden="true" />
                  ) : null}
                  <span className="truncate">{view.name}</span>
                </Link>
              ))
            ) : (
              <span className="inline-flex h-9 items-center rounded-md border border-dashed border-slate-300 px-3 text-sm text-slate-500">
                No saved views yet
              </span>
            )}
          </div>
        </div>

        <form
          action={saveAnalyticsViewAction}
          className="grid gap-2 sm:grid-cols-[minmax(180px,1fr)_auto_auto] xl:w-[520px]"
        >
          <input type="hidden" name="route" value={route} />
          <input
            type="hidden"
            name="filtersJson"
            value={JSON.stringify(normalizedFilters)}
          />
          <input
            name="name"
            placeholder="Save current filters"
            className="h-10 min-w-0 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            required
          />
          <label className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-600">
            <input name="isDefault" type="checkbox" value="1" />
            Default
          </label>
          <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
            <BookmarkPlus className="size-4" aria-hidden="true" />
            Save
          </button>
        </form>
      </div>
    </section>
  );
}

import Link from "next/link";
import { Filter, RotateCcw } from "lucide-react";

export function SeoFilterBar({
  action,
  countries = [],
  devices = [],
  domainId,
  domains = [],
  query,
  resetHref,
}: {
  action: string;
  countries?: string[];
  devices?: string[];
  domainId?: string;
  domains?: Array<{ domain: string; id: string }>;
  query?: string;
  resetHref: string;
}) {
  return (
    <form
      action={action}
      className="mt-6 grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_repeat(2,minmax(0,0.8fr))_auto_auto]"
    >
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-600">
          Website
        </span>
        <select
          name="domainId"
          defaultValue={domainId ?? ""}
          className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
        >
          <option value="">All websites</option>
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.domain}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-600">
          Search term
        </span>
        <input
          name="query"
          defaultValue={query ?? ""}
          placeholder="brand, product, topic"
          className="h-10 min-w-0 rounded-md border border-slate-300 px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
        />
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-600">
          Country
        </span>
        <select
          name="country"
          className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
        >
          <option value="">All</option>
          {countries.map((country) => (
            <option key={country} value={country}>
              {country}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-2">
        <span className="text-sm font-medium text-slate-600">
          Device
        </span>
        <select
          name="device"
          className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
        >
          <option value="">All</option>
          {devices.map((device) => (
            <option key={device} value={device}>
              {device}
            </option>
          ))}
        </select>
      </label>
      <div className="flex items-end">
        <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
          <Filter className="size-4" aria-hidden="true" />
          Apply
        </button>
      </div>
      <div className="flex items-end">
        <Link
          href={resetHref}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw className="size-4" aria-hidden="true" />
          Reset
        </Link>
      </div>
    </form>
  );
}

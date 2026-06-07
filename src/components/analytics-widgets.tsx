import Link from "next/link";
import type { LucideIcon } from "lucide-react";

export type SparkPoint = {
  label?: string;
  value: number;
};

export function AnalyticsMetricCard({
  delta,
  help,
  href,
  icon: Icon,
  label,
  points = [],
  suffix = "",
  value,
}: {
  delta?: number;
  help?: string;
  href?: string;
  icon?: LucideIcon;
  label: string;
  points?: SparkPoint[];
  suffix?: string;
  value: string | number;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            {typeof value === "number" ? value.toLocaleString() : value}
            {suffix}
          </p>
        </div>
        {Icon ? (
          <span className="flex size-9 items-center justify-center rounded-md bg-orange-50 text-orange-600">
            <Icon className="size-4" aria-hidden="true" />
          </span>
        ) : null}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          {typeof delta === "number" ? (
            <p
              className={`text-sm font-semibold ${
                delta >= 0 ? "text-emerald-700" : "text-red-700"
              }`}
            >
              {delta >= 0 ? "+" : ""}
              {Number.isInteger(delta) ? delta : delta.toFixed(1)}
            </p>
          ) : (
            <p className="text-sm text-slate-500">{help ?? "Live analytics"}</p>
          )}
        </div>
        <Sparkline points={points} />
      </div>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:bg-orange-50/30 hover:shadow-md"
      >
        {body}
      </Link>
    );
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      {body}
    </article>
  );
}

export function Sparkline({ points }: { points: SparkPoint[] }) {
  const values = points.map((point) => point.value);
  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const range = max - min || 1;
  const path = values
    .map((value, index) => {
      const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * 100;
      const y = 36 - ((value - min) / range) * 32;

      return `${index === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      aria-hidden="true"
      className="h-10 w-24 shrink-0 overflow-visible"
      viewBox="0 0 100 40"
    >
      <path d={path || "M 0 36"} fill="none" stroke="#ff642f" strokeWidth="3" />
      <path
        d={`${path || "M 0 36"} L 100 40 L 0 40 Z`}
        fill="#fff2ec"
        opacity="0.8"
      />
    </svg>
  );
}

export function HorizontalBar({
  label,
  max,
  value,
}: {
  label: string;
  max: number;
  value: number;
}) {
  const width = Math.max(2, Math.min(100, (value / Math.max(1, max)) * 100));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-semibold text-slate-950">
          {value.toLocaleString()}
        </span>
      </div>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-orange-500" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}

import { Info } from "lucide-react";

type InfoTooltipProps = {
  label: string;
  passive?: boolean;
  side?: "left" | "right";
};

export function InfoTooltip({
  label,
  passive = false,
  side = "right",
}: InfoTooltipProps) {
  const sideClass =
    side === "left" ? "right-0 origin-top-right" : "left-0 origin-top-left";
  const iconClass =
    "inline-flex size-5 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 focus:bg-slate-100 focus:text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-300";

  return (
    <span className="group relative inline-flex align-middle">
      {passive ? (
        <span className={iconClass} aria-label={label}>
          <Info className="size-3.5" aria-hidden="true" />
        </span>
      ) : (
        <button type="button" aria-label={label} className={iconClass}>
          <Info className="size-3.5" aria-hidden="true" />
        </button>
      )}
      <span
        role="tooltip"
        className={`pointer-events-none absolute top-6 z-30 w-[min(18rem,calc(100vw-2rem))] scale-95 rounded-md border border-slate-200 bg-slate-950 px-3 py-2 text-left text-xs font-medium leading-5 text-white opacity-0 shadow-lg transition group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 ${sideClass}`}
      >
        {label}
      </span>
    </span>
  );
}

export function HelpLabel({
  children,
  help,
  side,
}: {
  children: React.ReactNode;
  help: string;
  side?: "left" | "right";
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      {children}
      <InfoTooltip label={help} side={side} />
    </span>
  );
}

import type { LucideIcon } from "lucide-react";

export function EmptyState({
  action,
  description,
  icon: Icon,
  title,
}: {
  action?: React.ReactNode;
  description: string;
  icon: LucideIcon;
  title: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-orange-200 bg-orange-50/40 px-5 py-10 text-center shadow-sm transition hover:border-orange-300 hover:bg-orange-50/60 hover:shadow-md">
      <div className="flex size-11 items-center justify-center rounded-lg bg-white text-orange-600 shadow-md">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-950">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

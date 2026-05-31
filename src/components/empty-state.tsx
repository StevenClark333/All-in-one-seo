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
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
      <div className="flex size-11 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        <Icon className="size-5" aria-hidden="true" />
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {description}
      </p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

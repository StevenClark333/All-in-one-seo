import Link from "next/link";
import { ArrowLeft, Globe2 } from "lucide-react";
import { InfoTooltip } from "@/components/info-tooltip";

type ActiveProjectBannerProps = {
  clientName?: string | null;
  domain: string;
  domainId: string;
  note?: string;
};

export function ActiveProjectBanner({
  clientName,
  domain,
  domainId,
  note = "This view is focused on one selected website.",
}: ActiveProjectBannerProps) {
  return (
    <section className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4 text-blue-950">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-white text-blue-700">
            <Globe2 className="size-5" aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
              Active website
              <InfoTooltip
                label="All data and actions on this screen are filtered to this website."
                passive
                side="right"
              />
            </p>
            <h3 className="mt-1 break-words text-lg font-semibold">
              {domain}
            </h3>
            <p className="mt-1 text-sm leading-6 text-blue-800">
              {clientName ?? "Unassigned client"} - {note}
            </p>
          </div>
        </div>
        <Link
          href={`/domains/${domainId}/workspace`}
          className="inline-flex h-10 shrink-0 items-center justify-center gap-2 rounded-md border border-blue-200 bg-white px-4 text-sm font-semibold text-blue-900 transition hover:bg-blue-100"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Website workspace
        </Link>
      </div>
    </section>
  );
}

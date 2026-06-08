import Link from "next/link";
import { ChevronRight, Globe2 } from "lucide-react";
import { InfoTooltip } from "@/components/info-tooltip";
import { getProjectNavigationData } from "@/lib/management-queries";

type ProjectWorkspaceBarProps = {
  active: ProjectToolKey;
  domainId?: string;
  returnPath: string;
  note?: string;
};

type ProjectToolKey =
  | "overview"
  | "issues"
  | "pages"
  | "search"
  | "technical"
  | "fixes"
  | "ai"
  | "competitive"
  | "keywords"
  | "rank"
  | "reports"
  | "integrations";

const projectTools: Array<{
  key: ProjectToolKey;
  label: string;
  buildHref: (domainId: string) => string;
}> = [
  {
    key: "overview",
    label: "Overview",
    buildHref: (domainId) => `/domains/${domainId}/workspace`,
  },
  {
    key: "issues",
    label: "Problems",
    buildHref: (domainId) => `/issues?domainId=${domainId}`,
  },
  {
    key: "pages",
    label: "Pages",
    buildHref: (domainId) => `/pages?domainId=${domainId}`,
  },
  {
    key: "search",
    label: "Search",
    buildHref: (domainId) => `/search-performance?domainId=${domainId}`,
  },
  {
    key: "competitive",
    label: "Competitors",
    buildHref: (domainId) => `/competitive-analysis?domainId=${domainId}`,
  },
  {
    key: "keywords",
    label: "Keywords",
    buildHref: (domainId) => `/keyword-research?domainId=${domainId}`,
  },
  {
    key: "rank",
    label: "Rank",
    buildHref: (domainId) => `/rank-tracking?domainId=${domainId}`,
  },
  {
    key: "technical",
    label: "Links",
    buildHref: (domainId) => `/technical-audit?domainId=${domainId}`,
  },
  {
    key: "fixes",
    label: "Fixes",
    buildHref: (domainId) => `/fix-center?domainId=${domainId}`,
  },
  {
    key: "ai",
    label: "Ideas",
    buildHref: (domainId) => `/recommendations?domainId=${domainId}`,
  },
  {
    key: "reports",
    label: "Reports",
    buildHref: (domainId) => `/reports?domainId=${domainId}`,
  },
  {
    key: "integrations",
    label: "Integrations",
    buildHref: (domainId) => `/integrations?domainId=${domainId}`,
  },
];

export async function ProjectWorkspaceBar({
  active,
  domainId,
  note = "All tools below stay focused on the selected website.",
  returnPath,
}: ProjectWorkspaceBarProps) {
  const { domains, selectedDomain } = await getProjectNavigationData(domainId);

  if (!selectedDomain) {
    return (
      <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <form
          action={returnPath}
          className="flex flex-col gap-3 lg:flex-row lg:items-end"
        >
          <label className="grid flex-1 gap-2">
            <span className="inline-flex items-center gap-2 text-sm font-medium text-slate-600">
              Active website
              <InfoTooltip
                label="Choose a website to focus this page."
                passive
              />
            </span>
            <select
              name="domainId"
              defaultValue=""
              className="h-10 min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
            >
              <option value="">All websites</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {formatDomainOption(domain)}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex h-10 items-center justify-center rounded-md bg-orange-600 px-4 text-sm font-semibold text-white transition hover:bg-orange-700">
            Show website work
          </button>
        </form>
      </section>
    );
  }

  return (
    <section className="mt-6 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <nav
              aria-label="Breadcrumb"
              className="flex flex-wrap items-center gap-1 text-sm text-slate-500"
            >
              <Link href="/" className="hover:text-slate-950">
                Home
              </Link>
              <ChevronRight className="size-4" aria-hidden="true" />
              <Link href="/domains" className="hover:text-slate-950">
                Websites
              </Link>
              <ChevronRight className="size-4" aria-hidden="true" />
              <span className="font-medium text-slate-700">
                {selectedDomain.domain}
              </span>
            </nav>

            <div className="mt-3 flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-orange-50 text-orange-600">
                <Globe2 className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-orange-600">
                  Active website
                  <InfoTooltip
                    label="Navigation, filters, and actions in this workspace use this website."
                    passive
                  />
                </p>
                <h3 className="mt-1 truncate text-xl font-semibold">
                  {selectedDomain.domain}
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  {selectedDomain.client?.name ?? "Unassigned client"} - {note}
                </p>
              </div>
            </div>
          </div>

          <form
            action={returnPath}
            className="grid gap-2 sm:grid-cols-[minmax(0,320px)_auto]"
          >
            <label className="grid gap-2">
              <span className="text-sm font-medium text-slate-600">
                Switch website
              </span>
              <select
                name="domainId"
                defaultValue={selectedDomain.id}
                className="h-10 min-w-0 rounded-md border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              >
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {formatDomainOption(domain)}
                  </option>
                ))}
              </select>
            </label>
            <button className="inline-flex h-10 items-center justify-center self-end rounded-md border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-orange-50">
              Switch
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-x-auto">
        <nav
          aria-label="Website tools"
          className="flex min-w-max gap-1 px-4 py-3"
        >
          {projectTools.map((tool) => (
            <Link
              key={tool.key}
              href={tool.buildHref(selectedDomain.id)}
              className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold transition ${
                tool.key === active
                  ? "bg-orange-50 text-orange-700 shadow-[inset_0_-2px_0_#ff642f]"
                  : "text-slate-600 hover:bg-orange-50 hover:text-slate-950"
              }`}
            >
              {tool.label}
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}

function formatDomainOption(domain: {
  client: { name: string } | null;
  domain: string;
}) {
  return `${domain.client?.name ? `${domain.client.name} - ` : ""}${
    domain.domain
  }`;
}

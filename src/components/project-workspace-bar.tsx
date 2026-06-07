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
    label: "Issues",
    buildHref: (domainId) => `/issues?domainId=${domainId}`,
  },
  {
    key: "pages",
    label: "Crawled Pages",
    buildHref: (domainId) => `/pages?domainId=${domainId}`,
  },
  {
    key: "search",
    label: "Search Performance",
    buildHref: (domainId) => `/search-performance?domainId=${domainId}`,
  },
  {
    key: "competitive",
    label: "Competitive",
    buildHref: (domainId) => `/competitive-analysis?domainId=${domainId}`,
  },
  {
    key: "keywords",
    label: "Keywords",
    buildHref: (domainId) => `/keyword-research?domainId=${domainId}`,
  },
  {
    key: "rank",
    label: "Rank Tracking",
    buildHref: (domainId) => `/rank-tracking?domainId=${domainId}`,
  },
  {
    key: "technical",
    label: "Internal Links",
    buildHref: (domainId) => `/technical-audit?domainId=${domainId}`,
  },
  {
    key: "fixes",
    label: "Fixes",
    buildHref: (domainId) => `/fix-center?domainId=${domainId}`,
  },
  {
    key: "ai",
    label: "AI",
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
  note = "All tools below stay scoped to the selected website project.",
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
            <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
              Active project
              <InfoTooltip
                label="Choose a domain to turn this global tool page into a project workspace view."
                passive
              />
            </span>
            <select
              name="domainId"
              defaultValue=""
              className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
            >
              <option value="">All domains</option>
              {domains.map((domain) => (
                <option key={domain.id} value={domain.id}>
                  {formatDomainOption(domain)}
                </option>
              ))}
            </select>
          </label>
          <button className="inline-flex h-10 items-center justify-center rounded-md bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-slate-800">
            Open project view
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
                SEO Projects
              </Link>
              <ChevronRight className="size-4" aria-hidden="true" />
              <span className="font-medium text-slate-700">
                {selectedDomain.domain}
              </span>
            </nav>

            <div className="mt-3 flex min-w-0 items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-blue-50 text-blue-700">
                <Globe2 className="size-5" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-700">
                  Active project
                  <InfoTooltip
                    label="Navigation, filters, and actions in this workspace use this domain."
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
              <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                Switch project
              </span>
              <select
                name="domainId"
                defaultValue={selectedDomain.id}
                className="h-10 min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              >
                {domains.map((domain) => (
                  <option key={domain.id} value={domain.id}>
                    {formatDomainOption(domain)}
                  </option>
                ))}
              </select>
            </label>
            <button className="inline-flex h-10 items-center justify-center self-end rounded-md border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Switch
            </button>
          </form>
        </div>
      </div>

      <div className="overflow-x-auto">
        <nav
          aria-label="Project tools"
          className="flex min-w-max gap-1 px-4 py-3"
        >
          {projectTools.map((tool) => (
            <Link
              key={tool.key}
              href={tool.buildHref(selectedDomain.id)}
              className={`inline-flex h-9 items-center rounded-md px-3 text-sm font-semibold transition ${
                tool.key === active
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
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

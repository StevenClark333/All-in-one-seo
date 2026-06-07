import Link from "next/link";
import { LogOut, Search } from "lucide-react";
import { switchWorkspaceAction } from "@/app/actions";
import { GlobalSearchShortcut } from "@/components/global-search-shortcut";
import { InfoTooltip } from "@/components/info-tooltip";
import { navItems } from "@/lib/dashboard-data";
import { getWorkspaceSwitcherData } from "@/lib/workspace";

const hrefs: Record<string, (domainId?: string) => string> = {
  Overview: () => "/",
  Clients: () => "/clients",
  Sites: () => "/domains",
  Pages: (domainId) => withDomain("/pages", domainId),
  "Search Performance": (domainId) =>
    withDomain("/search-performance", domainId),
  "Competitive Analysis": (domainId) =>
    withDomain("/competitive-analysis", domainId),
  "Keyword Research": (domainId) => withDomain("/keyword-research", domainId),
  "Rank Tracking": (domainId) => withDomain("/rank-tracking", domainId),
  Issues: (domainId) => withDomain("/issues", domainId),
  "Fix Center": (domainId) => withDomain("/fix-center", domainId),
  AI: (domainId) => withDomain("/recommendations", domainId),
  Technical: (domainId) => withDomain("/technical-audit", domainId),
  Reports: (domainId) => withDomain("/reports", domainId),
  Alerts: () => "/alerts",
  Integrations: (domainId) => withDomain("/integrations", domainId),
  Billing: () => "/billing",
  Settings: () => "/settings",
};

const navHelp: Record<string, string> = {
  Overview:
    "Start here for today's plan, website health, and the next best action.",
  Clients: "Manage clients, their websites, reports, and SEO workload.",
  Sites:
    "Add websites, verify ownership, run scans, and keep each project organized.",
  Pages:
    "Review crawled website pages, titles, descriptions, and page-level problems.",
  "Search Performance":
    "See Google results, clicks, impressions, top pages, and search demand.",
  "Competitive Analysis":
    "Compare your website against competitors and spot content opportunities.",
  "Keyword Research":
    "Find useful keywords, content gaps, and easy opportunities to improve.",
  "Rank Tracking":
    "Track keyword positions for your website and competitors.",
  Issues:
    "See the problems that need attention and the easiest way to solve them.",
  "Fix Center":
    "Approve, export, and track fixes without digging through technical details.",
  AI: "Generate content ideas, SEO recommendations, and fix briefs.",
  Technical:
    "Review internal links, crawlability, schema, and rendering signals.",
  Reports:
    "Create simple reports for clients, teammates, or your own records.",
  Alerts:
    "Get notified when something important changes.",
  Integrations:
    "Connect Google, CMS, hosting, alerts, and automation tools.",
  Billing:
    "Manage plan limits, usage, subscriptions, trials, and billing portal access.",
  Settings:
    "Manage workspace members, roles, invitations, and account settings.",
};

const displayLabels: Record<string, string> = {
  AI: "Content Ideas",
  Issues: "Problems",
  "Fix Center": "Fixes",
  "Keyword Research": "Keywords",
  "Rank Tracking": "Rank Tracker",
  "Search Performance": "Google Results",
  Sites: "Projects",
  Technical: "Internal Links",
};

const seoGroups = [
  {
    items: ["Overview", "Sites", "Issues", "Fix Center", "Reports"],
    label: "Main path",
  },
  {
    items: ["Pages", "Search Performance", "Technical"],
    label: "Website details",
  },
  {
    items: ["Competitive Analysis", "Keyword Research", "Rank Tracking"],
    label: "Grow visibility",
  },
  {
    items: ["AI", "Alerts", "Integrations"],
    label: "Helpful tools",
  },
  {
    items: ["Clients", "Billing", "Settings"],
    label: "Workspace",
  },
];

const primaryRailItems = ["Overview", "Sites", "Issues", "Reports", "Clients"];

export async function AppSidebar({
  active,
  activeDomainId,
}: {
  active: string;
  activeDomainId?: string;
}) {
  const { activeWorkspaceId, memberships } = await getWorkspaceSwitcherData();

  return (
    <aside className="border-b border-slate-200 bg-white lg:border-b-0 lg:border-r">
      <GlobalSearchShortcut />
      <div className="flex min-h-full">
        <nav
          aria-label="Primary product areas"
          className="hidden w-14 shrink-0 border-r border-slate-200 bg-slate-950 px-2 py-4 lg:grid lg:auto-rows-min lg:gap-2"
        >
          {primaryRailItems.map((label) => {
            const item = navItems.find((navItem) => navItem.label === label);

            if (!item) {
              return null;
            }

            const Icon = item.icon;

            return (
              <Link
                key={label}
                aria-label={getDisplayLabel(label)}
                href={hrefs[label]?.(activeDomainId) ?? "/"}
                title={getDisplayLabel(label)}
                className={`inline-flex size-10 items-center justify-center rounded-md transition ${
                  label === active
                    ? "bg-white text-slate-950"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <Icon className="size-4" aria-hidden="true" />
              </Link>
            );
          })}
        </nav>

        <div className="min-w-0 flex-1 px-5 py-5">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white lg:hidden">
              <Search className="size-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
                All In One
              </p>
              <h1 className="text-xl font-semibold tracking-normal">SEO Ops</h1>
            </div>
          </div>

          <form action="/search" className="mt-5">
            <label className="relative block">
              <span className="sr-only">Search domains, clients, pages, issues, reports, and actions</span>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              />
              <input
                id="global-search-input"
                name="q"
                type="search"
                placeholder="Search or run action"
                className="h-10 w-full rounded-md border border-slate-300 bg-white pl-9 pr-16 text-sm outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100"
              />
              <span className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 sm:inline">
                Ctrl K
              </span>
            </label>
          </form>

          <nav
            className="mt-6 grid gap-5 pr-1 lg:mt-7"
            aria-label="Main navigation"
          >
            {seoGroups.map((group) => (
              <div key={group.label}>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">
                  {group.label}
                </p>
                <div className="grid gap-1">
                  {group.items.map((label) => {
                    const item = navItems.find(
                      (navItem) => navItem.label === label,
                    );

                    if (!item) {
                      return null;
                    }

                    const Icon = item.icon;
                    const isActive = item.label === active;

                    return (
                      <Link
                        key={item.label}
                        href={hrefs[item.label]?.(activeDomainId) ?? "/"}
                        className={`flex h-10 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                          isActive
                            ? "bg-slate-950 text-white"
                            : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
                        }`}
                      >
                        <Icon className="size-4" aria-hidden="true" />
                        <span className="min-w-0 flex-1">
                          {getDisplayLabel(item.label)}
                        </span>
                        <InfoTooltip
                          label={
                            navHelp[item.label] ?? "Open this portal section."
                          }
                          passive
                          side="left"
                        />
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>

          {memberships.length > 1 ? (
            <form action={switchWorkspaceAction} className="mt-6">
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              Workspace
              <InfoTooltip label="Switch between agency or business workspaces you belong to." />
            </span>
            <select
              name="workspaceId"
              defaultValue={activeWorkspaceId ?? undefined}
              className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium normal-case tracking-normal text-slate-700"
            >
              {memberships.map((membership) => (
                <option
                  key={membership.workspaceId}
                  value={membership.workspaceId}
                >
                  {membership.workspace.name}
                </option>
              ))}
            </select>
          </label>
          <button className="mt-2 h-9 w-full rounded-md border border-slate-200 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
            Switch
          </button>
            </form>
          ) : null}

          <form action="/api/auth/logout" method="post" className="mt-4">
            <button className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
              <LogOut className="size-4" aria-hidden="true" />
              Log out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}

function withDomain(path: string, domainId?: string) {
  return domainId ? `${path}?domainId=${domainId}` : path;
}

function getDisplayLabel(label: string) {
  return displayLabels[label] ?? label;
}

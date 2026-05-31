import Link from "next/link";
import { ArrowUpRight, LogOut, Search } from "lucide-react";
import { switchWorkspaceAction } from "@/app/actions";
import { InfoTooltip } from "@/components/info-tooltip";
import { navItems } from "@/lib/dashboard-data";
import { getWorkspaceSwitcherData } from "@/lib/workspace";

const hrefs: Record<string, string> = {
  Overview: "/",
  Clients: "/clients",
  Sites: "/domains",
  Pages: "/pages",
  Issues: "/issues",
  AI: "/recommendations",
  Technical: "/technical-audit",
  Reports: "/reports",
  Alerts: "/alerts",
  Integrations: "/integrations",
  Billing: "/billing",
  Settings: "/settings",
  Roadmap: "/production-task-list",
};

const navHelp: Record<string, string> = {
  Overview:
    "Your agency command center: portfolio health, site status, and priority SEO work.",
  Clients: "Manage agency clients, their domains, reports, and SEO workload.",
  Sites:
    "Add domains, verify ownership, run crawls, and manage install scripts.",
  Pages:
    "Inspect crawled URLs, page snapshots, metadata, and page-level SEO issues.",
  Issues:
    "Review analyzer findings, assign work, update statuses, and group template issues.",
  AI: "Generate SEO recommendations, content fixes, and template-level fix briefs.",
  Technical:
    "Monitor technical SEO signals like robots.txt, sitemap, schema, links, and rendering.",
  Reports:
    "Create client-ready reports, scheduled reports, custom templates, and white-label sharing.",
  Alerts:
    "Configure monitoring rules for outages, SEO regressions, and delivery channels.",
  Integrations:
    "Connect Search Console, Analytics, CMS, deployment, alerting, and automation tools.",
  Billing:
    "Manage plan limits, usage, subscriptions, trials, and billing portal access.",
  Settings:
    "Manage workspace members, roles, invitations, and account settings.",
  Roadmap: "The production source-of-truth checklist for what has been built.",
};

export async function AppSidebar({ active }: { active: string }) {
  const { activeWorkspaceId, memberships } = await getWorkspaceSwitcherData();

  return (
    <aside className="border-b border-slate-200 bg-white px-5 py-5 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg bg-slate-950 text-white">
          <Search className="size-5" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">
            All In One
          </p>
          <h1 className="text-xl font-semibold tracking-normal">SEO Ops</h1>
        </div>
      </div>

      <nav
        className="mt-6 grid gap-1 pr-1 lg:mt-8"
        aria-label="Main navigation"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === active;

          return (
            <Link
              key={item.label}
              href={hrefs[item.label] ?? "/"}
              className={`flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition ${
                isActive
                  ? "bg-slate-950 text-white"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
              <span className="min-w-0 flex-1">{item.label}</span>
              <InfoTooltip
                label={navHelp[item.label] ?? "Open this portal section."}
                passive
                side="left"
              />
            </Link>
          );
        })}
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

      <div className="mt-8 border-t border-slate-200 pt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            Source of truth
            <InfoTooltip label="Planning and implementation documents used to keep the product roadmap honest." />
          </span>
        </p>
        <Link
          href="/product-requirements"
          className="mt-3 flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-3 py-3 text-sm font-medium text-slate-700"
        >
          PRD and roadmap
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
        <Link
          href="/production-task-list"
          className="mt-2 flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700"
        >
          Production tasks
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <form action="/api/auth/logout" method="post" className="mt-4">
        <button className="flex h-10 w-full items-center gap-3 rounded-md px-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950">
          <LogOut className="size-4" aria-hidden="true" />
          Log out
        </button>
      </form>
    </aside>
  );
}

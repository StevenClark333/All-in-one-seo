import {
  ShieldCheck,
  Trash2,
  UserPlus,
  UsersRound,
  XCircle,
} from "lucide-react";
import type { WorkspaceRole } from "@prisma/client";
import {
  inviteWorkspaceMemberAction,
  removeWorkspaceMemberAction,
  revokeWorkspaceInvitationAction,
  updateWorkspaceMemberRoleAction,
} from "@/app/actions";
import { AppSidebar } from "@/components/app-sidebar";
import { HelpLabel } from "@/components/info-tooltip";
import { getTeamSettingsData } from "@/lib/team";

export const dynamic = "force-dynamic";

const roleOptions = ["ADMIN", "MEMBER", "VIEWER"] as const;

const roleProfiles: Record<
  WorkspaceRole,
  {
    description: string;
    permissions: string[];
    title: string;
  }
> = {
  OWNER: {
    title: "Product Owner",
    description:
      "Primary owner for the All In One SEO workspace and final account authority.",
    permissions: [
      "Full workspace, billing, team, client, domain, crawl, issue, report, alert, and integration access",
      "Can manage admins, operators, and viewers",
      "Cannot be removed or downgraded from Settings",
    ],
  },
  ADMIN: {
    title: "Agency Admin",
    description:
      "Senior agency operator who can manage team access and production SEO workflows.",
    permissions: [
      "Can invite teammates and change non-owner roles",
      "Can manage clients, domains, crawls, issues, reports, alerts, and integrations",
      "Cannot remove or change the Product Owner",
    ],
  },
  MEMBER: {
    title: "SEO Operator",
    description:
      "SEO specialist focused on execution, fixes, audits, and recommendations.",
    permissions: [
      "Can run SEO workflows such as crawls, issue updates, and recommendations",
      "Can review operational dashboards and reports",
      "Cannot manage billing, team seats, or workspace-level access",
    ],
  },
  VIEWER: {
    title: "Client Viewer",
    description:
      "Read-only stakeholder for client review, reporting, and monitoring visibility.",
    permissions: [
      "Can view dashboards, reports, issues, and site health",
      "Useful for clients or executives who need visibility",
      "Cannot create, edit, delete, invite, crawl, or change workflow state",
    ],
  },
};

export default async function SettingsPage() {
  const { invitations, members, plan, seatUsage, workspace } =
    await getTeamSettingsData();
  const seatsRemaining = Math.max(0, seatUsage.limit - seatUsage.totalUsed);

  return (
    <main className="min-h-screen bg-[#f6f8fb] text-slate-950">
      <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <AppSidebar active="Settings" />

        <section className="px-5 py-6 sm:px-8 lg:px-10">
          <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {workspace?.name ?? "Workspace"}
              </p>
              <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                Settings
              </h2>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm">
              <p className="font-semibold text-slate-900">
                {seatUsage.totalUsed} / {seatUsage.limit} seats used
              </p>
              <p className="mt-1 text-slate-500">
                {seatUsage.used} active, {seatUsage.pendingInvitations} pending
                on {plan?.name ?? "current plan"}
              </p>
            </div>
          </header>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
              <div className="flex items-start gap-3 border-b border-slate-200 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <UsersRound className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Team members</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Manage production roles and remove access for teammates who
                    no longer need this dashboard.
                  </p>
                </div>
              </div>

              <div className="grid divide-y divide-slate-100">
                {members.map((member) => (
                  <article
                    key={member.id}
                    className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px_120px]"
                  >
                    <div>
                      <p className="font-semibold">
                        {member.user.name ?? member.user.email}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {member.user.email}
                      </p>
                    </div>

                    {member.role === "OWNER" ? (
                      <div className="inline-flex h-10 items-center gap-2 text-sm font-medium text-slate-600">
                        <ShieldCheck className="size-4" aria-hidden="true" />
                        {formatRole(member.role)}
                      </div>
                    ) : (
                      <form
                        action={updateWorkspaceMemberRoleAction}
                        className="flex gap-2"
                      >
                        <input
                          type="hidden"
                          name="memberId"
                          value={member.id}
                        />
                        <select
                          name="role"
                          defaultValue={member.role}
                          className="h-10 min-w-0 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm"
                        >
                          {roleOptions.map((role) => (
                            <option key={role} value={role}>
                              {formatRole(role)}
                            </option>
                          ))}
                        </select>
                        <button className="h-10 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                          Save
                        </button>
                      </form>
                    )}

                    {member.role === "OWNER" ? (
                      <span className="h-10" />
                    ) : (
                      <form action={removeWorkspaceMemberAction}>
                        <input
                          type="hidden"
                          name="memberId"
                          value={member.id}
                        />
                        <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md border border-red-200 px-3 text-sm font-medium text-red-700 transition hover:bg-red-50">
                          <Trash2 className="size-4" aria-hidden="true" />
                          Remove
                        </button>
                      </form>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <aside className="grid gap-6">
              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h3 className="text-lg font-semibold">
                    <HelpLabel help="Use these production role names when creating accounts or inviting teammates.">
                      Role permissions
                    </HelpLabel>
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Clear role names for owners, agency teammates, operators,
                    and client-facing viewers.
                  </p>
                </div>

                <div className="grid divide-y divide-slate-100">
                  {Object.entries(roleProfiles).map(([role, profile]) => (
                    <article key={role} className="p-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold">{profile.title}</p>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-500">
                          {role}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {profile.description}
                      </p>
                      <ul className="mt-3 grid gap-2 text-sm text-slate-600">
                        {profile.permissions.map((permission) => (
                          <li key={permission} className="flex gap-2">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-slate-400" />
                            <span>{permission}</span>
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <UserPlus className="size-5" aria-hidden="true" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">Invite teammate</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {seatsRemaining} seat
                        {seatsRemaining === 1 ? "" : "s"} remaining.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  action={inviteWorkspaceMemberAction}
                  className="grid gap-4 p-5"
                >
                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Email
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="teammate@example.com"
                      className="h-10 rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-950"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Role
                    <select
                      name="role"
                      defaultValue="MEMBER"
                      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-normal text-slate-950"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {formatRole(role)}
                        </option>
                      ))}
                    </select>
                  </label>

                  <button className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-950 px-4 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800">
                    <UserPlus className="size-4" aria-hidden="true" />
                    Send invite
                  </button>
                </form>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 p-5">
                  <h3 className="text-lg font-semibold">Pending invitations</h3>
                </div>

                <div className="grid divide-y divide-slate-100">
                  {invitations.length ? (
                    invitations.map((invitation) => (
                      <article key={invitation.id} className="grid gap-3 p-5">
                        <div>
                          <p className="font-semibold">{invitation.email}</p>
                          <p className="mt-1 text-sm text-slate-500">
                            {formatRole(invitation.role)} - expires{" "}
                            {formatDate(invitation.expiresAt)}
                          </p>
                        </div>
                        <form action={revokeWorkspaceInvitationAction}>
                          <input
                            type="hidden"
                            name="invitationId"
                            value={invitation.id}
                          />
                          <button className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50">
                            <XCircle className="size-4" aria-hidden="true" />
                            Revoke
                          </button>
                        </form>
                      </article>
                    ))
                  ) : (
                    <div className="p-5 text-sm text-slate-500">
                      No pending invitations.
                    </div>
                  )}
                </div>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatRole(role: string) {
  return roleProfiles[role as WorkspaceRole]?.title ?? role;
}

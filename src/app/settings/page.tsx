import {
  CheckCircle2,
  MailCheck,
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
      "Primary owner for the workspace, plan, team, and account decisions.",
    permissions: [
      "Full access to plan, team, clients, websites, checks, problems, updates, alerts, and connections",
      "Can manage admins, teammates, and viewers",
      "Cannot be removed or downgraded from Settings",
    ],
  },
  ADMIN: {
    title: "Agency Admin",
    description:
      "Trusted teammate who can manage access and everyday SEO work.",
    permissions: [
      "Can invite teammates and change non-owner roles",
      "Can manage clients, websites, checks, problems, updates, alerts, and connections",
      "Cannot remove or change the Product Owner",
    ],
  },
  MEMBER: {
    title: "SEO Teammate",
    description:
      "Teammate who works on fixes, website checks, problems, and ideas.",
    permissions: [
      "Can run website checks, update problems, and create ideas",
      "Can review dashboards and client updates",
      "Cannot manage billing, team seats, or workspace-level access",
    ],
  },
  VIEWER: {
    title: "Client Viewer",
    description:
      "Read-only teammate or client who can review work and updates.",
    permissions: [
      "Can view dashboards, client updates, problems, and website health",
      "Useful for clients or leaders who only need visibility",
      "Can view work, but cannot change clients, websites, checks, invites, or progress",
    ],
  },
};

export default async function SettingsPage() {
  const { invitations, members, plan, seatUsage, workspace } =
    await getTeamSettingsData();
  const seatsRemaining = Math.max(0, seatUsage.limit - seatUsage.totalUsed);
  const adminCount = members.filter(
    (member) => member.role === "OWNER" || member.role === "ADMIN",
  ).length;

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
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                Keep access simple: invite the right people, choose the safest
                role, and review pending invites without digging through account
                settings.
              </p>
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

          <SettingsComfortPlan
            adminCount={adminCount}
            pendingInvitations={seatUsage.pendingInvitations}
            seatsRemaining={seatsRemaining}
            totalSeats={seatUsage.limit}
            usedSeats={seatUsage.totalUsed}
          />

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
            <section
              id="team-members"
              className="rounded-lg border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex items-start gap-3 border-b border-slate-200 p-5">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <UsersRound className="size-5" aria-hidden="true" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Team members</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Review who can enter the workspace and keep every teammate
                    on the lightest role that works.
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
                      <p className="mt-2 text-sm leading-6 text-slate-500">
                        {roleProfiles[member.role].description}
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
                          Save role
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
                          Remove access
                        </button>
                      </form>
                    )}
                  </article>
                ))}
              </div>
            </section>

            <aside className="grid gap-6">
              <section
                id="invite-teammate"
                className="rounded-lg border border-slate-200 bg-white shadow-sm"
              >
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
                    Teammate email
                    <input
                      name="email"
                      type="email"
                      required
                      placeholder="teammate@example.com"
                      className="h-10 rounded-md border border-slate-200 px-3 text-sm font-normal text-slate-950"
                    />
                  </label>

                  <label className="grid gap-2 text-sm font-medium text-slate-700">
                    Safe starting role
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

              <section
                id="pending-invites"
                className="rounded-lg border border-slate-200 bg-white shadow-sm"
              >
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
                    <EmptyState
                      title="No pending invitations"
                      body="Everyone invited has either joined or there are no open invites right now."
                    />
                  )}
                </div>
              </section>

              <section className="rounded-lg border border-slate-200 bg-white shadow-sm">
                <details>
                  <summary className="p-5">
                    <h3 className="text-lg font-semibold">
                      <HelpLabel help="Use this guide when choosing the safest access level for a teammate or client.">
                        Role guide
                      </HelpLabel>
                    </h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Open this when you are unsure which role is safest.
                    </p>
                  </summary>

                  <div className="grid divide-y divide-slate-100 border-t border-slate-200">
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
                </details>
              </section>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}

function SettingsComfortPlan({
  adminCount,
  pendingInvitations,
  seatsRemaining,
  totalSeats,
  usedSeats,
}: {
  adminCount: number;
  pendingInvitations: number;
  seatsRemaining: number;
  totalSeats: number;
  usedSeats: number;
}) {
  return (
    <section className="mt-6 rounded-lg border border-orange-100 bg-orange-50/60 p-5 shadow-sm">
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
        <div>
          <p className="text-sm font-semibold text-orange-700">
            Workspace comfort plan
          </p>
          <h3 className="mt-2 text-2xl font-semibold tracking-normal text-slate-950">
            Keep access calm and easy to understand.
          </h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Start by checking seats, then invite teammates with the lightest
            role they need. Open the role guide only when you want detail.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <PlanTile
            icon={<UsersRound className="size-4" aria-hidden="true" />}
            label="Seats"
            value={`${usedSeats} of ${totalSeats} used`}
            detail={
              seatsRemaining
                ? `${seatsRemaining} available for new teammates.`
                : "No open seats on this plan."
            }
            href="#invite-teammate"
          />
          <PlanTile
            icon={<ShieldCheck className="size-4" aria-hidden="true" />}
            label="Admins"
            value={`${adminCount} trusted admins`}
            detail="Admins can manage access, so keep this group small."
            href="#team-members"
          />
          <PlanTile
            icon={
              pendingInvitations > 0 ? (
                <MailCheck className="size-4" aria-hidden="true" />
              ) : (
                <CheckCircle2 className="size-4" aria-hidden="true" />
              )
            }
            label="Invites"
            value={
              pendingInvitations
                ? `${pendingInvitations} pending`
                : "No pending invites"
            }
            detail="Revoke old invitations if someone no longer needs access."
            href="#pending-invites"
          />
        </div>
      </div>
    </section>
  );
}

function PlanTile({
  detail,
  href,
  icon,
  label,
  value,
}: {
  detail: string;
  href: string;
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <a
      href={href}
      className="block rounded-lg border border-orange-100 bg-white p-4 shadow-sm transition hover:border-orange-200 hover:bg-white"
    >
      <span className="inline-flex size-8 items-center justify-center rounded-md bg-orange-50 text-orange-700">
        {icon}
      </span>
      <p className="mt-3 text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold leading-6 text-slate-950">
        {value}
      </p>
      <p className="mt-2 text-sm leading-5 text-slate-500">{detail}</p>
    </a>
  );
}

function EmptyState({ body, title }: { body: string; title: string }) {
  return (
    <div className="p-5 text-sm text-slate-500">
      <p className="font-semibold text-slate-900">{title}</p>
      <p className="mt-1 leading-6">{body}</p>
    </div>
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

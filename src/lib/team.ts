import { createHash, randomBytes } from "crypto";
import { WorkspaceRole } from "@prisma/client";
import { requireWorkspaceRole } from "@/lib/authorization";
import { assertCanAddTeamSeat, getWorkspacePlanLimits } from "@/lib/billing";
import { addDays } from "@/lib/date-utils";
import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { writeAuditLog } from "@/lib/auth";

const invitationDays = 14;
const inviteableRoles = ["ADMIN", "MEMBER", "VIEWER"] as const;

export async function getTeamSettingsData() {
  if (!hasDatabaseUrl()) {
    return {
      invitations: [],
      members: [],
      plan: null,
      seatUsage: { limit: 0, pendingInvitations: 0, totalUsed: 0, used: 0 },
      workspace: null,
    };
  }

  const { workspace } = await requireWorkspaceRole("VIEWER");

  await expireStaleInvitations(workspace.id);

  const [members, invitations, plan, pendingInvitations] = await Promise.all([
    getPrisma().workspaceMember.findMany({
      where: { workspaceId: workspace.id },
      include: { user: true },
      orderBy: [{ role: "asc" }, { createdAt: "asc" }],
    }),
    getPrisma().workspaceInvitation.findMany({
      where: { workspaceId: workspace.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    }),
    getWorkspacePlanLimits(workspace.id),
    getPrisma().workspaceInvitation.count({
      where: { workspaceId: workspace.id, status: "PENDING" },
    }),
  ]);

  return {
    invitations,
    members,
    plan,
    seatUsage: {
      limit: plan.teamSeatLimit,
      pendingInvitations,
      totalUsed: members.length + pendingInvitations,
      used: members.length,
    },
    workspace,
  };
}

export async function inviteWorkspaceMember({
  email,
  role,
}: {
  email: string;
  role: WorkspaceRole;
}) {
  const { user, workspace } = await requireWorkspaceRole("ADMIN");
  const normalizedEmail = normalizeInvitationEmail(email);
  const inviteRole = normalizeInviteRole(role);

  await expireStaleInvitations(workspace.id);

  const existingMember = await getPrisma().workspaceMember.findFirst({
    where: { workspaceId: workspace.id, user: { email: normalizedEmail } },
  });

  if (existingMember) {
    throw new Error("That person is already a workspace member.");
  }

  const existingInvitation = await getPrisma().workspaceInvitation.findFirst({
    where: {
      email: normalizedEmail,
      status: "PENDING",
      workspaceId: workspace.id,
    },
  });

  if (existingInvitation) {
    const invitation = await getPrisma().workspaceInvitation.update({
      where: { id: existingInvitation.id },
      data: {
        expiresAt: addDays(new Date(), invitationDays),
        invitedById: user.id,
        role: inviteRole,
        tokenHash: createInvitationTokenHash(),
      },
    });

    await writeAuditLog({
      action: "team.invitation_refreshed",
      entityId: invitation.id,
      entityType: "workspace_invitation",
      metadataJson: { email: normalizedEmail, role: inviteRole },
      userId: user.id,
      workspaceId: workspace.id,
    });

    return invitation;
  }

  await assertCanAddTeamSeat(workspace.id);

  const invitation = await getPrisma().workspaceInvitation.create({
    data: {
      email: normalizedEmail,
      expiresAt: addDays(new Date(), invitationDays),
      invitedById: user.id,
      role: inviteRole,
      tokenHash: createInvitationTokenHash(),
      workspaceId: workspace.id,
    },
  });

  await writeAuditLog({
    action: "team.invitation_created",
    entityId: invitation.id,
    entityType: "workspace_invitation",
    metadataJson: { email: normalizedEmail, role: inviteRole },
    userId: user.id,
    workspaceId: workspace.id,
  });

  return invitation;
}

export async function updateWorkspaceMemberRole({
  memberId,
  role,
}: {
  memberId: string;
  role: WorkspaceRole;
}) {
  const { user, workspace } = await requireWorkspaceRole("ADMIN");
  const nextRole = normalizeInviteRole(role);
  const member = await getPrisma().workspaceMember.findFirst({
    where: { id: memberId, workspaceId: workspace.id },
  });

  if (!member) {
    throw new Error("Workspace member not found.");
  }

  if (member.role === "OWNER") {
    throw new Error("The workspace owner role cannot be changed here.");
  }

  const updated = await getPrisma().workspaceMember.update({
    where: { id: member.id },
    data: { role: nextRole },
  });

  await writeAuditLog({
    action: "team.member_role_updated",
    entityId: member.id,
    entityType: "workspace_member",
    metadataJson: { role: nextRole },
    userId: user.id,
    workspaceId: workspace.id,
  });

  return updated;
}

export async function removeWorkspaceMember(memberId: string) {
  const { membership, user, workspace } = await requireWorkspaceRole("ADMIN");
  const member = await getPrisma().workspaceMember.findFirst({
    where: { id: memberId, workspaceId: workspace.id },
  });

  if (!member) {
    throw new Error("Workspace member not found.");
  }

  if (member.role === "OWNER") {
    throw new Error("The workspace owner cannot be removed.");
  }

  if (member.id === membership.id) {
    throw new Error("You cannot remove your own membership.");
  }

  await getPrisma().workspaceMember.delete({ where: { id: member.id } });

  await writeAuditLog({
    action: "team.member_removed",
    entityId: member.id,
    entityType: "workspace_member",
    userId: user.id,
    workspaceId: workspace.id,
  });
}

export async function revokeWorkspaceInvitation(invitationId: string) {
  const { user, workspace } = await requireWorkspaceRole("ADMIN");
  const invitation = await getPrisma().workspaceInvitation.findFirst({
    where: { id: invitationId, workspaceId: workspace.id, status: "PENDING" },
  });

  if (!invitation) {
    throw new Error("Pending invitation not found.");
  }

  const revoked = await getPrisma().workspaceInvitation.update({
    where: { id: invitation.id },
    data: { revokedAt: new Date(), status: "REVOKED" },
  });

  await writeAuditLog({
    action: "team.invitation_revoked",
    entityId: invitation.id,
    entityType: "workspace_invitation",
    metadataJson: { email: invitation.email },
    userId: user.id,
    workspaceId: workspace.id,
  });

  return revoked;
}

export function normalizeInvitationEmail(email: string) {
  const normalized = email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Enter a valid teammate email address.");
  }

  return normalized;
}

export function normalizeInviteRole(role: WorkspaceRole) {
  if (!inviteableRoles.includes(role as (typeof inviteableRoles)[number])) {
    throw new Error("Invited teammates must be admin, member, or viewer.");
  }

  return role;
}

async function expireStaleInvitations(workspaceId: string) {
  await getPrisma().workspaceInvitation.updateMany({
    where: {
      expiresAt: { lt: new Date() },
      status: "PENDING",
      workspaceId,
    },
    data: { status: "EXPIRED" },
  });
}

function createInvitationTokenHash() {
  return createHash("sha256")
    .update(randomBytes(32).toString("base64url"))
    .digest("hex");
}

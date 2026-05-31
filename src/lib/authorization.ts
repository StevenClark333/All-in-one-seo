import { WorkspaceRole } from "@prisma/client";
import { requireCurrentUser } from "@/lib/auth";

const roleRank: Record<WorkspaceRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

export async function requireWorkspaceRole(minimumRole: WorkspaceRole) {
  const user = await requireCurrentUser();
  const membership = user.workspaceMembers.at(0);

  if (!membership || !hasWorkspaceRole(membership.role, minimumRole)) {
    throw new Error("You do not have permission to perform this action.");
  }

  return { user, workspace: membership.workspace, membership };
}

export function hasWorkspaceRole(
  actualRole: WorkspaceRole,
  minimumRole: WorkspaceRole,
) {
  return roleRank[actualRole] >= roleRank[minimumRole];
}

export function canManageWorkspace(role: WorkspaceRole) {
  return hasWorkspaceRole(role, "ADMIN");
}

export function canEditSeoWorkflows(role: WorkspaceRole) {
  return hasWorkspaceRole(role, "MEMBER");
}

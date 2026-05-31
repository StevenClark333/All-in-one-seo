import { getPrisma, hasDatabaseUrl } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cookies } from "next/headers";

export const selectedWorkspaceCookieName = "all_in_one_selected_workspace";

export async function getPrimaryWorkspace() {
  if (!hasDatabaseUrl()) {
    return null;
  }

  const user = await getCurrentUser();
  const selectedWorkspaceId = await getSelectedWorkspaceId();
  const membership =
    user?.workspaceMembers.find(
      (item) => item.workspaceId === selectedWorkspaceId,
    ) ?? user?.workspaceMembers.at(0);

  if (membership) {
    return membership.workspace;
  }

  return getPrisma().workspace.findFirst({
    orderBy: { createdAt: "asc" },
  });
}

export async function getWorkspaceSwitcherData() {
  if (!hasDatabaseUrl()) {
    return { activeWorkspaceId: null, memberships: [] };
  }

  const user = await getCurrentUser();
  const activeWorkspace = await getPrimaryWorkspace();

  return {
    activeWorkspaceId: activeWorkspace?.id ?? null,
    memberships: user?.workspaceMembers ?? [],
  };
}

export function getWorkspacePlanForType(type: string) {
  return type === "AGENCY" ? "agency" : "starter";
}

async function getSelectedWorkspaceId() {
  const cookieStore = await cookies();
  return cookieStore.get(selectedWorkspaceCookieName)?.value ?? null;
}

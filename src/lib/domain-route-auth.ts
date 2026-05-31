import { getCurrentUser } from "@/lib/auth";
import { getPrisma } from "@/lib/prisma";

export async function getAuthorizedDomain(domainId: string) {
  const user = await getCurrentUser();

  if (!user) {
    return { domain: null, reason: "unauthenticated" as const };
  }

  const domain = await getPrisma().domain.findUnique({
    where: { id: domainId },
    select: { id: true, workspaceId: true },
  });

  if (!domain) {
    return { domain: null, reason: "not-found" as const };
  }

  const hasWorkspaceAccess = user.workspaceMembers.some(
    (membership) => membership.workspaceId === domain.workspaceId,
  );

  if (!hasWorkspaceAccess) {
    return { domain: null, reason: "forbidden" as const };
  }

  return { domain, reason: null };
}

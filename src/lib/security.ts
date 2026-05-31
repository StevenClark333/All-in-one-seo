export function buildWorkspaceIsolationWhere<TWhere extends object>(
  workspaceId: string,
  where?: TWhere,
) {
  return {
    ...where,
    workspaceId,
  };
}

export function buildPublicReportAccessWhere(shareToken: string) {
  return {
    shareToken,
    status: "PUBLISHED" as const,
  };
}

export function isTrustedRequestOrigin({
  origin,
  requestUrl,
}: {
  origin: string | null;
  requestUrl: string;
}) {
  if (!origin) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    const url = new URL(requestUrl);

    return originUrl.protocol === url.protocol && originUrl.host === url.host;
  } catch {
    return false;
  }
}

export function isMutatingMethod(method: string) {
  return ["DELETE", "PATCH", "POST", "PUT"].includes(method.toUpperCase());
}

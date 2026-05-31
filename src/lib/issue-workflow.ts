import type { IssueStatus } from "@prisma/client";

export function buildIssueStatusUpdate(status: IssueStatus) {
  return {
    status,
    resolvedAt: status === "FIXED" ? new Date() : null,
  };
}

export function buildBulkIssueStatusUpdate(status: IssueStatus) {
  return buildIssueStatusUpdate(status);
}

export function buildDetectedIssueStatus(existingStatus?: IssueStatus | null) {
  if (existingStatus === "FIXED") {
    return "REAPPEARED" as const;
  }

  return existingStatus ?? ("OPEN" as const);
}

export function normalizeIssueAssignment(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) {
    return null;
  }

  return value.trim();
}

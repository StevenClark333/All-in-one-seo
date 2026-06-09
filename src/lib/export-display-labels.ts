export function formatExportClient(value: string | null | undefined) {
  return value?.trim() ? value : "No client yet";
}

export function formatExportOwner(value: string | null | undefined) {
  return value?.trim() ? value : "No owner yet";
}

export function formatExportImportance(value: string | null | undefined) {
  if (value === "CRITICAL") {
    return "Urgent";
  }

  if (value === "WARNING") {
    return "Planned";
  }

  return "Idea";
}

export function formatExportPriority(value: number | null | undefined) {
  const score = value ?? 0;

  if (score >= 80) {
    return "Start here";
  }

  if (score >= 50) {
    return "Do next";
  }

  return "Save for later";
}

export function formatExportProblemArea(value: string | null | undefined) {
  if (!value?.trim()) {
    return "Website check";
  }

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatExportProgress(value: string | null | undefined) {
  const labels: Record<string, string> = {
    FIXED: "Fixed",
    IGNORED: "Set aside",
    IN_PROGRESS: "Being fixed",
    OPEN: "Ready to review",
    REAPPEARED: "Needs another look",
  };

  return labels[value ?? ""] ?? "Ready to review";
}

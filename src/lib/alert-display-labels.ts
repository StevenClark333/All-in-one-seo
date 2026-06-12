export function formatAlertDeliveryStatus(value: string) {
  const labels: Record<string, string> = {
    FAILED: "Needs a check",
    PENDING: "Waiting to send",
    SENT: "Sent",
  };

  return labels[value] ?? formatEnum(value);
}

export function formatAlertImportance(value: string) {
  const labels: Record<string, string> = {
    CRITICAL: "Needs quick care",
    SUGGESTION: "Idea",
    WARNING: "Planned",
  };

  return labels[value] ?? formatEnum(value);
}

export function formatAlertWatchedChange(value: string) {
  const labels: Record<string, string> = {
    ANY_CRITICAL_CHANGE: "Any important change",
    CANONICAL_CHANGED: "Preferred page changed",
    META_DESCRIPTION_CHANGED: "Description changed",
    ROBOTS_CHANGED: "Search access changed",
    STATUS_CODE_CHANGED: "Page availability changed",
    TITLE_CHANGED: "Title changed",
  };

  return labels[value] ?? formatEnum(value);
}

function formatEnum(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

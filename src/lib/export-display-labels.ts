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

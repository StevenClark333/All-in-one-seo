export function formatExportClient(value: string | null | undefined) {
  return value?.trim() ? value : "No client yet";
}

export function formatExportOwner(value: string | null | undefined) {
  return value?.trim() ? value : "No owner yet";
}

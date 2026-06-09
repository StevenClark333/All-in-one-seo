export function formatOverviewOwner(value: string | null | undefined) {
  return value?.trim() ? value : "No owner yet";
}

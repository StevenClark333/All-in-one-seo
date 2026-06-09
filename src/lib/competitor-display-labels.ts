import { formatSearchPosition } from "@/lib/search-display-labels";

export function formatCompetitorHealth(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "No score yet";
  }

  return value.toString();
}

export function formatCompetitorOwner(value: string | null | undefined) {
  return value?.trim() ? value : "No client yet";
}

export function formatCompetitorRankNote(value: string | null | undefined) {
  return value?.trim() ? value : "Waiting for rankings";
}

export function formatCompetitorPosition(value: number | null | undefined) {
  return formatSearchPosition(value);
}

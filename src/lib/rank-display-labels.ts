import { formatSearchPosition } from "@/lib/search-display-labels";

export function formatRankClient(value: string | null | undefined) {
  return value?.trim() ? value : "No client yet";
}

export function formatRankDifficulty(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "No difficulty yet";
  }

  return value.toString();
}

export function formatRankPosition(value: number | null | undefined) {
  return formatSearchPosition(value);
}

export function formatRankVolume(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "No volume yet";
  }

  return value.toLocaleString();
}

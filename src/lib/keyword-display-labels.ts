export function formatKeywordIntent(value: string) {
  const labels: Record<string, string> = {
    brand: "Brand/site lookup",
    commercial: "Buying research",
    comparison: "Comparing options",
    informational: "Learning search",
    local: "Nearby search",
    navigational: "Brand/site lookup",
    transactional: "Ready to buy",
  };

  return labels[value.toLowerCase()] ?? formatEnumLabel(value);
}

export function formatKeywordPosition(value: number | null | undefined) {
  if (typeof value !== "number" || value <= 0) {
    return "Not ranking yet";
  }

  return value.toString();
}

export function formatKeywordPositionInline(value: number | null | undefined) {
  if (typeof value !== "number" || value <= 0) {
    return "Not ranking yet";
  }

  return `Position ${value}`;
}

function formatEnumLabel(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

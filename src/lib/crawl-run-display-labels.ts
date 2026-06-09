export function formatCrawlRunResponse(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "Not checked yet";
  }

  if (value >= 200 && value < 300) {
    return `Good (${value})`;
  }

  if (value >= 300 && value < 400) {
    return `Redirects (${value})`;
  }

  if (value >= 400) {
    return `Needs review (${value})`;
  }

  return value.toString();
}

export function formatCrawlRunChangeValue(value: string | null | undefined) {
  return value?.trim() ? value : "Not found yet";
}

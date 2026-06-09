export function formatPageCheckDate(value: Date | null | undefined) {
  return value ? value.toLocaleDateString() : "Not checked yet";
}

export function formatPageClient(value: string | null | undefined) {
  return value?.trim() ? value : "No client yet";
}

export function formatPageMetaText(value: string | null | undefined) {
  return value?.trim() ? value : "Not found yet";
}

export function formatPageResponse(value: number | null | undefined) {
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

export function formatPageWordCount(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "Not counted yet";
  }

  return `${value.toLocaleString()} words`;
}

export function formatWebsiteClient(value: string | null | undefined) {
  return value?.trim() ? value : "No client yet";
}

export function formatWebsiteHealth(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "No score yet";
  }

  return `${value}%`;
}

export function formatWebsitePercent(value: number | null | undefined) {
  if (typeof value !== "number") {
    return "Not checked yet";
  }

  return `${value}%`;
}

export function formatWebsiteResponse(value: number | null | undefined) {
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

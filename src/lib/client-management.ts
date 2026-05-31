import { CrawlFrequency } from "@prisma/client";

export function parseClientTags(value: string | null | undefined) {
  return (value ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function serializeClientTags(tags: string[]) {
  return tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .join(", ");
}

export function parseBulkClientRows(value: string) {
  return value
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [name = "", contactEmail = "", tags = ""] = row
        .split(",")
        .map((item) => item.trim());

      return {
        contactEmail: contactEmail || undefined,
        name,
        tags: tags || undefined,
      };
    })
    .filter((row) => row.name);
}

export function normalizeClientCrawlFrequency(value: string) {
  const frequency = value.toUpperCase();

  if (!["MANUAL", "WEEKLY", "DAILY", "CUSTOM"].includes(frequency)) {
    return "WEEKLY" as CrawlFrequency;
  }

  return frequency as CrawlFrequency;
}

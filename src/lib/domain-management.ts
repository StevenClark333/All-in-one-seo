import { CrawlFrequency, DomainPlatform } from "@prisma/client";

const domainPlatforms = new Set<DomainPlatform>([
  "WORDPRESS",
  "SHOPIFY",
  "WEBFLOW",
  "WIX",
  "SQUARESPACE",
  "CUSTOM",
  "UNKNOWN",
]);

const crawlFrequencies = new Set<CrawlFrequency>([
  "MANUAL",
  "WEEKLY",
  "DAILY",
  "CUSTOM",
]);

export function normalizeDomain(value: string) {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .split("/")[0]
    .split("?")[0]
    .toLowerCase();
}

export function normalizeDomainPlatform(value: string | null | undefined) {
  const platform = (value ?? "UNKNOWN").toUpperCase() as DomainPlatform;

  if (!domainPlatforms.has(platform)) {
    return "UNKNOWN" as DomainPlatform;
  }

  return platform;
}

export function normalizeDomainCrawlFrequency(
  value: string | null | undefined,
) {
  const frequency = (value ?? "WEEKLY").toUpperCase() as CrawlFrequency;

  if (!crawlFrequencies.has(frequency)) {
    return "WEEKLY" as CrawlFrequency;
  }

  return frequency;
}

export function parseBulkDomainRows(value: string) {
  return value
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row) => {
      const [
        rawDomain = "",
        rawClientName = "",
        rawPlatform = "",
        rawCrawlFrequency = "",
      ] = row.split(",").map((item) => item.trim());

      return {
        clientName: rawClientName || undefined,
        crawlFrequency: normalizeDomainCrawlFrequency(rawCrawlFrequency),
        domain: normalizeDomain(rawDomain),
        platform: normalizeDomainPlatform(rawPlatform),
      };
    })
    .filter((row) => row.domain);
}

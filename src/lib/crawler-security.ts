import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const allowedProtocols = new Set(["http:", "https:"]);

export async function assertCrawlUrlIsSafe(input: string) {
  const url = new URL(input);

  if (!allowedProtocols.has(url.protocol)) {
    throw new Error("Crawler only supports HTTP and HTTPS URLs.");
  }

  if (url.username || url.password) {
    throw new Error("Crawler URLs must not include credentials.");
  }

  const addresses = isIP(url.hostname)
    ? [{ address: url.hostname }]
    : await lookup(url.hostname, { all: true, verbatim: true });

  if (!addresses.length) {
    throw new Error("Crawler URL did not resolve to an IP address.");
  }

  for (const entry of addresses) {
    if (isPrivateAddress(entry.address)) {
      throw new Error("Crawler blocked a private or internal network address.");
    }
  }
}

export async function safeCrawlerFetch(input: string, init?: RequestInit) {
  await assertCrawlUrlIsSafe(input);

  const response = await fetch(input, init);
  const finalUrl = response.url || input;

  await assertCrawlUrlIsSafe(finalUrl);

  return response;
}

export function isPrivateAddress(address: string) {
  if (address === "::1" || address.toLowerCase() === "localhost") {
    return true;
  }

  if (
    address.startsWith("fc") ||
    address.startsWith("fd") ||
    address.startsWith("fe80:")
  ) {
    return true;
  }

  const parts = address.split(".").map(Number);

  if (parts.length !== 4 || parts.some((part) => Number.isNaN(part))) {
    return false;
  }

  const [first, second] = parts;

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
}

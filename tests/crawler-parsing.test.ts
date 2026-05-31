import assert from "node:assert/strict";
import test from "node:test";
import {
  extractSitemapUrls,
  isPathAllowedByRobots,
  normalizeDiscoveredUrl,
  parseRobotsTxt,
} from "@/lib/crawler";

test("parses robots.txt sitemap and disallow rules for wildcard agent", () => {
  const parsed = parseRobotsTxt(`
    User-agent: *
    Disallow: /private
    Sitemap: https://example.com/sitemap.xml
  `);

  assert.deepEqual(parsed.disallowRules, ["/private"]);
  assert.deepEqual(parsed.sitemapUrls, ["https://example.com/sitemap.xml"]);
});

test("checks robots path allowance", () => {
  assert.equal(isPathAllowedByRobots("/private/page", ["/private"]), false);
  assert.equal(isPathAllowedByRobots("/public/page", ["/private"]), true);
});

test("extracts sitemap URLs from XML", () => {
  const urls = extractSitemapUrls(`
    <urlset>
      <url><loc>https://example.com/</loc></url>
      <url><loc>https://example.com/about</loc></url>
    </urlset>
  `);

  assert.deepEqual(urls, ["https://example.com/", "https://example.com/about"]);
});

test("normalizes discovered URLs against a base URL", () => {
  assert.equal(
    normalizeDiscoveredUrl("/about#team", "https://example.com/services/"),
    "https://example.com/about",
  );
  assert.equal(normalizeDiscoveredUrl("::bad-url::", "not-a-base"), null);
});

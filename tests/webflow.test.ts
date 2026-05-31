import assert from "node:assert/strict";
import test from "node:test";
import {
  findMatchingWebflowSite,
  parseWebflowSitesResponse,
  readWebflowSites,
} from "@/lib/webflow";

test("parses Webflow sites response", () => {
  const sites = parseWebflowSitesResponse({
    sites: [
      {
        id: "site_1",
        workspaceId: "workspace_1",
        displayName: "Client Site",
        shortName: "client-site",
        lastPublished: "2026-05-29T00:00:00.000Z",
        customDomains: [{ id: "domain_1", url: "example.com" }],
      },
      { id: "", displayName: "Broken" },
    ],
  });

  assert.deepEqual(sites, [
    {
      customDomains: [{ id: "domain_1", url: "example.com" }],
      displayName: "Client Site",
      id: "site_1",
      lastPublished: "2026-05-29T00:00:00.000Z",
      shortName: "client-site",
      workspaceId: "workspace_1",
    },
  ]);
});

test("reads Webflow sites from integration config", () => {
  const sites = readWebflowSites({
    sites: [
      {
        id: "site_1",
        displayName: "Client Site",
        customDomains: [{ id: "domain_1", url: "example.com" }],
      },
    ],
  });

  assert.equal(sites.length, 1);
  assert.equal(sites[0].id, "site_1");
});

test("matches Webflow custom domains to monitored domains", () => {
  const site = findMatchingWebflowSite("example.com", [
    {
      customDomains: [{ id: "domain_1", url: "example.com" }],
      displayName: "Client Site",
      id: "site_1",
      lastPublished: null,
      shortName: "client-site",
      workspaceId: "workspace_1",
    },
  ]);

  assert.equal(site?.id, "site_1");
});

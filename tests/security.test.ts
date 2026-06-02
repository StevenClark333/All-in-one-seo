import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPublicReportAccessWhere,
  buildWorkspaceIsolationWhere,
  isMutatingMethod,
  isTrustedRequestOrigin,
} from "@/lib/security";
import { isPublicPortalPath } from "@/proxy";

test("workspace isolation filters cannot be overridden by caller input", () => {
  assert.deepEqual(
    buildWorkspaceIsolationWhere("workspace_real", {
      id: "client_1",
      workspaceId: "workspace_attacker",
    }),
    {
      id: "client_1",
      workspaceId: "workspace_real",
    },
  );
});

test("client-facing report access requires a published share token", () => {
  assert.deepEqual(buildPublicReportAccessWhere("share_123"), {
    shareToken: "share_123",
    status: "PUBLISHED",
  });
});

test("trusts only same-origin mutating browser requests", () => {
  assert.equal(
    isTrustedRequestOrigin({
      origin: "https://app.example.com",
      requestUrl: "https://app.example.com/settings",
    }),
    true,
  );
  assert.equal(
    isTrustedRequestOrigin({
      origin: "https://evil.example.net",
      requestUrl: "https://app.example.com/settings",
    }),
    false,
  );
  assert.equal(
    isTrustedRequestOrigin({
      origin: null,
      requestUrl: "https://app.example.com/settings",
    }),
    false,
  );
});

test("classifies unsafe HTTP methods as mutating", () => {
  assert.equal(isMutatingMethod("POST"), true);
  assert.equal(isMutatingMethod("PATCH"), true);
  assert.equal(isMutatingMethod("GET"), false);
});

test("allows public portal assets without an app session", () => {
  assert.equal(
    isPublicPortalPath("/downloads/all-in-one-seo-wordpress.zip"),
    true,
  );
  assert.equal(isPublicPortalPath("/seo.js"), true);
  assert.equal(isPublicPortalPath("/integrations"), false);
});

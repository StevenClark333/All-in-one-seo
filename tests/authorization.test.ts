import assert from "node:assert/strict";
import test from "node:test";
import {
  canEditSeoWorkflows,
  canManageWorkspace,
  hasWorkspaceRole,
} from "@/lib/authorization";

test("allows workspace management for admins and owners", () => {
  assert.equal(canManageWorkspace("OWNER"), true);
  assert.equal(canManageWorkspace("ADMIN"), true);
  assert.equal(canManageWorkspace("MEMBER"), false);
  assert.equal(canManageWorkspace("VIEWER"), false);
});

test("allows SEO workflow edits for members and above", () => {
  assert.equal(canEditSeoWorkflows("OWNER"), true);
  assert.equal(canEditSeoWorkflows("ADMIN"), true);
  assert.equal(canEditSeoWorkflows("MEMBER"), true);
  assert.equal(canEditSeoWorkflows("VIEWER"), false);
});

test("checks workspace role hierarchy against required roles", () => {
  assert.equal(hasWorkspaceRole("OWNER", "ADMIN"), true);
  assert.equal(hasWorkspaceRole("ADMIN", "MEMBER"), true);
  assert.equal(hasWorkspaceRole("MEMBER", "ADMIN"), false);
  assert.equal(hasWorkspaceRole("VIEWER", "MEMBER"), false);
});

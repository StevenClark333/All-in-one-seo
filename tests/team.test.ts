import assert from "node:assert/strict";
import test from "node:test";
import { normalizeInvitationEmail, normalizeInviteRole } from "@/lib/team";

test("normalizes teammate invitation emails", () => {
  assert.equal(
    normalizeInvitationEmail(" Teammate@Example.COM "),
    "teammate@example.com",
  );
});

test("rejects invalid teammate invitation emails", () => {
  assert.throws(() => normalizeInvitationEmail("not-an-email"), /valid/);
});

test("allows only inviteable workspace roles", () => {
  assert.equal(normalizeInviteRole("ADMIN"), "ADMIN");
  assert.equal(normalizeInviteRole("MEMBER"), "MEMBER");
  assert.equal(normalizeInviteRole("VIEWER"), "VIEWER");
  assert.throws(() => normalizeInviteRole("OWNER"), /admin, member, or viewer/);
});

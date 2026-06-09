import assert from "node:assert/strict";
import test from "node:test";
import {
  formatInviteCount,
  formatInviteSeatDetail,
} from "@/lib/team-display-labels";

test("formats invitation states as friendly waiting labels", () => {
  assert.equal(formatInviteCount(0), "No invites waiting");
  assert.equal(formatInviteCount(1), "1 invite waiting");
  assert.equal(formatInviteCount(3), "3 invites waiting");
  assert.equal(formatInviteSeatDetail(0), "none waiting to join");
  assert.equal(formatInviteSeatDetail(2), "2 waiting to join");
});

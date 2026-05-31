import assert from "node:assert/strict";
import test from "node:test";
import {
  consumeAuthRateLimit,
  getNextFailedLoginState,
  isAccountLocked,
  normalizeAuthEmail,
} from "@/lib/auth-security";
import { hashPassword, verifyPassword } from "@/lib/password";

test("hashes and verifies passwords", () => {
  const hash = hashPassword("correct horse battery staple");

  assert.notEqual(hash, "correct horse battery staple");
  assert.equal(verifyPassword("correct horse battery staple", hash), true);
  assert.equal(verifyPassword("wrong password", hash), false);
});

test("rejects malformed password hashes", () => {
  assert.equal(verifyPassword("password", "not-a-real-hash"), false);
});

test("normalizes auth emails", () => {
  assert.equal(normalizeAuthEmail(" User@Example.COM "), "user@example.com");
});

test("rate limits repeated auth attempts by key", () => {
  const key = `auth_${Date.now()}`;
  const now = Date.now();

  for (let index = 0; index < 10; index += 1) {
    assert.equal(consumeAuthRateLimit(key, now), true);
  }

  assert.equal(consumeAuthRateLimit(key, now), false);
  assert.equal(consumeAuthRateLimit(key, now + 60_001), true);
});

test("locks accounts after repeated failed login attempts", () => {
  const now = new Date("2026-05-30T00:00:00.000Z");
  const state = getNextFailedLoginState(4, now);

  assert.equal(state.failedLoginCount, 5);
  assert.equal(isAccountLocked(state.lockedUntil, now), true);
  assert.equal(
    isAccountLocked(state.lockedUntil, new Date("2026-05-30T00:16:00.000Z")),
    false,
  );
});

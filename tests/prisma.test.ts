import assert from "node:assert/strict";
import test from "node:test";
import { shouldLogSlowQuery } from "@/lib/prisma";

test("flags queries at or above the slow query threshold", () => {
  assert.equal(shouldLogSlowQuery(499, 500), false);
  assert.equal(shouldLogSlowQuery(500, 500), true);
  assert.equal(shouldLogSlowQuery(1200, 500), true);
});

import assert from "node:assert/strict";
import test from "node:test";
import { getWorkspacePlanForType } from "@/lib/workspace";

test("assigns default plans by workspace type", () => {
  assert.equal(getWorkspacePlanForType("AGENCY"), "agency");
  assert.equal(getWorkspacePlanForType("BUSINESS"), "starter");
});

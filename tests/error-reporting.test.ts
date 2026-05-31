import assert from "node:assert/strict";
import test from "node:test";
import { buildErrorReportPayload } from "@/lib/error-reporting";

test("builds normalized error reporting payloads", () => {
  const payload = buildErrorReportPayload({
    context: { route: "/api/health" },
    error: new Error("database unavailable"),
    source: "healthcheck",
  });

  assert.equal(payload.source, "healthcheck");
  assert.equal(payload.error.name, "Error");
  assert.equal(payload.error.message, "database unavailable");
  assert.deepEqual(payload.context, { route: "/api/health" });
  assert.match(payload.timestamp, /^\d{4}-\d{2}-\d{2}T/);
});

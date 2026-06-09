import assert from "node:assert/strict";
import test from "node:test";
import { formatAlertDeliveryStatus } from "@/lib/alert-display-labels";

test("formats alert delivery statuses for nontechnical readers", () => {
  assert.equal(formatAlertDeliveryStatus("PENDING"), "Waiting to send");
  assert.equal(formatAlertDeliveryStatus("FAILED"), "Needs a check");
  assert.equal(formatAlertDeliveryStatus("SENT"), "Sent");
});

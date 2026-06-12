import assert from "node:assert/strict";
import test from "node:test";
import {
  formatAlertDeliveryStatus,
  formatAlertImportance,
  formatAlertWatchedChange,
} from "@/lib/alert-display-labels";

test("formats alert delivery statuses for nontechnical readers", () => {
  assert.equal(formatAlertDeliveryStatus("PENDING"), "Waiting to send");
  assert.equal(formatAlertDeliveryStatus("FAILED"), "Needs a check");
  assert.equal(formatAlertDeliveryStatus("SENT"), "Sent");
});

test("formats alert rule labels without urgent language", () => {
  assert.equal(
    formatAlertWatchedChange("ANY_CRITICAL_CHANGE"),
    "Any important change",
  );
  assert.equal(
    formatAlertWatchedChange("META_DESCRIPTION_CHANGED"),
    "Description changed",
  );
  assert.equal(formatAlertImportance("CRITICAL"), "Needs quick care");
  assert.equal(formatAlertImportance("WARNING"), "Planned");
  assert.equal(formatAlertImportance("SUGGESTION"), "Idea");
  assert.doesNotMatch(
    [
      formatAlertWatchedChange("ANY_CRITICAL_CHANGE"),
      formatAlertImportance("CRITICAL"),
    ].join(" "),
    /urgent/i,
  );
});

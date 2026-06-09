import assert from "node:assert/strict";
import test from "node:test";
import {
  formatExportClient,
  formatExportImportance,
  formatExportOwner,
} from "@/lib/export-display-labels";

test("formats exported ownership gaps as calm setup labels", () => {
  assert.equal(formatExportClient(null), "No client yet");
  assert.equal(formatExportClient(""), "No client yet");
  assert.equal(formatExportClient("Urban Thread"), "Urban Thread");
  assert.equal(formatExportOwner(null), "No owner yet");
  assert.equal(formatExportOwner(""), "No owner yet");
  assert.equal(formatExportOwner("Sam Carter"), "Sam Carter");
});

test("formats exported problem importance as plain action labels", () => {
  assert.equal(formatExportImportance("CRITICAL"), "Urgent");
  assert.equal(formatExportImportance("WARNING"), "Planned");
  assert.equal(formatExportImportance("SUGGESTION"), "Idea");
  assert.equal(formatExportImportance(null), "Idea");
});

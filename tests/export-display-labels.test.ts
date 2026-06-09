import assert from "node:assert/strict";
import test from "node:test";
import {
  formatExportClient,
  formatExportImportance,
  formatExportOwner,
  formatExportPriority,
  formatExportProblemArea,
  formatExportProgress,
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

test("formats exported problem details as a readable work list", () => {
  assert.equal(formatExportProblemArea("missing_meta_description"), "Missing Meta Description");
  assert.equal(formatExportProblemArea(null), "Website check");
  assert.equal(formatExportPriority(92), "Start here");
  assert.equal(formatExportPriority(62), "Do next");
  assert.equal(formatExportPriority(30), "Save for later");
  assert.equal(formatExportProgress("OPEN"), "Ready to review");
  assert.equal(formatExportProgress("IN_PROGRESS"), "Being fixed");
  assert.equal(formatExportProgress("REAPPEARED"), "Needs another look");
  assert.equal(formatExportProgress("IGNORED"), "Set aside");
  assert.equal(formatExportProgress("FIXED"), "Fixed");
});

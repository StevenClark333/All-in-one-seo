import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBulkIssueStatusUpdate,
  buildDetectedIssueStatus,
  buildIssueStatusUpdate,
  normalizeIssueAssignment,
} from "@/lib/issue-workflow";

test("sets resolved timestamp only when issue is fixed", () => {
  const fixed = buildIssueStatusUpdate("FIXED");
  const inProgress = buildIssueStatusUpdate("IN_PROGRESS");

  assert.equal(fixed.status, "FIXED");
  assert.ok(fixed.resolvedAt instanceof Date);
  assert.equal(inProgress.status, "IN_PROGRESS");
  assert.equal(inProgress.resolvedAt, null);
});

test("uses the same status behavior for bulk updates", () => {
  const ignored = buildBulkIssueStatusUpdate("IGNORED");

  assert.equal(ignored.status, "IGNORED");
  assert.equal(ignored.resolvedAt, null);
});

test("reopens fixed issues when analyzers detect them again", () => {
  assert.equal(buildDetectedIssueStatus("FIXED"), "REAPPEARED");
  assert.equal(buildDetectedIssueStatus("IGNORED"), "IGNORED");
  assert.equal(buildDetectedIssueStatus("IN_PROGRESS"), "IN_PROGRESS");
  assert.equal(buildDetectedIssueStatus(null), "OPEN");
  assert.equal(buildDetectedIssueStatus(undefined), "OPEN");
});

test("normalizes issue assignment values", () => {
  assert.equal(normalizeIssueAssignment(" user_123 "), "user_123");
  assert.equal(normalizeIssueAssignment(""), null);
  assert.equal(normalizeIssueAssignment(null), null);
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPageCareExportRow,
  buildProblemExportRow,
} from "@/lib/export-rows";

test("builds problem export rows with beginner-friendly headers", () => {
  const row = buildProblemExportRow({
    assignedTo: { email: "sam@example.com", name: null },
    client: { name: "Urban Thread" },
    description: "The page is missing a search description.",
    domain: { domain: "urbanthread.store" },
    issueType: "missing_meta_description",
    page: { url: "https://urbanthread.store/jacket" },
    priorityScore: 91,
    severity: "CRITICAL",
    status: "OPEN",
    title: "Missing meta description",
  });

  assert.deepEqual(Object.keys(row), [
    "assignedTo",
    "client",
    "description",
    "importance",
    "page",
    "priority",
    "problemArea",
    "progress",
    "title",
    "website",
  ]);
  assert.equal(row.website, "urbanthread.store");
  assert.equal(row.importance, "Needs quick care");
  assert.equal(row.problemArea, "Page description missing");
  assert.equal(row.progress, "Ready to review");
  assert.ok(!Object.hasOwn(row, "domain"));
  assert.ok(!Object.hasOwn(row, "issueType"));
});

test("builds page care export rows with website and problem wording", () => {
  const row = buildPageCareExportRow({
    domain: { client: null, domain: "example.com" },
    incomingLinks: [{ id: "link_1" }],
    issues: [{ id: "issue_1" }, { id: "issue_2" }],
    lastCrawledAt: null,
    outgoingLinks: [],
    snapshots: [{ statusCode: 404, title: "Missing page" }],
    url: "https://example.com/missing",
  });

  assert.deepEqual(Object.keys(row), [
    "client",
    "incomingLinks",
    "lastChecked",
    "outgoingLinks",
    "problems",
    "title",
    "url",
    "website",
    "websiteResponse",
  ]);
  assert.equal(row.client, "No client yet");
  assert.equal(row.problems, 2);
  assert.equal(row.websiteResponse, "Needs review (404)");
  assert.ok(!Object.hasOwn(row, "domain"));
  assert.ok(!Object.hasOwn(row, "issues"));
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  normalizeClientCrawlFrequency,
  parseBulkClientRows,
  parseClientTags,
  serializeClientTags,
} from "@/lib/client-management";

test("parses and serializes client tags", () => {
  assert.deepEqual(parseClientTags("retainer, ecommerce, "), [
    "retainer",
    "ecommerce",
  ]);
  assert.equal(
    serializeClientTags([" retainer ", "", "ecommerce"]),
    "retainer, ecommerce",
  );
});

test("parses bulk client import rows", () => {
  assert.deepEqual(parseBulkClientRows("Acme, ops@acme.test, retail\nBeta"), [
    { contactEmail: "ops@acme.test", name: "Acme", tags: "retail" },
    { contactEmail: undefined, name: "Beta", tags: undefined },
  ]);
});

test("normalizes client crawl frequency", () => {
  assert.equal(normalizeClientCrawlFrequency("daily"), "DAILY");
  assert.equal(normalizeClientCrawlFrequency("nonsense"), "WEEKLY");
});

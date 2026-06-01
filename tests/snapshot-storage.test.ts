import assert from "node:assert/strict";
import test from "node:test";
import {
  buildHtmlSnapshotKey,
  getLocalSnapshotRoot,
  getSnapshotRetentionDays,
} from "@/lib/snapshot-storage";

test("builds stable html snapshot object keys", () => {
  assert.equal(
    buildHtmlSnapshotKey({
      crawlRunId: "crawl_1",
      domainId: "domain_1",
      pageId: "page_1",
    }),
    "html-snapshots/domain_1/page_1/crawl_1.html",
  );
});

test("reads html snapshot retention from environment", () => {
  assert.equal(
    getSnapshotRetentionDays({ HTML_SNAPSHOT_RETENTION_DAYS: "45" }),
    45,
  );
  assert.equal(
    getSnapshotRetentionDays({ HTML_SNAPSHOT_RETENTION_DAYS: "-1" }),
    90,
  );
  assert.equal(getSnapshotRetentionDays({}), 90);
});

test("uses temp storage for local snapshots in serverless runtimes", () => {
  assert.match(
    getLocalSnapshotRoot({ VERCEL: "1" }),
    /all-in-one-seo$/,
  );
  assert.match(getLocalSnapshotRoot({}), /\.storage$/);
});

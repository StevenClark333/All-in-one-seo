import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const root = process.cwd();

test("uses beginner-facing loading labels for softened product areas", () => {
  const loadingCopy = [
    "src/app/competitive-analysis/loading.tsx",
    "src/app/issues/loading.tsx",
    "src/app/keyword-research/loading.tsx",
    "src/app/rank-tracking/loading.tsx",
  ]
    .map((path) => readFileSync(join(root, path), "utf8"))
    .join("\n");

  assert.match(loadingCopy, /Loading competitor insights/);
  assert.match(loadingCopy, /Loading problems/);
  assert.match(loadingCopy, /Loading search ideas/);
  assert.match(loadingCopy, /Loading rank movement/);
  assert.doesNotMatch(
    loadingCopy,
    /Loading competitive analysis|Loading issue analytics|Loading keyword research|Loading rank tracking/,
  );
});

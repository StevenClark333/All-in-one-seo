import assert from "node:assert/strict";
import test from "node:test";
import {
  getTemplateLabel,
  inferPageTemplate,
  summarizeTemplateGroups,
} from "@/lib/template-detection";

test("infers common template groups from URL patterns", () => {
  assert.equal(inferPageTemplate({ url: "https://example.com/" }), "homepage");
  assert.equal(
    inferPageTemplate({ url: "https://example.com/blog/post" }),
    "blog",
  );
  assert.equal(
    inferPageTemplate({ url: "https://example.com/products/widget" }),
    "product",
  );
  assert.equal(
    inferPageTemplate({ url: "https://example.com/collections/summer" }),
    "category",
  );
  assert.equal(
    inferPageTemplate({ url: "https://example.com/docs/install" }),
    "docs",
  );
});

test("prefers persisted page type over URL inference", () => {
  assert.equal(
    inferPageTemplate({
      pageType: "custom landing",
      url: "https://example.com/blog/post",
    }),
    "custom_landing",
  );
});

test("summarizes template groups with priority scores", () => {
  const groups = summarizeTemplateGroups([
    {
      url: "https://example.com/blog/one",
      pageType: "blog",
      issues: [{ severity: "CRITICAL" }, { severity: "WARNING" }],
    },
    {
      url: "https://example.com/blog/two",
      pageType: "blog",
      issues: [{ severity: "WARNING" }],
    },
    {
      url: "https://example.com/docs/install",
      pageType: null,
      issues: [],
    },
  ]);

  assert.equal(groups[0].key, "blog");
  assert.equal(groups[0].pageCount, 2);
  assert.equal(groups[0].issueCount, 3);
  assert.equal(groups[0].criticalCount, 1);
  assert.equal(groups[0].priorityScore > 0, true);
  assert.equal(getTemplateLabel("custom_landing"), "Custom Landing");
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  getProductNavHelp,
  getProductNavLabel,
  PRODUCT_AREA_NAME,
  PRODUCT_BRAND_NAME,
  PRODUCT_DISPLAY_NAME,
  PRODUCT_META_DESCRIPTION,
} from "@/lib/product-copy";

test("uses soft product framing for nontechnical website care", () => {
  assert.equal(PRODUCT_BRAND_NAME, "All In One");
  assert.equal(PRODUCT_AREA_NAME, "Website Care");
  assert.equal(PRODUCT_DISPLAY_NAME, "All In One Website Care");
  assert.match(PRODUCT_META_DESCRIPTION, /Calm website care/);
  assert.doesNotMatch(PRODUCT_DISPLAY_NAME, /Ops/);
});

test("uses softer product navigation labels for beginner scanning", () => {
  assert.equal(getProductNavLabel("Sites"), "Websites");
  assert.equal(getProductNavLabel("Search Performance"), "Search Growth");
  assert.equal(
    getProductNavLabel("Competitive Analysis"),
    "Competitor Insights",
  );
  assert.equal(getProductNavLabel("Keyword Research"), "Search Ideas");
  assert.equal(getProductNavLabel("Rank Tracking"), "Rank Movement");
  assert.equal(getProductNavLabel("AI"), "Ideas");
  assert.equal(getProductNavLabel("Technical"), "Links");
  assert.equal(
    getProductNavHelp("Keyword Research"),
    "Find useful search ideas, content gaps, and easier opportunities.",
  );
  assert.doesNotMatch(
    Object.values({
      competitor: getProductNavLabel("Competitive Analysis"),
      keyword: getProductNavLabel("Keyword Research"),
      rank: getProductNavLabel("Rank Tracking"),
      search: getProductNavLabel("Search Performance"),
    }).join(" "),
    /Analysis|Research|Tracking|Performance/,
  );
});

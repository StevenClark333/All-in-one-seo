import assert from "node:assert/strict";
import test from "node:test";
import {
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

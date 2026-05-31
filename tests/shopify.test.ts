import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
  normalizeShopifyShop,
  readShopifyShop,
  verifyShopifyHmac,
} from "@/lib/shopify";

test("normalizes valid Shopify shop domains", () => {
  assert.equal(
    normalizeShopifyShop("https://Example-Shop.myshopify.com/admin"),
    "example-shop.myshopify.com",
  );
});

test("rejects invalid Shopify shop domains", () => {
  assert.throws(() => normalizeShopifyShop("example.com"));
});

test("verifies Shopify OAuth HMAC signatures", () => {
  const secret = "shared-secret";
  const query = new URLSearchParams({
    code: "code123",
    shop: "example.myshopify.com",
    state: "state123",
    timestamp: "1717000000",
  });
  const message = Array.from(query.entries())
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const hmac = createHmac("sha256", secret).update(message).digest("hex");

  query.set("hmac", hmac);

  assert.equal(verifyShopifyHmac(query, secret), true);

  query.set("code", "tampered");

  assert.equal(verifyShopifyHmac(query, secret), false);
});

test("reads Shopify shop from integration config", () => {
  assert.equal(
    readShopifyShop({ shop: "example.myshopify.com" }),
    "example.myshopify.com",
  );
  assert.equal(readShopifyShop({ shop: 123 }), "");
});

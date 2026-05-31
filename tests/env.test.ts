import assert from "node:assert/strict";
import test from "node:test";
import { validateEnv, validateProductionEnv } from "@/lib/env";

test("requires DATABASE_URL", () => {
  assert.throws(() => validateEnv({}), /DATABASE_URL/);
});

test("accepts minimum local environment", () => {
  const result = validateEnv({
    DATABASE_URL:
      "postgresql://postgres:postgres@127.0.0.1:55432/all_in_one_seo",
  });

  assert.deepEqual(result.required, ["DATABASE_URL"]);
});

test("requires production deployment secrets", () => {
  assert.throws(
    () =>
      validateProductionEnv({
        DATABASE_URL:
          "postgresql://postgres:postgres@127.0.0.1:55432/all_in_one_seo",
      }),
    /CRON_SECRET/,
  );
});

test("accepts minimum production environment", () => {
  const result = validateProductionEnv({
    BLOB_READ_WRITE_TOKEN: "blob-token",
    CRON_SECRET: "cron-secret",
    DATABASE_URL:
      "postgresql://postgres:postgres@127.0.0.1:55432/all_in_one_seo",
    INTEGRATION_ENCRYPTION_KEY: "encryption-key",
    NEXT_PUBLIC_APP_URL: "https://app.example.com",
    STRIPE_PRICE_AGENCY: "price_agency",
    STRIPE_PRICE_AGENCY_PRO: "price_agency_pro",
    STRIPE_PRICE_GROWTH: "price_growth",
    STRIPE_PRICE_STARTER: "price_starter",
    STRIPE_SECRET_KEY: "sk_live_test",
    STRIPE_WEBHOOK_SECRET: "whsec_test",
  });

  assert.ok(result.required.includes("DATABASE_URL"));
  assert.ok(result.required.includes("STRIPE_SECRET_KEY"));
});

import assert from "node:assert/strict";
import test from "node:test";
import {
  billingProvider,
  formatPlanPrice,
  getMonthStart,
  getPlanStripePriceEnvKey,
  isCrawlFrequencyAllowed,
  planCatalog,
  trialStatusLabel,
} from "@/lib/billing";
import { normalizeStripeSubscriptionStatus } from "@/lib/stripe-billing";

test("chooses Stripe as the billing provider", () => {
  assert.equal(billingProvider.key, "STRIPE");
  assert.equal(billingProvider.name, "Stripe Billing");
});

test("defines production plan records and limits", () => {
  assert.deepEqual(
    planCatalog.map((plan) => plan.key),
    ["starter", "growth", "agency", "agency_pro"],
  );
  assert.equal(planCatalog[0].domainLimit, 1);
  assert.equal(planCatalog[0].renderedCrawling, false);
  assert.equal(planCatalog[1].renderedCrawling, true);
  assert.equal(planCatalog[2].whiteLabelReports, true);
  assert.equal(
    planCatalog[0].description,
    "For one business website getting a gentle weekly care check.",
  );
  assert.equal(
    planCatalog[3].description,
    "For larger agencies needing high-volume website care and white-label handoffs.",
  );
  assert.ok(
    planCatalog.every(
      (plan) => !/SEO monitoring|daily monitoring/.test(plan.description),
    ),
  );
});

test("formats monthly plan prices", () => {
  assert.equal(formatPlanPrice(2900), "$29/mo");
  assert.equal(formatPlanPrice(24900), "$249/mo");
});

test("maps plan keys to Stripe price env vars", () => {
  assert.equal(getPlanStripePriceEnvKey("starter"), "STRIPE_PRICE_STARTER");
  assert.equal(
    getPlanStripePriceEnvKey("agency_pro"),
    "STRIPE_PRICE_AGENCY_PRO",
  );
});

test("enforces crawl frequency rank by plan", () => {
  assert.equal(isCrawlFrequencyAllowed("WEEKLY", "WEEKLY"), true);
  assert.equal(isCrawlFrequencyAllowed("MANUAL", "WEEKLY"), true);
  assert.equal(isCrawlFrequencyAllowed("DAILY", "WEEKLY"), false);
  assert.equal(isCrawlFrequencyAllowed("DAILY", "DAILY"), true);
});

test("formats trial status labels", () => {
  const now = new Date("2026-05-30T00:00:00.000Z");

  assert.equal(trialStatusLabel(null, now), "No trial started");
  assert.equal(
    trialStatusLabel(
      {
        status: "TRIALING",
        trialEndsAt: new Date("2026-06-13T00:00:00.000Z"),
      },
      now,
    ),
    "14 trial days remaining",
  );
  assert.equal(
    trialStatusLabel({ status: "ACTIVE", trialEndsAt: null }, now),
    "Active",
  );
});

test("gets month start for usage windows", () => {
  const monthStart = getMonthStart(new Date("2026-05-30T12:00:00.000Z"));

  assert.equal(monthStart.getFullYear(), 2026);
  assert.equal(monthStart.getMonth(), 4);
  assert.equal(monthStart.getDate(), 1);
  assert.equal(monthStart.getHours(), 0);
});

test("normalizes Stripe subscription statuses", () => {
  assert.equal(normalizeStripeSubscriptionStatus("trialing"), "TRIALING");
  assert.equal(normalizeStripeSubscriptionStatus("past_due"), "PAST_DUE");
  assert.equal(normalizeStripeSubscriptionStatus("active"), "ACTIVE");
});

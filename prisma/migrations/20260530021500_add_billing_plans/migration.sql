CREATE TABLE "billing_plans" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "billingProvider" TEXT NOT NULL DEFAULT 'STRIPE',
    "monthlyPriceCents" INTEGER NOT NULL,
    "stripePriceId" TEXT,
    "trialDays" INTEGER NOT NULL DEFAULT 14,
    "domainLimit" INTEGER NOT NULL,
    "pageCrawlLimit" INTEGER NOT NULL,
    "crawlFrequency" TEXT NOT NULL,
    "aiRecommendationLimit" INTEGER NOT NULL,
    "teamSeatLimit" INTEGER NOT NULL,
    "reportLimit" INTEGER NOT NULL,
    "whiteLabelReports" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "billing_plans_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "workspace_subscriptions" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "planId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'TRIALING',
    "billingProvider" TEXT NOT NULL DEFAULT 'STRIPE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "trialEndsAt" TIMESTAMP(3),
    "currentPeriodEndsAt" TIMESTAMP(3),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_subscriptions_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "billing_plans_key_key" ON "billing_plans"("key");
CREATE INDEX "billing_plans_active_idx" ON "billing_plans"("active");
CREATE INDEX "workspace_subscriptions_workspaceId_status_idx" ON "workspace_subscriptions"("workspaceId", "status");
CREATE INDEX "workspace_subscriptions_planId_idx" ON "workspace_subscriptions"("planId");
CREATE INDEX "workspace_subscriptions_stripeCustomerId_idx" ON "workspace_subscriptions"("stripeCustomerId");
CREATE INDEX "workspace_subscriptions_stripeSubscriptionId_idx" ON "workspace_subscriptions"("stripeSubscriptionId");

ALTER TABLE "workspace_subscriptions" ADD CONSTRAINT "workspace_subscriptions_planId_fkey" FOREIGN KEY ("planId") REFERENCES "billing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "workspace_subscriptions" ADD CONSTRAINT "workspace_subscriptions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "billing_plans" (
  "id",
  "key",
  "name",
  "description",
  "monthlyPriceCents",
  "trialDays",
  "domainLimit",
  "pageCrawlLimit",
  "crawlFrequency",
  "aiRecommendationLimit",
  "teamSeatLimit",
  "reportLimit",
  "whiteLabelReports",
  "active",
  "updatedAt"
) VALUES
  (
    'plan_starter',
    'starter',
    'Starter',
    'For one business site getting continuous weekly SEO monitoring.',
    2900,
    14,
    1,
    500,
    'WEEKLY',
    100,
    2,
    4,
    false,
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'plan_growth',
    'growth',
    'Growth',
    'For growing teams managing multiple sites with daily monitoring.',
    9900,
    14,
    5,
    5000,
    'DAILY',
    750,
    8,
    20,
    false,
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'plan_agency',
    'agency',
    'Agency',
    'For agencies managing client portfolios, reports, and integrations.',
    24900,
    14,
    25,
    50000,
    'DAILY',
    3000,
    20,
    100,
    true,
    true,
    CURRENT_TIMESTAMP
  ),
  (
    'plan_agency_pro',
    'agency_pro',
    'Agency Pro',
    'For larger agencies needing high-volume monitoring and white-label workflows.',
    59900,
    14,
    100,
    250000,
    'DAILY',
    10000,
    50,
    500,
    true,
    true,
    CURRENT_TIMESTAMP
  );

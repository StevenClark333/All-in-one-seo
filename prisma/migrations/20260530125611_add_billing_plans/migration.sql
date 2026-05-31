-- AlterTable
ALTER TABLE "billing_plans" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "workspace_subscriptions" ALTER COLUMN "updatedAt" DROP DEFAULT;

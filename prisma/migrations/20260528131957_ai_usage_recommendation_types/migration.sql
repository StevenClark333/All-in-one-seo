-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RecommendationType" ADD VALUE 'ISSUE_EXPLANATION';
ALTER TYPE "RecommendationType" ADD VALUE 'CMS_FIX_BRIEF';

-- CreateTable
CREATE TABLE "ai_usage_events" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "feature" TEXT NOT NULL,
    "inputHash" TEXT NOT NULL,
    "promptTokens" INTEGER NOT NULL DEFAULT 0,
    "completionTokens" INTEGER NOT NULL DEFAULT 0,
    "estimatedCostUsd" DECIMAL(10,6),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_usage_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_usage_events_workspaceId_createdAt_idx" ON "ai_usage_events"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "ai_usage_events_workspaceId_feature_idx" ON "ai_usage_events"("workspaceId", "feature");

-- AddForeignKey
ALTER TABLE "ai_usage_events" ADD CONSTRAINT "ai_usage_events_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

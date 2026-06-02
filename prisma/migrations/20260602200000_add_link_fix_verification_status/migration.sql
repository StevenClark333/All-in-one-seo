-- CreateEnum
CREATE TYPE "LinkFixVerificationStatus" AS ENUM ('NOT_CHECKED', 'PENDING', 'VERIFIED_FIXED', 'STILL_FAILING');

-- AlterTable
ALTER TABLE "link_fix_suggestions" ADD COLUMN "verificationStatus" "LinkFixVerificationStatus" NOT NULL DEFAULT 'NOT_CHECKED',
ADD COLUMN "verificationCheckedAt" TIMESTAMP(3),
ADD COLUMN "verificationCrawlRunId" TEXT,
ADD COLUMN "verificationMessage" TEXT;

-- CreateIndex
CREATE INDEX "link_fix_suggestions_workspaceId_verificationStatus_idx" ON "link_fix_suggestions"("workspaceId", "verificationStatus");

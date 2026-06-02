-- CreateEnum
CREATE TYPE "LinkFixStatus" AS ENUM ('DRAFT', 'APPROVED', 'EXPORTED', 'APPLIED', 'DISMISSED');

-- CreateTable
CREATE TABLE "link_fix_suggestions" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "issueId" TEXT,
    "sourcePageId" TEXT,
    "targetPageId" TEXT,
    "inputHash" TEXT NOT NULL,
    "status" "LinkFixStatus" NOT NULL DEFAULT 'DRAFT',
    "sourceUrl" TEXT NOT NULL,
    "brokenUrl" TEXT,
    "suggestedUrl" TEXT NOT NULL,
    "anchorText" TEXT,
    "confidenceScore" INTEGER NOT NULL DEFAULT 60,
    "reason" TEXT NOT NULL,
    "manualInstructions" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "approvedAt" TIMESTAMP(3),
    "exportedAt" TIMESTAMP(3),
    "appliedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),

    CONSTRAINT "link_fix_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "link_fix_suggestions_workspaceId_inputHash_key" ON "link_fix_suggestions"("workspaceId", "inputHash");

-- CreateIndex
CREATE INDEX "link_fix_suggestions_workspaceId_status_idx" ON "link_fix_suggestions"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "link_fix_suggestions_domainId_status_idx" ON "link_fix_suggestions"("domainId", "status");

-- CreateIndex
CREATE INDEX "link_fix_suggestions_issueId_idx" ON "link_fix_suggestions"("issueId");

-- AddForeignKey
ALTER TABLE "link_fix_suggestions" ADD CONSTRAINT "link_fix_suggestions_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_fix_suggestions" ADD CONSTRAINT "link_fix_suggestions_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "seo_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_fix_suggestions" ADD CONSTRAINT "link_fix_suggestions_sourcePageId_fkey" FOREIGN KEY ("sourcePageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_fix_suggestions" ADD CONSTRAINT "link_fix_suggestions_targetPageId_fkey" FOREIGN KEY ("targetPageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "link_fix_suggestions" ADD CONSTRAINT "link_fix_suggestions_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

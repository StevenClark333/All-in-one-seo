-- AlterTable
ALTER TABLE "domains" ADD COLUMN "archivedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "domains_workspaceId_archivedAt_idx" ON "domains"("workspaceId", "archivedAt");

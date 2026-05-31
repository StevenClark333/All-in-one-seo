ALTER TABLE "clients" ADD COLUMN "tags" TEXT;
ALTER TABLE "clients" ADD COLUMN "crawlFrequency" "CrawlFrequency" NOT NULL DEFAULT 'WEEKLY';
ALTER TABLE "clients" ADD COLUMN "archivedAt" TIMESTAMP(3);

CREATE INDEX "clients_workspaceId_archivedAt_idx" ON "clients"("workspaceId", "archivedAt");

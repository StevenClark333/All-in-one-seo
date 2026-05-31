-- CreateTable
CREATE TABLE "site_scores" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "crawlRunId" TEXT,
    "score" INTEGER NOT NULL,
    "reasonsJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "site_scores_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "site_scores_domainId_createdAt_idx" ON "site_scores"("domainId", "createdAt");

-- CreateIndex
CREATE INDEX "site_scores_crawlRunId_idx" ON "site_scores"("crawlRunId");

-- AddForeignKey
ALTER TABLE "site_scores" ADD CONSTRAINT "site_scores_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "crawl_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "site_scores" ADD CONSTRAINT "site_scores_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

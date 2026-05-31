-- CreateEnum
CREATE TYPE "CrawlArtifactType" AS ENUM ('ROBOTS_TXT', 'SITEMAP');

-- CreateTable
CREATE TABLE "crawl_artifacts" (
    "id" TEXT NOT NULL,
    "crawlRunId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "type" "CrawlArtifactType" NOT NULL,
    "url" TEXT NOT NULL,
    "statusCode" INTEGER,
    "contentHash" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "crawl_artifacts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "crawl_artifacts_crawlRunId_type_idx" ON "crawl_artifacts"("crawlRunId", "type");

-- CreateIndex
CREATE INDEX "crawl_artifacts_domainId_type_idx" ON "crawl_artifacts"("domainId", "type");

-- AddForeignKey
ALTER TABLE "crawl_artifacts" ADD CONSTRAINT "crawl_artifacts_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "crawl_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crawl_artifacts" ADD CONSTRAINT "crawl_artifacts_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "page_links" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "crawlRunId" TEXT NOT NULL,
    "sourcePageId" TEXT NOT NULL,
    "targetPageId" TEXT,
    "href" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "anchorText" TEXT,
    "isInternal" BOOLEAN NOT NULL DEFAULT true,
    "statusCode" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "page_links_domainId_crawlRunId_idx" ON "page_links"("domainId", "crawlRunId");

-- CreateIndex
CREATE INDEX "page_links_sourcePageId_idx" ON "page_links"("sourcePageId");

-- CreateIndex
CREATE INDEX "page_links_targetPageId_idx" ON "page_links"("targetPageId");

-- CreateIndex
CREATE INDEX "page_links_normalizedUrl_idx" ON "page_links"("normalizedUrl");

-- AddForeignKey
ALTER TABLE "page_links" ADD CONSTRAINT "page_links_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "crawl_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_links" ADD CONSTRAINT "page_links_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_links" ADD CONSTRAINT "page_links_sourcePageId_fkey" FOREIGN KEY ("sourcePageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_links" ADD CONSTRAINT "page_links_targetPageId_fkey" FOREIGN KEY ("targetPageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "rendered_page_captures" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "crawlRunId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "screenshotObjectKey" TEXT,
    "domObjectKey" TEXT,
    "visualHash" TEXT,
    "previousCaptureId" TEXT,
    "diffScore" DOUBLE PRECISION,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rendered_page_captures_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "rendered_page_captures_pageId_createdAt_idx" ON "rendered_page_captures"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "rendered_page_captures_crawlRunId_idx" ON "rendered_page_captures"("crawlRunId");

-- AddForeignKey
ALTER TABLE "rendered_page_captures" ADD CONSTRAINT "rendered_page_captures_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendered_page_captures" ADD CONSTRAINT "rendered_page_captures_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "crawl_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rendered_page_captures" ADD CONSTRAINT "rendered_page_captures_previousCaptureId_fkey" FOREIGN KEY ("previousCaptureId") REFERENCES "rendered_page_captures"("id") ON DELETE SET NULL ON UPDATE CASCADE;

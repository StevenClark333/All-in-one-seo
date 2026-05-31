-- CreateTable
CREATE TABLE "gsc_search_metrics" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "query" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "country" TEXT,
    "device" TEXT,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "impressions" INTEGER NOT NULL DEFAULT 0,
    "ctr" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "position" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gsc_search_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "gsc_search_metrics_domainId_date_idx" ON "gsc_search_metrics"("domainId", "date");

-- CreateIndex
CREATE INDEX "gsc_search_metrics_domainId_pageUrl_idx" ON "gsc_search_metrics"("domainId", "pageUrl");

-- CreateIndex
CREATE UNIQUE INDEX "gsc_search_metrics_domainId_date_query_pageUrl_country_devi_key" ON "gsc_search_metrics"("domainId", "date", "query", "pageUrl", "country", "device");

-- AddForeignKey
ALTER TABLE "gsc_search_metrics" ADD CONSTRAINT "gsc_search_metrics_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

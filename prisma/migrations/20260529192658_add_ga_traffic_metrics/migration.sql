-- CreateTable
CREATE TABLE "ga_traffic_metrics" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "pagePath" TEXT NOT NULL,
    "sessions" INTEGER NOT NULL DEFAULT 0,
    "activeUsers" INTEGER NOT NULL DEFAULT 0,
    "screenPageViews" INTEGER NOT NULL DEFAULT 0,
    "conversions" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ga_traffic_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ga_traffic_metrics_domainId_date_idx" ON "ga_traffic_metrics"("domainId", "date");

-- CreateIndex
CREATE INDEX "ga_traffic_metrics_domainId_pagePath_idx" ON "ga_traffic_metrics"("domainId", "pagePath");

-- CreateIndex
CREATE UNIQUE INDEX "ga_traffic_metrics_domainId_date_pagePath_key" ON "ga_traffic_metrics"("domainId", "date", "pagePath");

-- AddForeignKey
ALTER TABLE "ga_traffic_metrics" ADD CONSTRAINT "ga_traffic_metrics_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

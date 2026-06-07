-- CreateEnum
CREATE TYPE "RankTrackingFrequency" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY');

-- CreateEnum
CREATE TYPE "RankTrackingStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "SearchEngine" AS ENUM ('GOOGLE', 'BING');

-- CreateTable
CREATE TABLE "competitor_domains" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "domainId" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "label" TEXT,
    "notes" TEXT,
    "source" TEXT NOT NULL DEFAULT 'MANUAL',
    "lastSeenAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tracked_keywords" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "locale" TEXT,
    "country" TEXT,
    "device" TEXT,
    "engine" "SearchEngine" NOT NULL DEFAULT 'GOOGLE',
    "frequency" "RankTrackingFrequency" NOT NULL DEFAULT 'WEEKLY',
    "status" "RankTrackingStatus" NOT NULL DEFAULT 'ACTIVE',
    "tags" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tracked_keywords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rank_observations" (
    "id" TEXT NOT NULL,
    "trackedKeywordId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "engine" "SearchEngine" NOT NULL DEFAULT 'GOOGLE',
    "country" TEXT,
    "device" TEXT,
    "position" DOUBLE PRECISION,
    "url" TEXT,
    "competitorDomain" TEXT,
    "featuredSnippet" BOOLEAN NOT NULL DEFAULT false,
    "localPack" BOOLEAN NOT NULL DEFAULT false,
    "peopleAlsoAsk" BOOLEAN NOT NULL DEFAULT false,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rank_observations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keyword_metrics" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "trackedKeywordId" TEXT,
    "keyword" TEXT NOT NULL,
    "country" TEXT,
    "language" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'MANUAL',
    "searchVolume" INTEGER,
    "difficulty" INTEGER,
    "cpcCents" INTEGER,
    "competition" DOUBLE PRECISION,
    "trendJson" JSONB,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "keyword_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "competitor_domains_domainId_domain_key" ON "competitor_domains"("domainId", "domain");

-- CreateIndex
CREATE INDEX "competitor_domains_workspaceId_idx" ON "competitor_domains"("workspaceId");

-- CreateIndex
CREATE INDEX "competitor_domains_clientId_idx" ON "competitor_domains"("clientId");

-- CreateIndex
CREATE INDEX "competitor_domains_domainId_idx" ON "competitor_domains"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "tracked_keywords_domainId_keyword_country_device_engine_key" ON "tracked_keywords"("domainId", "keyword", "country", "device", "engine");

-- CreateIndex
CREATE INDEX "tracked_keywords_workspaceId_status_idx" ON "tracked_keywords"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "tracked_keywords_domainId_status_idx" ON "tracked_keywords"("domainId", "status");

-- CreateIndex
CREATE INDEX "rank_observations_trackedKeywordId_date_idx" ON "rank_observations"("trackedKeywordId", "date");

-- CreateIndex
CREATE INDEX "rank_observations_competitorDomain_idx" ON "rank_observations"("competitorDomain");

-- CreateIndex
CREATE INDEX "keyword_metrics_workspaceId_keyword_idx" ON "keyword_metrics"("workspaceId", "keyword");

-- CreateIndex
CREATE INDEX "keyword_metrics_trackedKeywordId_idx" ON "keyword_metrics"("trackedKeywordId");

-- AddForeignKey
ALTER TABLE "competitor_domains" ADD CONSTRAINT "competitor_domains_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_domains" ADD CONSTRAINT "competitor_domains_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitor_domains" ADD CONSTRAINT "competitor_domains_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracked_keywords" ADD CONSTRAINT "tracked_keywords_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tracked_keywords" ADD CONSTRAINT "tracked_keywords_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rank_observations" ADD CONSTRAINT "rank_observations_trackedKeywordId_fkey" FOREIGN KEY ("trackedKeywordId") REFERENCES "tracked_keywords"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_metrics" ADD CONSTRAINT "keyword_metrics_trackedKeywordId_fkey" FOREIGN KEY ("trackedKeywordId") REFERENCES "tracked_keywords"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "keyword_metrics" ADD CONSTRAINT "keyword_metrics_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

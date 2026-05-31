-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "WorkspaceType" AS ENUM ('BUSINESS', 'AGENCY');

-- CreateEnum
CREATE TYPE "WorkspaceRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'VIEWER');

-- CreateEnum
CREATE TYPE "DomainPlatform" AS ENUM ('WORDPRESS', 'SHOPIFY', 'WEBFLOW', 'WIX', 'SQUARESPACE', 'CUSTOM', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "VerificationMethod" AS ENUM ('DNS_TXT', 'HTML_FILE', 'META_TAG', 'GSC_OAUTH');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'FAILED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ScriptStatus" AS ENUM ('NOT_INSTALLED', 'DETECTED', 'DISABLED');

-- CreateEnum
CREATE TYPE "CrawlFrequency" AS ENUM ('MANUAL', 'WEEKLY', 'DAILY', 'CUSTOM');

-- CreateEnum
CREATE TYPE "CrawlStatus" AS ENUM ('QUEUED', 'RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CrawlTrigger" AS ENUM ('MANUAL', 'SCHEDULED', 'SYSTEM');

-- CreateEnum
CREATE TYPE "PageImportance" AS ENUM ('CRITICAL', 'IMPORTANT', 'NORMAL', 'IGNORED');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('CRITICAL', 'WARNING', 'SUGGESTION');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('OPEN', 'IGNORED', 'IN_PROGRESS', 'FIXED', 'REAPPEARED');

-- CreateEnum
CREATE TYPE "RecommendationType" AS ENUM ('TITLE', 'META_DESCRIPTION', 'H1', 'FIX_BRIEF', 'INTERNAL_LINKING', 'SCHEMA');

-- CreateEnum
CREATE TYPE "ReportStatus" AS ENUM ('DRAFT', 'GENERATED', 'PUBLISHED', 'FAILED');

-- CreateEnum
CREATE TYPE "AlertChannel" AS ENUM ('EMAIL', 'SLACK', 'WEBHOOK');

-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspaces" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "WorkspaceType" NOT NULL,
    "plan" TEXT NOT NULL DEFAULT 'starter',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspaces_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_members" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "WorkspaceRole" NOT NULL DEFAULT 'MEMBER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "logoUrl" TEXT,
    "contactEmail" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domains" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "domain" TEXT NOT NULL,
    "platform" "DomainPlatform" NOT NULL DEFAULT 'UNKNOWN',
    "verificationStatus" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "scriptStatus" "ScriptStatus" NOT NULL DEFAULT 'NOT_INSTALLED',
    "crawlFrequency" "CrawlFrequency" NOT NULL DEFAULT 'WEEKLY',
    "lastCrawledAt" TIMESTAMP(3),
    "healthScore" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "domain_verifications" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "method" "VerificationMethod" NOT NULL DEFAULT 'DNS_TXT',
    "token" TEXT NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "domain_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "crawl_runs" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "status" "CrawlStatus" NOT NULL DEFAULT 'QUEUED',
    "trigger" "CrawlTrigger" NOT NULL DEFAULT 'MANUAL',
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "pagesDiscovered" INTEGER NOT NULL DEFAULT 0,
    "pagesCrawled" INTEGER NOT NULL DEFAULT 0,
    "pagesFailed" INTEGER NOT NULL DEFAULT 0,
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "crawl_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pages" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "normalizedUrl" TEXT NOT NULL,
    "pageType" TEXT,
    "importance" "PageImportance" NOT NULL DEFAULT 'NORMAL',
    "firstSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),
    "lastCrawledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "page_snapshots" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "crawlRunId" TEXT NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "htmlObjectKey" TEXT,
    "title" TEXT,
    "metaDescription" TEXT,
    "h1" TEXT,
    "canonical" TEXT,
    "robotsDirective" TEXT,
    "wordCount" INTEGER,
    "contentHash" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "page_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_issues" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "domainId" TEXT NOT NULL,
    "pageId" TEXT,
    "templateId" TEXT,
    "issueType" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "priorityScore" INTEGER NOT NULL DEFAULT 0,
    "status" "IssueStatus" NOT NULL DEFAULT 'OPEN',
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recommendation" TEXT,
    "firstDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastDetectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvedAt" TIMESTAMP(3),
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seo_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seo_recommendations" (
    "id" TEXT NOT NULL,
    "issueId" TEXT,
    "pageId" TEXT,
    "type" "RecommendationType" NOT NULL,
    "inputHash" TEXT NOT NULL,
    "recommendationJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "seo_recommendations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "change_events" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "pageId" TEXT,
    "crawlRunId" TEXT,
    "changeType" TEXT NOT NULL,
    "severity" "IssueSeverity" NOT NULL,
    "previousValue" TEXT,
    "newValue" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "change_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "script_events" (
    "id" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "payloadJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "script_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "domainId" TEXT,
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "domainId" TEXT,
    "title" TEXT NOT NULL,
    "status" "ReportStatus" NOT NULL DEFAULT 'DRAFT',
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "pdfObjectKey" TEXT,
    "shareToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alert_rules" (
    "id" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "clientId" TEXT,
    "domainId" TEXT,
    "name" TEXT NOT NULL,
    "eventType" TEXT NOT NULL,
    "severityThreshold" "IssueSeverity" NOT NULL DEFAULT 'WARNING',
    "channel" "AlertChannel" NOT NULL DEFAULT 'EMAIL',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alert_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" TEXT NOT NULL,
    "alertRuleId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "domainId" TEXT NOT NULL,
    "pageId" TEXT,
    "eventId" TEXT,
    "status" "AlertStatus" NOT NULL DEFAULT 'PENDING',
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "workspace_members_userId_idx" ON "workspace_members"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_members_workspaceId_userId_key" ON "workspace_members"("workspaceId", "userId");

-- CreateIndex
CREATE INDEX "clients_workspaceId_idx" ON "clients"("workspaceId");

-- CreateIndex
CREATE INDEX "domains_clientId_idx" ON "domains"("clientId");

-- CreateIndex
CREATE INDEX "domains_verificationStatus_idx" ON "domains"("verificationStatus");

-- CreateIndex
CREATE UNIQUE INDEX "domains_workspaceId_domain_key" ON "domains"("workspaceId", "domain");

-- CreateIndex
CREATE UNIQUE INDEX "domain_verifications_token_key" ON "domain_verifications"("token");

-- CreateIndex
CREATE INDEX "domain_verifications_domainId_status_idx" ON "domain_verifications"("domainId", "status");

-- CreateIndex
CREATE INDEX "crawl_runs_domainId_status_idx" ON "crawl_runs"("domainId", "status");

-- CreateIndex
CREATE INDEX "crawl_runs_createdAt_idx" ON "crawl_runs"("createdAt");

-- CreateIndex
CREATE INDEX "pages_domainId_importance_idx" ON "pages"("domainId", "importance");

-- CreateIndex
CREATE UNIQUE INDEX "pages_domainId_normalizedUrl_key" ON "pages"("domainId", "normalizedUrl");

-- CreateIndex
CREATE INDEX "page_snapshots_pageId_createdAt_idx" ON "page_snapshots"("pageId", "createdAt");

-- CreateIndex
CREATE INDEX "page_snapshots_crawlRunId_idx" ON "page_snapshots"("crawlRunId");

-- CreateIndex
CREATE INDEX "seo_issues_workspaceId_status_severity_idx" ON "seo_issues"("workspaceId", "status", "severity");

-- CreateIndex
CREATE INDEX "seo_issues_clientId_idx" ON "seo_issues"("clientId");

-- CreateIndex
CREATE INDEX "seo_issues_domainId_idx" ON "seo_issues"("domainId");

-- CreateIndex
CREATE INDEX "seo_issues_pageId_idx" ON "seo_issues"("pageId");

-- CreateIndex
CREATE INDEX "seo_recommendations_issueId_idx" ON "seo_recommendations"("issueId");

-- CreateIndex
CREATE INDEX "seo_recommendations_pageId_idx" ON "seo_recommendations"("pageId");

-- CreateIndex
CREATE INDEX "change_events_domainId_createdAt_idx" ON "change_events"("domainId", "createdAt");

-- CreateIndex
CREATE INDEX "change_events_pageId_idx" ON "change_events"("pageId");

-- CreateIndex
CREATE INDEX "script_events_domainId_createdAt_idx" ON "script_events"("domainId", "createdAt");

-- CreateIndex
CREATE INDEX "integrations_workspaceId_provider_idx" ON "integrations"("workspaceId", "provider");

-- CreateIndex
CREATE INDEX "integrations_domainId_idx" ON "integrations"("domainId");

-- CreateIndex
CREATE UNIQUE INDEX "reports_shareToken_key" ON "reports"("shareToken");

-- CreateIndex
CREATE INDEX "reports_workspaceId_createdAt_idx" ON "reports"("workspaceId", "createdAt");

-- CreateIndex
CREATE INDEX "reports_clientId_idx" ON "reports"("clientId");

-- CreateIndex
CREATE INDEX "alert_rules_workspaceId_enabled_idx" ON "alert_rules"("workspaceId", "enabled");

-- CreateIndex
CREATE INDEX "alert_rules_domainId_idx" ON "alert_rules"("domainId");

-- CreateIndex
CREATE INDEX "alerts_workspaceId_status_idx" ON "alerts"("workspaceId", "status");

-- CreateIndex
CREATE INDEX "alerts_domainId_createdAt_idx" ON "alerts"("domainId", "createdAt");

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_members" ADD CONSTRAINT "workspace_members_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domains" ADD CONSTRAINT "domains_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "domain_verifications" ADD CONSTRAINT "domain_verifications_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "crawl_runs" ADD CONSTRAINT "crawl_runs_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pages" ADD CONSTRAINT "pages_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_snapshots" ADD CONSTRAINT "page_snapshots_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "crawl_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "page_snapshots" ADD CONSTRAINT "page_snapshots_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_issues" ADD CONSTRAINT "seo_issues_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_recommendations" ADD CONSTRAINT "seo_recommendations_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "seo_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seo_recommendations" ADD CONSTRAINT "seo_recommendations_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_events" ADD CONSTRAINT "change_events_crawlRunId_fkey" FOREIGN KEY ("crawlRunId") REFERENCES "crawl_runs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_events" ADD CONSTRAINT "change_events_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "change_events" ADD CONSTRAINT "change_events_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "script_events" ADD CONSTRAINT "script_events_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alert_rules" ADD CONSTRAINT "alert_rules_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_alertRuleId_fkey" FOREIGN KEY ("alertRuleId") REFERENCES "alert_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "change_events"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_domainId_fkey" FOREIGN KEY ("domainId") REFERENCES "domains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "pages"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspaces"("id") ON DELETE CASCADE ON UPDATE CASCADE;


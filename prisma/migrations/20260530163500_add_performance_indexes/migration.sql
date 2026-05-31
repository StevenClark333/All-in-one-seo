CREATE INDEX "domains_workspaceId_verificationStatus_idx" ON "domains"("workspaceId", "verificationStatus");
CREATE INDEX "domains_workspaceId_lastCrawledAt_idx" ON "domains"("workspaceId", "lastCrawledAt");
CREATE INDEX "crawl_runs_status_createdAt_idx" ON "crawl_runs"("status", "createdAt");
CREATE INDEX "pages_domainId_lastCrawledAt_idx" ON "pages"("domainId", "lastCrawledAt");
CREATE INDEX "seo_issues_workspaceId_status_priorityScore_idx" ON "seo_issues"("workspaceId", "status", "priorityScore");

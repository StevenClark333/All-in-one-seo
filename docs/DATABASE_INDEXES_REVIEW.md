# Database Indexes Review

This review records the production indexes added for the highest-volume dashboard and worker queries.

## Added Indexes

- `domains(workspaceId, verificationStatus)` for workspace domain lists and verification queues.
- `domains(workspaceId, lastCrawledAt)` for stale-domain and recrawl selection.
- `crawl_runs(status, createdAt)` for worker pickup and operational queues.
- `pages(domainId, lastCrawledAt)` for crawl coverage and stale page checks.
- `seo_issues(workspaceId, status, priorityScore)` for priority issue dashboards.

## Monitoring

The Prisma client logs slow query warnings through `SLOW_QUERY_THRESHOLD_MS`, defaulting to `500`.
Production logging should route these warnings into the observability provider so recurring slow queries become index review candidates.

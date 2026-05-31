# Production Architecture

## Runtime Services

- Next.js web app: dashboard, auth, report views, public share pages, and server actions.
- PostgreSQL: primary relational store through Prisma.
- Cron/API jobs: scheduled alert evaluation, scheduled reports, snapshot cleanup, scheduled crawl enqueueing, and crawl queue processing.
- Object storage: HTML snapshots, exported PDFs, report assets, and uploaded/linked client assets.

## Current Worker Boundary

Scheduled and worker entrypoints are available through:

- `/api/jobs/evaluate-alerts`
- `/api/jobs/generate-scheduled-reports`
- `/api/jobs/cleanup-snapshots`
- `/api/jobs/enqueue-scheduled-crawls`
- `/api/jobs/process-crawl-queue`

Crawler jobs are persisted in `worker_jobs` and processed with bounded concurrency, retries, and dead-letter behavior.

## Data Isolation

Workspace-scoped reads flow through `getPrimaryWorkspace`, which prefers the current user's workspace membership. Server actions and query helpers should continue filtering by `workspaceId`.

## Security Baseline

- Session cookie is HTTP-only and same-site lax.
- App routes are protected by `src/proxy.ts`.
- Public report share routes are explicitly allowed.
- Crawler fetches validate URL protocol and block private/internal IP ranges.
- Secure response headers are configured in `next.config.ts`.
- Audit logs track signup/login and provide the model for action logging.

## Production Readiness Notes

- Auth abuse protection includes rate limiting, email verification, password reset, and account lockout foundations.
- Queue-backed crawls and scheduled report generation are implemented.
- Object storage writes exist for HTML snapshots and report outputs where provider tokens are configured.
- Authorization and workspace isolation tests are covered in the current suite.
- Stripe billing, plan catalog, and limit enforcement are implemented.

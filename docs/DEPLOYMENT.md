# Deployment Guide

This project is designed for a production Next.js deployment with PostgreSQL, scheduled jobs, and optional provider-backed AI/email integrations.

## Required Services

- Web app: Vercel, Node.js runtime.
- Database: managed PostgreSQL, for example Neon, Supabase, RDS, or Vercel Marketplace Postgres.
- Background scheduling: Vercel Cron invokes `/api/jobs/evaluate-alerts`.
- Object storage: required before storing large HTML snapshots or branded report PDFs outside the database. Use Vercel Blob, S3, or Cloudflare R2.
- Email alerts: Resend-compatible API key through `RESEND_API_KEY`.
- AI recommendations: OpenAI-compatible Responses API through `OPENAI_API_KEY`.

## Preview Database Strategy

- Every pull request deploys against an isolated preview database branch.
- Preview databases must be seeded with synthetic demo data only.
- Preview migrations run with `npx prisma migrate deploy` during the preview
  build.
- Production data must never be cloned into preview without anonymization.
- Preview databases can be deleted when the pull request closes.

## Environment Variables

Required:

- `DATABASE_URL`

Optional production variables:

- `OPENAI_API_KEY`
- `AI_MODEL`
- `AI_MONTHLY_QUOTA`
- `BLOB_READ_WRITE_TOKEN`
- `RESEND_API_KEY`
- `ALERT_FROM_EMAIL`
- `CRON_SECRET`
- `HTML_SNAPSHOT_RETENTION_DAYS`

Validate locally with:

```bash
npm run validate:env
```

Validate production-required secrets before launch with:

```bash
npm run validate:production-env
```

Validate repository release wiring before launch with:

```bash
npm run release:readiness
```

Print the copy-safe provider setup handoff with:

```bash
npm run launch:handoff
```

See [ENVIRONMENT_MATRIX.md](ENVIRONMENT_MATRIX.md) for the full local, preview,
and production variable matrix. Use
[PROVIDER_LAUNCH_CHECKLIST.md](PROVIDER_LAUNCH_CHECKLIST.md) while configuring
the external provider accounts and secrets. See
[SECRET_OPERATIONS.md](SECRET_OPERATIONS.md) for internal secret generation and
rotation rules, and [PRODUCTION_LAUNCH_HANDOFF.md](PRODUCTION_LAUNCH_HANDOFF.md)
for the generated setup sheet.

## Database Release Flow

1. Provision PostgreSQL.
2. Set `DATABASE_URL`.
3. Run migrations:

```bash
npm run db:migrate:deploy
```

4. Generate Prisma client during build:

```bash
npx prisma generate
```

## Web Deployment

Use the default Next.js build:

```bash
npm ci
npm run check
```

The production app is served by:

```bash
npm run start
```

After deployment, run runtime smoke checks against the deployed URL:

```bash
SMOKE_TEST_TARGET_URL=https://app.example.com npm run smoke:test
```

## CDN, Domain, And SSL

- Serve the web app through the primary product domain, for example
  `app.allinoneseo.com`.
- Serve the install script through a CDN-backed script domain, for example
  `cdn.allinoneseo.com/seo.js`.
- Configure immutable cache headers for versioned static assets and short
  revalidation for the script bootstrap.
- Use managed SSL certificates from the hosting provider for app, API, share,
  and CDN domains.
- Keep custom report/share domains verified before routing traffic.

## Worker And Scheduled Jobs

The production worker model has two layers:

- Vercel Cron invokes scheduled HTTP entrypoints for low-frequency recurring work.
- Durable worker jobs in `worker_jobs` hold queued crawler, verification, report, and AI jobs for async workers.

The scheduled HTTP entrypoints are configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/jobs/evaluate-alerts",
      "schedule": "0 * * * *"
    },
    {
      "path": "/api/jobs/generate-scheduled-reports",
      "schedule": "15 9 * * *"
    },
    {
      "path": "/api/jobs/cleanup-snapshots",
      "schedule": "30 3 * * *"
    }
  ]
}
```

Set `CRON_SECRET` and send `Authorization: Bearer <CRON_SECRET>` for manual runs. Vercel Cron can be configured to include the secret header in production.

Worker split:

- crawler worker for crawl queue processing
- verification worker for DNS ownership checks
- reporting worker for scheduled report generation
- AI worker for long-running recommendation batches

Worker reliability rules:

- Claim jobs by type only while the running count is below `workerConcurrencyLimits`.
- Retry failed jobs with bounded exponential backoff.
- Move exhausted jobs to `DEAD_LETTER` after `maxAttempts`.
- Keep `lastError`, `lockedBy`, and timestamps for operations debugging.

## Storage Plan

Current implementation stores compact crawl metadata and recommendation output in PostgreSQL. Raw HTML snapshots are stored outside PostgreSQL:

- Set `BLOB_READ_WRITE_TOKEN` to store HTML snapshots in Vercel Blob.
- Local development falls back to `.storage/html-snapshots`.
- Set `HTML_SNAPSHOT_RETENTION_DAYS`, default `90`, to control cleanup.
- Store generated report PDFs in object storage and persist the key in `reports.pdfObjectKey`.
- Add lifecycle retention rules by plan.

## Release Checklist

- `npm run check` passes.
- `npm run release:readiness` passes.
- `npm run validate:production-env` passes in the production environment.
- `npm run db:migrate:deploy` has been run against the production database.
- `npm run verify:e2e:ready` passes anywhere authenticated browser checks will run.
- `SMOKE_TEST_TARGET_URL=<deployment-url> npm run smoke:test` passes after deployment.
- `npx prisma migrate status` is clean.
- `DATABASE_URL` points to production database.
- `CRON_SECRET` is set.
- Email and AI keys are configured or fallback behavior is accepted.
- The first admin user signs up and owns the initial workspace.

## GitHub Production Preflight

Run the manual `Production Preflight` workflow before promoting a release. It
validates production-required secrets, checks migration status, builds the app,
checks the configured app URL, and runs the vulnerability audit.

Required GitHub secrets:

- `PRODUCTION_DATABASE_URL`
- `CRON_SECRET`
- `BLOB_READ_WRITE_TOKEN`
- `INTEGRATION_ENCRYPTION_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `KEYWORD_PROVIDER_WEBHOOK_SECRET` if provider webhook imports are enabled.

Required GitHub variables:

- `NEXT_PUBLIC_APP_URL`
- `SMOKE_TEST_TARGET_URL`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_GROWTH`
- `STRIPE_PRICE_AGENCY`
- `STRIPE_PRICE_AGENCY_PRO`

## Rollback Process

1. Pause scheduled jobs if the incident is caused by crawlers, reports, or
   ingestion.
2. Promote the last healthy deployment from the hosting dashboard.
3. If a migration is involved, apply a forward-only repair migration. Do not
   manually edit production schema.
4. Re-run smoke checks for login, dashboard, domain verification, crawl queue,
   reports, and alerts.
5. Document the incident and add a regression test before the next release.

## Backups

- Enable daily managed PostgreSQL backups with point-in-time recovery.
- Keep at least 30 days of database recovery history for paid production plans.
- Enable object storage retention for HTML snapshots and report PDFs according
  to plan policy.
- Test restore into a non-production database at least monthly.

## Disaster Recovery

- Recovery time objective: restore the dashboard and read paths within 4 hours.
- Recovery point objective: lose no more than 24 hours of database writes.
- Store deployment secrets in the hosting provider, not in source control.
- Maintain a runbook with database restore, object storage restore, DNS switch,
  and cron re-enable steps.
- After failover, verify billing webhooks, OAuth callbacks, script ingestion,
  report sharing, and crawler workers.

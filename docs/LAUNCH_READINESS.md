# Launch Readiness

## Private Beta Checklist

- Production database, storage, cron jobs, and secrets are configured.
- Provider setup is tracked in
  [PROVIDER_LAUNCH_CHECKLIST.md](PROVIDER_LAUNCH_CHECKLIST.md).
- `npm run validate:production-env` passes with production secrets loaded.
- Manual `Production Preflight` GitHub workflow passes before promotion.
- Post-deploy smoke test passes with
  `SMOKE_TEST_TARGET_URL=<deployment-url> npm run smoke:test`.
- Signup, workspace creation, client management, domain verification, crawling,
  recommendations, reports, alerts, and billing flows are smoke-tested.
- Demo workspace is seeded with realistic synthetic data.
- Support inbox and escalation owner are assigned.
- Known limitations are documented for beta users.

## Security Review

- Authentication, password reset, email verification, rate limits, and lockout
  behavior are enabled.
- Mutating requests are same-origin protected.
- Integration secrets are encrypted at rest.
- Crawler SSRF protections are enabled.
- Dependency audit passes at moderate severity or higher.
- Cron endpoints require `CRON_SECRET` in production.

## Privacy Review

- Website script only collects allowlisted SEO/runtime fields.
- Personal form data is not collected.
- Raw HTML snapshot retention is documented by plan.
- Privacy policy covers script collection, crawler behavior, reports, and
  integrations.
- Preview environments use synthetic data.

## Billing Test

- Plan catalog is seeded.
- Stripe checkout creates or updates workspace subscriptions.
- Billing portal redirects correctly.
- Webhook signature validation is enabled.
- Domain, page, report, AI, and team-seat limits are enforced.

## Workflow Tests

- Onboarding: signup, create workspace, add client, add domain, verify, crawl.
- Agency: bulk import clients/domains, switch workspace, assign issues, publish reports.
- Crawler: scheduled enqueue, queue processing, failure retries, robots/sitemap handling.
- Reporting: template selection, scheduled generation, publish, white-label share URL.
- Alerting: rule creation, delivery channel configuration, test alert, escalation.

## Release Gate

- `npm run check` passes on the release branch.
- `npm run release:readiness` passes on the release branch.
- `npm run security:audit` passes at moderate severity or higher.
- `npx prisma migrate status` is clean against the target database.
- The install script route `/seo.js` is publicly reachable and returns script
  content, not an authenticated dashboard response.
- `/api/health` reports an operational database connection.
- The deployed app URL, OAuth callback URLs, Stripe webhook URL, and custom
  report domains match the production environment values.
- Scheduled cron endpoints reject unauthenticated requests and accept the
  configured `CRON_SECRET`.

## Launch Assets

- Launch site: concise product page with positioning, screenshots, pricing, and
  beta signup CTA.
- Onboarding emails: welcome, verify domain, install script, first crawl
  complete, weekly summary, trial ending.
- Support docs: local troubleshooting, verification, crawler behavior, reports,
  integrations, billing, and privacy/security FAQ.
- Demo workspace: agency workspace with multiple clients, verified domains,
  crawled pages, issues, recommendations, reports, and alerts.
- Sales/demo script: show agency dashboard, add domain, verify ownership, run
  crawl, generate recommendations, publish a report, and configure alerting.

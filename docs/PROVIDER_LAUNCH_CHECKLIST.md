# Provider Launch Checklist

Use this checklist when moving from local readiness to a real production launch.
Keep provider values in the hosting dashboard or GitHub secrets, never in source
control.

## Hosting And Database

- Generate the current setup sheet with `npm run launch:handoff`.
- Create the production Vercel project.
- Attach the production domain used by `NEXT_PUBLIC_APP_URL`.
- Provision managed PostgreSQL.
- Store the production connection string as `PRODUCTION_DATABASE_URL` in GitHub
  Actions and `DATABASE_URL` in the hosting environment.
- Run `npx prisma migrate deploy` against production.
- Run `npx prisma migrate status` against production and confirm it is clean.

## Storage, Jobs, And CDN

- Provision object storage and set `BLOB_READ_WRITE_TOKEN`.
- Generate `CRON_SECRET` with `npm run secret:generate -- cron base64`, then
  configure it in hosting and GitHub Actions.
- Confirm Vercel Cron is active for every route in `vercel.json`.
- Configure the script/CDN domain and set `NEXT_PUBLIC_SCRIPT_URL`.
- Confirm `/seo.js` is reachable without authentication.

## Billing

- Create live Stripe products and prices for Starter, Growth, Agency, and Agency
  Pro.
- Set `STRIPE_SECRET_KEY`.
- Set `STRIPE_WEBHOOK_SECRET`.
- Set `STRIPE_PRICE_STARTER`.
- Set `STRIPE_PRICE_GROWTH`.
- Set `STRIPE_PRICE_AGENCY`.
- Set `STRIPE_PRICE_AGENCY_PRO`.
- Configure the Stripe webhook endpoint:
  `/api/billing/stripe/webhook`.

## Integrations

- Create Google OAuth credentials and set `GOOGLE_CLIENT_ID` and
  `GOOGLE_CLIENT_SECRET`.
- Add Google callback URLs for Search Console and Analytics.
- Create Shopify app credentials and set `SHOPIFY_API_KEY`,
  `SHOPIFY_API_SECRET`, and `SHOPIFY_SCOPES`.
- Create Webflow app credentials and set `WEBFLOW_CLIENT_ID`,
  `WEBFLOW_CLIENT_SECRET`, and `WEBFLOW_SCOPES`.
- Generate `INTEGRATION_ENCRYPTION_KEY` with
  `npm run secret:generate -- encryption hex`.

## AI, Email, And Observability

- Set `OPENAI_API_KEY` and `AI_MODEL`.
- Set `RESEND_API_KEY` and `ALERT_FROM_EMAIL`.
- Set `ERROR_REPORTING_WEBHOOK_URL`.
- Set `SLOW_QUERY_THRESHOLD_MS`.
- Set `HTML_SNAPSHOT_RETENTION_DAYS`.

## Preflight And Smoke

- Run `npm run release:readiness` locally before pushing.
- Run the manual `Production Preflight` GitHub workflow.
- Run `SMOKE_TEST_TARGET_URL=<production-url> npm run smoke:test`.
- Sign up as the first admin and create the initial workspace.
- Seed or create the demo agency workspace.
- Run one verified-domain crawl and publish one test report.

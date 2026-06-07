# Environment Matrix

Use this matrix when configuring local, preview, and production environments.

## Required Everywhere

| Variable       | Local           | Preview           | Production            | Purpose                 |
| -------------- | --------------- | ----------------- | --------------------- | ----------------------- |
| `DATABASE_URL` | Docker Postgres | Preview branch DB | Managed production DB | Primary Prisma database |

## Production Services

| Variable                      | Preview                            | Production                  | Purpose                               |
| ----------------------------- | ---------------------------------- | --------------------------- | ------------------------------------- |
| `NEXT_PUBLIC_APP_URL`         | Preview URL                        | App domain                  | OAuth callback and absolute URL base  |
| `NEXT_PUBLIC_SCRIPT_URL`      | Preview/static script URL          | CDN script URL              | Install script source                 |
| `CRON_SECRET`                 | Required if cron routes are public | Required                    | Protect scheduled job endpoints       |
| `BLOB_READ_WRITE_TOKEN`       | Optional                           | Required for object storage | HTML snapshots and report assets      |
| `INTEGRATION_ENCRYPTION_KEY`  | Required for realistic testing     | Required                    | Encrypt integration secrets           |
| `ERROR_REPORTING_WEBHOOK_URL` | Optional                           | Recommended                 | Runtime error reporting               |
| `SLOW_QUERY_THRESHOLD_MS`     | Optional                           | Recommended                 | Prisma slow-query reporting threshold |

## AI And Email

| Variable           | Preview  | Production                | Purpose              |
| ------------------ | -------- | ------------------------- | -------------------- |
| `OPENAI_API_KEY`   | Optional | Recommended               | AI recommendations   |
| `AI_MODEL`         | Optional | Optional                  | Model override       |
| `AI_MONTHLY_QUOTA` | Optional | Optional                  | Local fallback quota |
| `RESEND_API_KEY`   | Optional | Required for email alerts | Alert delivery       |
| `ALERT_FROM_EMAIL` | Optional | Required for email alerts | Sender address       |

## OAuth And Commerce Integrations

| Variable                | Preview  | Production                       | Purpose            |
| ----------------------- | -------- | -------------------------------- | ------------------ |
| `GOOGLE_CLIENT_ID`      | Optional | Required for Google integrations | GSC/GA OAuth       |
| `GOOGLE_CLIENT_SECRET`  | Optional | Required for Google integrations | GSC/GA OAuth       |
| `SHOPIFY_API_KEY`       | Optional | Required for Shopify app         | Shopify OAuth      |
| `SHOPIFY_API_SECRET`    | Optional | Required for Shopify app         | Shopify OAuth      |
| `SHOPIFY_SCOPES`        | Optional | Required for Shopify app         | Shopify API scopes |
| `WEBFLOW_CLIENT_ID`     | Optional | Required for Webflow             | Webflow OAuth      |
| `WEBFLOW_CLIENT_SECRET` | Optional | Required for Webflow             | Webflow OAuth      |
| `WEBFLOW_SCOPES`        | Optional | Required for Webflow             | Webflow scopes     |

## Keyword Provider Imports

| Variable                          | Preview  | Production                                | Purpose                         |
| --------------------------------- | -------- | ----------------------------------------- | ------------------------------- |
| `KEYWORD_PROVIDER_NAME`           | Optional | Required when webhook imports are enabled | Provider label on imported rows |
| `KEYWORD_PROVIDER_WEBHOOK_SECRET` | Optional | Required when webhook imports are enabled | Protects keyword import API     |
| `KEYWORD_IMPORT_DEMO_MODE`        | Optional | Optional                                  | Synthetic demo import fallback  |

## Billing

| Variable                  | Preview             | Production          | Purpose              |
| ------------------------- | ------------------- | ------------------- | -------------------- |
| `STRIPE_SECRET_KEY`       | Test key            | Live key            | Stripe API           |
| `STRIPE_WEBHOOK_SECRET`   | Test webhook secret | Live webhook secret | Webhook verification |
| `STRIPE_PRICE_STARTER`    | Test price          | Live price          | Starter checkout     |
| `STRIPE_PRICE_GROWTH`     | Test price          | Live price          | Growth checkout      |
| `STRIPE_PRICE_AGENCY`     | Test price          | Live price          | Agency checkout      |
| `STRIPE_PRICE_AGENCY_PRO` | Test price          | Live price          | Agency Pro checkout  |

## Load Testing

| Variable                | Default                 | Purpose                       |
| ----------------------- | ----------------------- | ----------------------------- |
| `LOAD_TEST_TARGET_URL`  | `http://127.0.0.1:3003` | App base URL for load tests   |
| `LOAD_TEST_TARGET`      | `health`                | `health` or `ingestion`       |
| `LOAD_TEST_REQUESTS`    | `25`                    | Request count                 |
| `LOAD_TEST_CONCURRENCY` | `5`                     | Parallel workers              |
| `LOAD_TEST_SITE_ID`     | empty                   | Required for ingestion target |
| `SMOKE_TEST_TARGET_URL` | `http://127.0.0.1:3003` | Base URL for smoke checks     |

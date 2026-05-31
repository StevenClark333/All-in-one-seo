# API Surface

Most mutations currently use Next.js server actions. Public and scheduled HTTP routes are listed here.

## Scheduled Jobs

### `GET /api/jobs/evaluate-alerts`

Evaluates enabled alert rules against change events and records alert delivery history.

When `CRON_SECRET` is set, pass:

```http
Authorization: Bearer <CRON_SECRET>
```

## Public Reports

### `GET /share/reports/:shareToken`

Read-only report view for published reports.

### `GET /reports/:reportId/pdf`

Authenticated report PDF download.

## Website Script

### `GET /seo.js`

CDN-cacheable browser script. Install it with:

```html
<script
  async
  src="https://app.example.com/seo.js"
  data-site-id="DOMAIN_ID"
></script>
```

The script captures rendered SEO signals, SPA route changes, and Core Web Vitals without reading form, password, payment, or session-recording data.

### `POST /api/ingest/script-event`

Receives website script observations.

Requirements:

- `siteId` must match a known domain ID.
- `Origin`, `Referer`, or `pageUrl` must match the domain or a subdomain.
- Payloads are limited to 16 KB.
- Query strings and hash fragments are stripped before storage.
- Only allowlisted SEO fields are persisted.

## Shopify OAuth

### `GET /api/integrations/shopify/start`

Starts Shopify OAuth for a `myshopify.com` store. Query parameters:

- `shop`
- `domainId` optional

### `GET /api/integrations/shopify/callback`

Receives the Shopify OAuth callback, validates state and HMAC, exchanges the code for an Admin API token, and stores the connected shop as an integration.

## Webflow OAuth

### `GET /api/integrations/webflow/start`

Starts Webflow OAuth with the configured app client and requested scopes.

### `GET /api/integrations/webflow/callback`

Receives the Webflow OAuth callback, validates state, exchanges the code for an access token, imports accessible sites from `/v2/sites`, and stores the connection.

## Slack Alerts

Slack uses incoming webhook URLs stored through the integrations dashboard. Alert rules with channel `SLACK` use their rule-specific URL when present, otherwise they fall back to the workspace Slack integration.

## Vercel Deployment Checks

### `POST /api/integrations/vercel/webhook`

Receives Vercel deployment webhooks, verifies `x-vercel-signature`, records the deployment check, and queues a production recrawl for mapped domains when the deployment succeeds.

## Netlify Deployment Checks

### `POST /api/integrations/netlify/webhook`

Receives Netlify deploy notification webhooks, verifies `X-Webhook-Signature` JWS payloads, records the deployment check, and queues a production recrawl for mapped domains when the deploy succeeds.

## Automation Webhooks

Zapier and Make integrations store validated outgoing webhook URLs for no-code workflows. Dispatchers use a standard JSON payload with `source`, `provider`, `eventType`, `resourceId`, and `summary`.

## REST Boundary Guidance

Server actions own the authenticated dashboard workflows. Public, scheduled, webhook, OAuth, and shareable routes use explicit route handlers where stable HTTP contracts are required. Add new REST boundaries when an external integration, client SDK, or public workflow needs a versioned HTTP contract.

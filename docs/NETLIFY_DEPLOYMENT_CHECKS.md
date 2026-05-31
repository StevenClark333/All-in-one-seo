# Netlify Deployment Checks

Netlify deployment checks let All In One SEO react to Netlify deploy notifications. The integration stores a Netlify site ID, JWS webhook secret, and optional mapped domain. Incoming notifications are verified, recorded, and successful production deploys queue a system crawl for the mapped domain.

## Setup

1. Open **Integrations > Netlify deployment checks**.
2. Add the Netlify site ID and mapped All In One SEO domain.
3. Paste the JWS secret token configured in Netlify deploy notifications, or let All In One SEO generate one and copy it into Netlify.
4. Use this endpoint as the outgoing webhook URL:

```txt
https://app.example.com/api/integrations/netlify/webhook
```

In Netlify, configure deploy notifications under project deploy notification settings and choose outgoing webhook events such as deploy succeeded and deploy failed.

## Behavior

- Requires the `X-Webhook-Signature` header when a secret is configured.
- Verifies compact JWS signatures against the raw request body.
- Stores deployment event metadata in `deployment_checks`.
- Queues a `SYSTEM` crawl for successful production deploy events when a domain is mapped.

## Current Scope

- Site mapping UI.
- Webhook endpoint.
- JWS verification.
- Deployment event persistence.
- Production recrawl queueing.

## Next Netlify Work

- Pull failed deploy logs from the Netlify API.
- Add deploy notification creation through Netlify OAuth/token setup.
- Surface deployment-triggered crawl results on domain detail pages.

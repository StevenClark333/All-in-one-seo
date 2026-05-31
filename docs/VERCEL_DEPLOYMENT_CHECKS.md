# Vercel Deployment Checks

Vercel deployment checks let All In One SEO react when a connected project deploys. The integration stores a Vercel project ID, webhook secret, and optional mapped domain. Incoming webhooks are signature-verified, recorded, and successful production deploys queue a system crawl for the mapped domain.

## Setup

1. Open **Integrations > Vercel deployment checks**.
2. Add the Vercel project ID and mapped All In One SEO domain.
3. Paste the webhook secret Vercel gives you when creating the webhook, or let All In One SEO generate one and copy it into Vercel.
4. Use this endpoint as the Vercel webhook URL:

```txt
https://app.example.com/api/integrations/vercel/webhook
```

Create the webhook from Vercel CLI or dashboard with deployment events such as:

```bash
vercel webhooks create https://app.example.com/api/integrations/vercel/webhook --event deployment.created --event deployment.ready --event deployment.error --project prj_abc123
```

## Behavior

- Requires the `x-vercel-signature` header.
- Verifies the raw request body with the configured webhook secret.
- Stores deployment event metadata in `deployment_checks`.
- Queues a `SYSTEM` crawl for successful production deployment events when a domain is mapped.

## Current Scope

- Project mapping UI.
- Webhook endpoint.
- Signature verification.
- Deployment event persistence.
- Production recrawl queueing.

## Next Vercel Work

- Create webhooks through the Vercel REST API after OAuth/token setup.
- Register Vercel Checks back to the deployment.
- Pull build logs for failed deployments.
- Surface deployment-triggered crawl results on domain detail pages.

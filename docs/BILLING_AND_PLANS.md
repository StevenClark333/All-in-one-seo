# Billing And Plans

All In One SEO uses Stripe Billing as the production billing provider. Stripe handles hosted checkout, subscription lifecycle events, invoices, payment methods, and the customer portal. The app stores plan limits and workspace subscription state locally so product access can be enforced even when Stripe webhooks arrive asynchronously.

## Provider

- Provider: Stripe Billing
- Checkout: Stripe Checkout Sessions
- Subscription management: Stripe Customer Portal
- Webhooks: Stripe signed events
- Local records: `billing_plans` and `workspace_subscriptions`

## Plan Records

| Plan       |   Price | Domains |   Pages | Crawl  | AI/month | Seats | Reports/month | White label |
| ---------- | ------: | ------: | ------: | ------ | -------: | ----: | ------------: | ----------- |
| Starter    |  $29/mo |       1 |     500 | Weekly |      100 |     2 |             4 | No          |
| Growth     |  $99/mo |       5 |   5,000 | Daily  |      750 |     8 |            20 | No          |
| Agency     | $249/mo |      25 |  50,000 | Daily  |    3,000 |    20 |           100 | Yes         |
| Agency Pro | $599/mo |     100 | 250,000 | Daily  |   10,000 |    50 |           500 | Yes         |

## Trial Flow

The first billing slice supports a 14-day trial from the billing page:

1. User opens `/billing`.
2. User chooses a plan.
3. App creates or updates the workspace subscription as `TRIALING`.
4. App sets `trialEndsAt` and `currentPeriodEndsAt`.
5. App updates `workspace.plan` to the selected plan key.

## Checkout And Customer Portal

Checkout uses Stripe Checkout Sessions in subscription mode. Each plan can use either `billing_plans.stripePriceId` or the matching environment variable:

- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_GROWTH`
- `STRIPE_PRICE_AGENCY`
- `STRIPE_PRICE_AGENCY_PRO`

Subscription management and invoice access use Stripe Customer Portal once the workspace has a Stripe customer ID.

## Billing Webhooks

Stripe webhooks are received at:

```txt
https://app.example.com/api/billing/stripe/webhook
```

The route reads the raw request body and verifies the `Stripe-Signature` header with `STRIPE_WEBHOOK_SECRET`.

Handled events:

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Plan Enforcement

The billing layer now exposes shared guards for product limits:

- Domain creation checks `domainLimit`.
- Manual crawl starts check the domain page count against `pageCrawlLimit`.
- Domain crawl cadence checks `crawlFrequency`.
- AI generation checks monthly usage against `aiRecommendationLimit`.
- Report generation and scheduling check monthly reports against `reportLimit`.
- Team seat limit has a shared guard ready for the invitation flow.

The billing page shows current usage for domains, pages, AI recommendations, team seats, and reports with upgrade prompts when usage reaches 80% of the plan limit.

## Next Billing Work

- Add team invitation UI that calls the team seat guard.

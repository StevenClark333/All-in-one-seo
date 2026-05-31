# Shopify App

The Shopify integration connects stores through Shopify OAuth and stores the offline Admin API access token in the integration record. It supports Shopify-specific SEO checks, product/category metadata audits, and the foundation for theme or app-block installation workflows.

## Environment

```txt
SHOPIFY_API_KEY=""
SHOPIFY_API_SECRET=""
SHOPIFY_SCOPES="read_content,read_products"
NEXT_PUBLIC_APP_URL="https://app.example.com"
```

Use the app callback URL:

```txt
https://app.example.com/api/integrations/shopify/callback
```

## Flow

1. Agency enters a `myshopify.com` store on the integrations page.
2. All In One SEO validates the store domain and starts OAuth.
3. Shopify redirects to `/api/integrations/shopify/callback`.
4. All In One SEO validates OAuth state and Shopify HMAC.
5. All In One SEO exchanges the code for an Admin API access token.
6. The store connection is saved as a `SHOPIFY` integration and can be mapped to a monitored domain.

## Current Scope

- OAuth install start route.
- OAuth callback route.
- HMAC verification.
- Store-domain normalization.
- Integration record storage.
- Dashboard install form and connected-store list.

## Next Shopify Work

- Register required Shopify webhooks.
- Import product, collection, and blog URLs for crawl seeding.
- Detect missing product meta titles/descriptions.
- Recommend product schema and collection-page internal links.
- Add app proxy or theme app extension support for script installation.

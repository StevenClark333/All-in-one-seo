# Webflow Integration

The Webflow integration connects agency Webflow accounts through OAuth, imports accessible sites, and maps Webflow custom domains to monitored All In One SEO domains.

## Environment

```txt
WEBFLOW_CLIENT_ID=""
WEBFLOW_CLIENT_SECRET=""
WEBFLOW_SCOPES="sites:read pages:read cms:read"
NEXT_PUBLIC_APP_URL="https://app.example.com"
```

Use this callback URL in the Webflow app settings:

```txt
https://app.example.com/api/integrations/webflow/callback
```

## Flow

1. Agency starts OAuth from the integrations dashboard.
2. All In One SEO sends the user to Webflow with `response_type=code`, requested scopes, redirect URI, and CSRF state.
3. Webflow redirects back to `/api/integrations/webflow/callback`.
4. All In One SEO validates the state, exchanges the code for an access token, and imports `/v2/sites`.
5. Agency maps imported Webflow sites to monitored domains.

## Current Scope

- OAuth start route.
- OAuth callback route.
- CSRF state cookie.
- Access-token exchange.
- Sites import from the Webflow Data API.
- Dashboard mapping from Webflow custom domains to monitored domains.

## Next Webflow Work

- Import Webflow pages and CMS collection item URLs as crawl seeds.
- Read page-level SEO settings where API coverage allows it.
- Add custom-code installation guidance for `/seo.js`.
- Detect unmapped custom domains and unpublished site changes.

# Cache Strategy

The app uses conservative caching because most dashboard data is workspace-specific and changes after crawls, reports, alerts, or user actions.

## Policies

- Dashboard and authenticated app routes: dynamic rendering, fresh database reads, and explicit `revalidatePath` after mutations.
- Script ingestion, provider webhooks, and scheduled jobs: `Cache-Control: no-store`.
- Monitoring script at `/seo.js`: CDN cacheable for one hour with stale revalidation.
- Public reports: cacheable briefly once published, but should be invalidated when report publishing changes.
- Static assets: long-lived immutable caching.

## Central Policy

Shared cache headers live in `src/lib/cache-policy.ts`.

## Operational Notes

- Keep SEO dashboard pages dynamic until workspace-aware data cache tagging is introduced.
- Prefer targeted `revalidatePath` after mutations over broad cache clearing.
- Do not cache webhook responses or script ingestion responses.

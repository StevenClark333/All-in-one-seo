# Database Schema

The application uses Prisma with PostgreSQL. The canonical schema is `prisma/schema.prisma`.

## Core Tenancy

- `users`: account identity and optional password hash.
- `auth_sessions`: hashed session tokens with expiry.
- `workspaces`: business or agency tenant boundary.
- `workspace_members`: user membership and role.
- `audit_logs`: important account/workspace events.

## Agency Model

- `clients`: agency-managed client accounts.
- `domains`: verified sites owned by a workspace, optionally attached to a client.
- `domain_verifications`: DNS TXT, HTML file, meta tag, and Google Search Console verification tokens and status.
- `domain_verification_checks`: verification attempt history and retry audit trail.

## Crawl And SEO Data

- `crawl_runs`: crawl execution status and summary counters.
- `crawl_artifacts`: robots.txt and sitemap snapshots.
- `pages`: discovered pages per domain.
- `page_snapshots`: crawl-time metadata such as title, meta description, H1, canonical, robots directive, and content hash.
- `page_links`: internal link graph and link status.
- `change_events`: tracked SEO field changes between snapshots.
- `site_scores`: historical domain score records.
- `rendered_page_captures`: rendered crawl metadata, DOM/screenshot object keys, and visual diff baseline records.

## Workflow

- `seo_issues`: analyzer findings with severity, status, owner, and recommendation text.
- `seo_issue_notes`: internal and client-visible issue comments.
- `seo_recommendations`: AI-generated title, meta, H1, schema, internal linking, content gap, explanation, and fix brief output cached by input hash.
- `ai_usage_events`: workspace AI usage and quota tracking.

## Reporting And Alerts

- `reports`: generated client/domain reports, publish state, share token, PDF object key, and schedule/template relationships.
- `alert_rules`: alert routing rules by workspace, client, or domain.
- `alerts`: alert delivery history tied to change events.

## Integrations And Script Events

- `integrations`: external provider configuration for analytics, search, alerts, deployment checks, automation, and CMS/storefront providers.
- `script_events`: privacy-safe website script observations from rendered pages, SPA route changes, and Core Web Vitals.

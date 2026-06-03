# All In One SEO Production Task List

This document is the execution source of truth for building the complete production SaaS product.

Use `PRODUCT_REQUIREMENTS.md` for product scope and decisions. Use this file to track implementation progress.

Status legend:

- `[ ]` Not started
- `[~]` In progress
- `[x]` Done
- `[!]` Blocked

## 0. Execution Batches

Work should move through these batches in order. At the start of each batch, reread this document and `PRODUCT_REQUIREMENTS.md`, then update this file as tasks are completed.

### Batch 1: Core Agency Operating Model

- [x] Workspace creation.
- [x] Client list and create flow.
- [x] Domain list and add flow.
- [x] DNS TXT verification token and check flow.
- [x] First crawler job boundary.
- [x] First SEO analyzer rule set.
- [x] Database-backed issue list.
- [x] Issue detail and workflow actions.
- [x] Basic change detection.

### Batch 2: Crawl Intelligence

- [x] Persist internal links.
- [x] Build internal link graph.
- [x] Count incoming and outgoing internal links.
- [x] Detect orphan pages.
- [x] Detect broken internal links.
- [x] Add sitemap discovery.
- [x] Add robots.txt fetch and parser.
- [x] Respect robots.txt by default.
- [x] Add crawl limits by depth/page count.
- [x] Add crawl cancellation.

### Batch 3: SEO Rules And Scoring

- [x] Add duplicate title and meta checks.
- [x] Add weak title and meta checks.
- [x] Add multiple H1 and heading hierarchy checks.
- [x] Add broken canonical checks.
- [x] Add robots blocked checks.
- [x] Add sitemap checks.
- [x] Add thin content and missing image alt checks.
- [x] Implement site score calculation.
- [x] Store score history.
- [x] Explain score changes.

### Batch 4: Agency Workflow Depth

- [x] Add issue filters.
- [x] Add issue grouping by template.
- [x] Add bulk issue actions.
- [x] Add ignored issue rules.
- [x] Add issue activity timeline.
- [x] Add client detail page.
- [x] Add domain detail page.
- [x] Add pages table.
- [x] Add page detail page.

### Batch 5: Reporting And Alerts

- [x] Build report generation service.
- [x] Build report list and detail pages.
- [x] Add shareable report links.
- [x] Add PDF generation.
- [x] Add alert rule UI.
- [x] Add alert evaluation service.
- [x] Send critical email alerts.
- [x] Add alert delivery history.

### Batch 6: Authentication, Authorization, And Security

- [x] Choose auth provider.
- [x] Implement signup/login/logout.
- [x] Implement sessions and protected routes.
- [x] Enforce workspace-scoped access.
- [x] Add role authorization helpers.
- [x] Add SSRF protection for crawler.
- [x] Prevent crawling private/internal IP ranges.
- [x] Add audit logs.
- [x] Add security tests.

### Batch 7: AI And Recommendations

- [x] Choose AI provider/model.
- [x] Add AI client wrapper.
- [x] Add AI usage tracking and quotas.
- [x] Generate title, meta, and H1 suggestions.
- [x] Generate issue explanations.
- [x] Generate developer fix briefs.
- [x] Generate CMS-specific fix briefs.
- [x] Cache repeated recommendations.

### Batch 8: Production Hardening

- [x] Add tests.
- [x] Add CI.
- [x] Add formatting and pre-commit hooks.
- [x] Add environment validation.
- [x] Add logging and error reporting.
- [x] Add deployment guide.
- [x] Configure production database/storage.
- [x] Configure web and worker deployments.

## 1. Product And Planning

- [x] Create product requirements document.
- [x] Define MVP vs complete SaaS product scope.
- [x] Define agency-level product model.
- [x] Define production task list.
- [x] Define product name, verification TXT namespace, and public-facing copy.
- [x] Define final pricing tiers and usage limits.
- [x] Define private beta launch criteria.
- [x] Define public launch criteria.
- [x] Define customer onboarding checklist.
- [x] Define support and escalation process.
- [x] Define data retention policy.
- [x] Define legal pages: Terms, Privacy Policy, DPA, subprocessors.

## 2. Project Foundation

- [x] Scaffold Next.js App Router project.
- [x] Add TypeScript.
- [x] Add Tailwind CSS.
- [x] Add ESLint.
- [x] Add Geist font setup.
- [x] Add base agency dashboard shell.
- [x] Add in-app product requirements route.
- [x] Add README setup instructions.
- [x] Add local Docker PostgreSQL service.
- [x] Add Prisma.
- [x] Add Prisma PostgreSQL schema.
- [x] Add initial database migration.
- [x] Add seed script.
- [x] Add lazy Prisma client wrapper.
- [x] Replace dashboard seed arrays with database-backed reads.
- [x] Add formatting tool such as Prettier.
- [x] Add pre-commit hooks.
- [x] Add CI workflow for lint, typecheck, build, and tests.
- [x] Add environment variable validation.
- [x] Add app-wide error boundary.
- [x] Add app-wide loading states.
- [x] Add app-wide empty states.
- [x] Add production logging strategy.
- [x] Add monitoring and error reporting.

## 3. Authentication

- [x] Choose authentication provider.
- [x] Implement signup.
- [x] Implement login.
- [x] Implement logout.
- [x] Implement email verification.
- [x] Implement password reset.
- [x] Implement session management.
- [x] Implement protected routes.
- [x] Implement onboarding redirect after signup.
- [x] Add auth-related tests.
- [x] Add rate limiting for auth endpoints.
- [x] Add account lockout or abuse protection.
- [x] Add future SSO support path.

## 4. Workspace And Roles

- [x] Add workspace data model.
- [x] Add workspace member data model.
- [x] Add role enum.
- [x] Build workspace creation flow.
- [x] Build business workspace onboarding.
- [x] Build agency workspace onboarding.
- [x] Build workspace switcher.
- [x] Build team invitation flow.
- [x] Build team member management screen.
- [x] Enforce workspace-scoped database access.
- [x] Add role-based authorization helpers.
- [x] Add authorization tests.
- [x] Add audit log model.
- [x] Track workspace member activity.

## 5. Agency Client Management

- [x] Add client data model.
- [x] Add agency dashboard shell.
- [x] Build clients list page.
- [x] Build create client flow.
- [x] Build edit client flow.
- [x] Build archive/delete client flow.
- [x] Add client detail page.
- [x] Add client notes.
- [x] Add client contact fields.
- [x] Add client logo upload.
- [x] Add client health summary.
- [x] Add client-level issue summary.
- [x] Add client-level report summary.
- [x] Add client-level crawl settings.
- [x] Add bulk client import.
- [x] Add client tags or groups.

## 6. Domain Management

- [x] Add domain data model.
- [x] Build domain list page.
- [x] Build add domain flow.
- [x] Build edit domain settings.
- [x] Build assign domain to client flow.
- [x] Build platform selection: WordPress, Shopify, Webflow, Wix, Squarespace, Custom, Unknown.
- [x] Normalize domains and URLs.
- [x] Prevent duplicate domains per workspace.
- [x] Add domain archive/delete flow.
- [x] Add domain health summary.
- [x] Add crawl frequency controls.
- [x] Add plan-based domain limits.
- [x] Add bulk domain import.

## 7. Domain Verification

- [x] Add domain verification data model.
- [x] Generate DNS TXT verification token.
- [x] Build verification instructions UI.
- [x] Build DNS TXT check service.
- [x] Build manual "check verification" action.
- [x] Add verification expiry.
- [x] Add verification retry logic.
- [x] Add verification status history.
- [x] Block full crawls for unverified domains.
- [x] Add HTML file verification.
- [x] Add meta tag verification.
- [x] Add Google Search Console verification.
- [x] Add verification tests.

## 8. Crawler Foundation

- [x] Add crawl run data model.
- [x] Add page data model.
- [x] Add page snapshot data model.
- [x] Choose queue system.
- [x] Add crawl job queue.
- [x] Add crawler worker process.
- [x] Build manual crawl trigger.
- [x] Build scheduled crawl trigger.
- [x] Build homepage fetcher.
- [x] Build URL normalization.
- [x] Build internal link discovery.
- [x] Build sitemap discovery.
- [x] Build robots.txt fetch and parser.
- [x] Respect robots.txt by default.
- [x] Add domain crawl rate limiting.
- [x] Add crawl depth limits.
- [x] Add page count limits by plan.
- [x] Add timeout and retry behavior.
- [x] Add failed URL tracking.
- [x] Store crawl run progress.
- [x] Store crawl run errors.
- [x] Add crawl cancellation.
- [x] Add crawler tests.

## 9. Rendered Crawling

- [x] Add Playwright worker support.
- [x] Add rendered crawl fallback.
- [x] Detect JavaScript-heavy pages.
- [x] Capture rendered title/meta/headings/canonical.
- [x] Capture rendered DOM snapshot reference.
- [x] Add browser pool management.
- [x] Add rendered crawl timeout controls.
- [x] Add rendered crawl plan limits.
- [x] Add screenshot capture for selected pages.
- [x] Add visual diff foundation.

## 10. SEO Analyzer

- [x] Add SEO issue data model.
- [x] Build analyzer pipeline.
- [x] Add rule registry.
- [x] Add missing title rule.
- [x] Add duplicate title rule.
- [x] Add weak title rule.
- [x] Add missing meta description rule.
- [x] Add duplicate meta description rule.
- [x] Add weak meta description rule.
- [x] Add missing H1 rule.
- [x] Add multiple H1 rule.
- [x] Add heading hierarchy rule.
- [x] Add missing canonical rule.
- [x] Add broken canonical rule.
- [x] Add canonical points to non-200 rule.
- [x] Add noindex detection rule.
- [x] Add robots blocked page rule.
- [x] Add 4xx internal link rule.
- [x] Add 5xx page rule.
- [x] Add redirect chain rule.
- [x] Add sitemap unavailable rule.
- [x] Add malformed sitemap rule.
- [x] Add robots.txt unavailable or malformed rule.
- [x] Add thin content rule.
- [x] Add missing image alt rule.
- [x] Add missing schema suggestion.
- [x] Add duplicate content clustering.
- [x] Add hreflang checks.
- [x] Add pagination checks.
- [x] Add ecommerce-specific checks.
- [x] Add analyzer tests.

## 11. Template And Pattern Detection

- [x] Build URL-pattern grouping.
- [x] Build page template model or inferred template field.
- [x] Detect blog templates.
- [x] Detect product templates.
- [x] Detect category/collection templates.
- [x] Detect docs templates.
- [x] Group repeated issues by template.
- [x] Add template-level issue view.
- [x] Add template-level priority scoring.
- [x] Add template-level AI fix briefs.

## 12. Site Scoring

- [x] Define scoring formula.
- [x] Implement site score calculation.
- [x] Weight critical issues.
- [x] Weight warning issues.
- [x] Weight page importance.
- [x] Weight crawl coverage.
- [x] Weight indexability.
- [x] Weight sitemap health.
- [x] Weight internal link health.
- [x] Store score history.
- [x] Show why score changed.
- [x] Add score calculation tests.

## 13. Change Detection

- [x] Add change event data model.
- [x] Compare latest crawl to previous crawl.
- [x] Detect title changes.
- [x] Detect meta description changes.
- [x] Detect H1 changes.
- [x] Detect canonical changes.
- [x] Detect robots directive changes.
- [x] Detect indexability changes.
- [x] Detect status code changes.
- [x] Detect schema changes.
- [x] Detect internal link changes.
- [x] Detect sitemap changes.
- [x] Detect robots.txt changes.
- [x] Detect template-level regressions.
- [x] Add change severity classification.
- [x] Add change history UI.
- [x] Add change detection tests.

## 14. Internal Link Graph

- [x] Store extracted links.
- [x] Build internal link graph.
- [x] Count incoming internal links.
- [x] Count outgoing internal links.
- [x] Detect orphan pages.
- [x] Detect deep pages.
- [x] Detect sitemap URLs not internally linked.
- [x] Detect internally linked URLs missing from sitemap.
- [x] Detect broken internal links.
- [x] Add internal link opportunities.
- [x] Add internal link graph UI.

## 15. Issue Workflow

- [x] Add issue status model.
- [x] Add issue assignment model.
- [x] Build issue list page.
- [x] Build issue detail page.
- [x] Add filters by client, domain, severity, status, assignee, type, date.
- [x] Add issue grouping by template.
- [x] Add issue lifecycle actions.
- [x] Add issue assignment UI.
- [x] Add internal notes.
- [x] Add client-visible notes.
- [x] Add bulk issue actions.
- [x] Reopen fixed issues when they reappear.
- [x] Add ignored issue rules.
- [x] Add issue activity timeline.
- [x] Add issue workflow tests.

## 16. Dashboard UI

- [x] Build first agency dashboard shell.
- [x] Read agency stats from database.
- [x] Read client sites from database.
- [x] Read priority issues from database.
- [x] Build business dashboard variant.
- [x] Build agency all-sites dashboard.
- [x] Build clients page.
- [x] Build sites page.
- [x] Build domain detail page.
- [x] Build pages table.
- [x] Build page detail page.
- [x] Build technical audit page.
- [x] Build content recommendations page.
- [x] Build alerts page.
- [x] Build reports page.
- [x] Build settings page.
- [x] Add responsive navigation.
- [x] Add mobile layout.
- [x] Add loading skeletons.
- [x] Add empty states.
- [x] Add error states.
- [x] Add accessibility pass.

## 17. AI Recommendations

- [x] Add recommendation data model.
- [x] Choose AI provider/model.
- [x] Add AI client wrapper.
- [x] Add AI usage tracking.
- [x] Add AI quota enforcement.
- [x] Generate title suggestions.
- [x] Generate meta description suggestions.
- [x] Generate H1 suggestions.
- [x] Generate issue explanations.
- [x] Generate developer fix briefs.
- [x] Generate CMS-specific fix briefs.
- [x] Generate schema recommendations.
- [x] Generate internal linking recommendations.
- [x] Generate content gap analysis.
- [x] Store AI input hash.
- [x] Cache repeated recommendations.
- [x] Add AI safety and quality checks.
- [x] Add AI tests with mocked provider.

## 18. Reports

- [x] Add report data model.
- [x] Build report generation service.
- [x] Build report list page.
- [x] Build report detail page.
- [x] Add report period selection.
- [x] Add health score section.
- [x] Add new issues section.
- [x] Add fixed issues section.
- [x] Add priority recommendations section.
- [x] Add crawl summary section.
- [x] Add change summary section.
- [x] Add agency branding.
- [x] Add client branding.
- [x] Generate PDF reports.
- [x] Generate shareable report links.
- [x] Add report publishing flow.
- [x] Add scheduled report generation.
- [x] Add custom report templates.
- [x] Add white-label custom domain.

## 19. Alerts

- [x] Add alert rule data model.
- [x] Add alert event data model.
- [x] Build alert rule UI.
- [x] Build alert evaluation service.
- [x] Send email alert for page down.
- [x] Send email alert for important page noindex.
- [x] Send email alert for robots.txt blocking.
- [x] Send email alert for sitemap failure.
- [x] Add Slack alerts.
- [x] Add webhook alerts.
- [x] Add Microsoft Teams alerts.
- [x] Add alert routing.
- [x] Add alert escalation.
- [x] Add alert delivery history.
- [x] Add alert tests.

## 20. Website Script And Ingestion

- [x] Add script event data model.
- [x] Design CDN script API.
- [x] Build lightweight script.
- [x] Host script on CDN.
- [x] Add site ID validation.
- [x] Add origin/domain validation.
- [x] Add ingestion endpoint.
- [x] Add ingestion rate limits.
- [x] Capture rendered title/meta/canonical.
- [x] Capture headings.
- [x] Capture schema presence.
- [x] Capture SPA route changes.
- [x] Capture Core Web Vitals.
- [x] Add privacy redaction controls.
- [x] Avoid form, password, payment, and personal data collection.
- [x] Add script install status detection.
- [x] Add script documentation.

## 21. Integrations

- [x] Add integration data model.
- [x] Add integration settings UI.
- [x] Add Google Search Console OAuth.
- [x] Import GSC sites.
- [x] Map GSC property to domain.
- [x] Import clicks, impressions, CTR, position.
- [x] Use GSC data for page importance.
- [x] Add Google Analytics integration.
- [x] Add WordPress plugin.
- [x] Add Shopify app.
- [x] Add Webflow integration.
- [x] Add Slack integration.
- [x] Add Vercel deployment checks.
- [x] Add Netlify deployment checks.
- [x] Add Zapier or Make integration.
- [x] Add WordPress contextual internal-link application from Fix Center.
- [x] Add WordPress plugin ZIP packaging and portal download.
- [x] Add generated WordPress receiver API keys.
- [x] Add WordPress receiver test action.
- [x] Add WordPress per-domain onboarding checklist.
- [x] Require passed WordPress receiver test before Fix Center delivery.
- [x] Explain unavailable WordPress receivers in Fix Center.
- [x] Add copy-friendly WordPress install values for App URL, Site ID, receiver key, receiver endpoint, and callback URL.

## 22. Billing And Plans

- [x] Choose billing provider.
- [x] Define plan records.
- [x] Add billing page.
- [x] Add trial flow.
- [x] Add checkout.
- [x] Add subscription management.
- [x] Add invoices.
- [x] Enforce domain limits.
- [x] Enforce page crawl limits.
- [x] Enforce crawl frequency limits.
- [x] Enforce AI usage limits.
- [x] Enforce team seat limits.
- [x] Enforce report limits.
- [x] Add usage dashboard.
- [x] Add upgrade prompts.
- [x] Add billing webhooks.

## 23. Security

- [x] Add workspace isolation tests.
- [x] Add client portal isolation tests.
- [x] Add role authorization tests.
- [x] Add SSRF protection for crawler.
- [x] Add URL validation for crawler.
- [x] Prevent crawling private/internal IP ranges.
- [x] Add crawler user agent.
- [x] Add request rate limits.
- [x] Encrypt integration tokens.
- [x] Add audit logs.
- [x] Add secure headers.
- [x] Add CSRF protection where needed.
- [x] Add API payload size limits.
- [x] Add script ingestion abuse protection.
- [x] Add vulnerability scanning.
- [x] Add dependency update process.

## 24. Performance And Reliability

- [x] Add background worker deployment strategy.
- [x] Add queue retry policy.
- [x] Add dead-letter queue.
- [x] Add crawler concurrency controls.
- [x] Add database indexes review.
- [x] Add query performance monitoring.
- [x] Add object storage for HTML snapshots.
- [x] Add snapshot retention cleanup.
- [x] Add cache strategy.
- [x] Add production logging.
- [x] Add uptime checks.
- [x] Add error tracking.
- [x] Add performance budgets.
- [x] Add load testing for crawler and ingestion.

## 25. Testing

- [x] Add unit test framework.
- [x] Add component test strategy.
- [x] Add integration test strategy.
- [x] Add end-to-end test strategy.
- [x] Test workspace creation.
- [x] Test client CRUD.
- [x] Test domain CRUD.
- [x] Test domain verification.
- [x] Test crawler URL normalization.
- [x] Test robots.txt handling.
- [x] Test sitemap parsing.
- [x] Test SEO analyzer rules.
- [x] Test change detection.
- [x] Test issue workflow.
- [x] Test AI recommendation service with mocks.
- [x] Test report generation.
- [x] Test alert delivery with mocks.
- [x] Test authorization boundaries.
- [x] Add visual regression tests for key dashboard screens.

## 26. Deployment

- [x] Choose hosting provider.
- [x] Configure production database.
- [x] Configure preview database strategy.
- [x] Configure production object storage.
- [x] Configure environment variables.
- [x] Configure web app deployment.
- [x] Configure worker deployment.
- [x] Configure scheduled jobs.
- [x] Configure CDN for script.
- [x] Configure custom domain.
- [x] Configure SSL.
- [x] Configure deployment checks.
- [x] Configure rollback process.
- [x] Configure backups.
- [x] Configure disaster recovery plan.

## 27. Documentation

- [x] Add README.
- [x] Add PRD.
- [x] Add production task list.
- [x] Add architecture overview.
- [x] Add database schema documentation.
- [x] Add local development guide.
- [x] Add deployment guide.
- [x] Add crawler behavior documentation.
- [x] Add domain verification documentation.
- [x] Add website script documentation.
- [x] Add agency onboarding guide.
- [x] Add client portal guide.
- [x] Add API documentation.
- [x] Add troubleshooting guide.

## 28. Launch Readiness

- [x] Complete private beta checklist.
- [x] Complete security review.
- [x] Complete privacy review.
- [x] Complete billing test.
- [x] Complete onboarding test.
- [x] Complete agency workflow test.
- [x] Complete crawler reliability test.
- [x] Complete reporting workflow test.
- [x] Complete alerting workflow test.
- [x] Prepare launch site.
- [x] Prepare onboarding emails.
- [x] Prepare support docs.
- [x] Prepare demo workspace.
- [x] Prepare sales/demo script.

## 29. Current Next Tasks

These are the recommended immediate next steps.

- [x] Build workspace creation flow.
- [x] Build clients list and create client flow.
- [x] Build domains list and add domain flow.
- [x] Build DNS TXT verification token generation.
- [x] Build DNS TXT verification check service.
- [x] Build first crawler job boundary.
- [x] Build first SEO analyzer rule set.
- [x] Build issue list page using database data.

## 30. Release Gate Hardening

These checks keep the completed production build shippable.

- [x] Add production environment validation command.
- [x] Document local, preview, and production environment variables.
- [x] Add manual GitHub production preflight workflow.
- [x] Add deployed-app smoke test command.
- [x] Verify `/seo.js` is public and not blocked by authentication.
- [x] Add launch-readiness release gate documentation.
- [x] Run local smoke test against the development server.
- [x] Run full project check after release-gate changes.
- [x] Run dependency security audit.

## 31. Launch Execution Guardrails

These checks keep launch operations repeatable as provider configuration begins.

- [x] Add local release-readiness audit command.
- [x] Check release package scripts from the audit command.
- [x] Check Vercel cron route coverage from the audit command.
- [x] Check production preflight workflow steps from the audit command.
- [x] Check release docs from the audit command.
- [x] Check source-of-truth task list from the audit command.
- [x] Document release-readiness command in deployment and launch docs.

## 32. Provider Launch Setup

These checks prepare the handoff from local code readiness to external provider
configuration.

- [x] Add provider launch checklist.
- [x] Link provider checklist from deployment docs.
- [x] Link provider checklist from launch readiness docs.
- [x] Link provider checklist from README.
- [x] Export environment variable lists for tooling reuse.
- [x] Check `.env.example` coverage from release-readiness audit.
- [x] Check provider checklist from release-readiness audit.

## 33. Secret Operations

These checks make production secret setup and rotation repeatable.

- [x] Add internal secret generation command.
- [x] Generate `INTEGRATION_ENCRYPTION_KEY` compatible values.
- [x] Generate `CRON_SECRET` compatible values.
- [x] Add secret operations documentation.
- [x] Link secret operations from deployment docs.
- [x] Link secret operations from provider launch checklist.
- [x] Check secret generation script from release-readiness audit.

## 34. Production Launch Handoff

These checks make external provider setup copy-safe and repeatable.

- [x] Add generated production launch handoff command.
- [x] Include production-required environment variable names in the handoff.
- [x] Include GitHub Actions secrets and variables in the handoff.
- [x] Include OAuth callback URLs in the handoff.
- [x] Include billing and deployment webhook URLs in the handoff.
- [x] Document production launch handoff usage.
- [x] Link handoff from deployment docs, README, and provider checklist.
- [x] Check handoff script and docs from release-readiness audit.

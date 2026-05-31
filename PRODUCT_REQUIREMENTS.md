# All In One SEO SaaS Product Requirements

## 1. Product Summary

All In One SEO is a standalone SaaS platform for businesses, agencies, and technical SEO teams to continuously monitor, audit, optimize, and report on websites from one dashboard.

The product helps users connect a website, verify ownership, crawl and analyze SEO health, monitor changes over time, generate prioritized fixes, and produce client-ready reports.

The agency tier extends the product into a multi-client SEO operations dashboard where teams can manage many domains, assign issues, monitor regressions, and deliver branded reports.

## 2. Positioning

### Core Positioning

All In One SEO is a continuous SEO monitoring and optimization platform for websites that cannot afford silent SEO regressions.

### Agency Positioning

A white-label SEO operations dashboard for agencies managing multiple client websites.

### Primary Promise

We tell users what changed, what broke, why it matters, and exactly what to fix next.

### Product Naming And Copy Source

The working product name, verification TXT namespace, pricing tiers, launch criteria, onboarding checklist, support process, data retention policy, and legal page requirements live in `docs/PRODUCT_OPERATIONS.md`.

## 3. Target Customers

### Primary Customers

- SEO agencies managing multiple client websites
- SaaS companies with marketing websites and content libraries
- Ecommerce businesses with large product/category structures
- In-house marketing teams responsible for organic growth
- Technical SEO consultants

### Secondary Customers

- Web development agencies
- Freelance SEO specialists
- Content teams managing blogs or knowledge bases
- Website owners who need automated SEO monitoring

## 4. Product Goals

- Verify domain ownership securely.
- Crawl and analyze websites on a recurring schedule.
- Detect technical SEO issues across pages and templates.
- Track SEO-relevant changes between crawls.
- Prioritize issues by severity, page importance, and site impact.
- Generate actionable recommendations for technical and content fixes.
- Help agencies manage many client websites from one dashboard.
- Produce branded reports that agencies can share with clients.
- Support future integrations with Google Search Console, Google Analytics, CMS platforms, and alerting tools.

## 5. Non-Goals For MVP

- Keyword rank tracking.
- Backlink monitoring.
- Full content planning suite.
- Automated publishing to CMS platforms.
- Full Google Search Console parity.
- Large-scale enterprise crawler features such as billions of URLs.
- Replacing specialist SEO tools entirely in version one.

## 6. Product Tiers

### Solo / Business

For one company managing its own website.

Core capabilities:

- One or more domains depending on plan.
- Domain verification.
- Scheduled crawling.
- SEO issue dashboard.
- Page-level recommendations.
- Change monitoring.
- Basic alerts.

### Agency

For teams managing multiple client websites.

Core capabilities:

- Multiple client workspaces.
- Multiple domains per client.
- Global all-sites dashboard.
- Cross-client issue prioritization.
- Team member assignment.
- Client portals.
- White-label reporting.
- Bulk recrawls and exports.
- Agency-level alerting.

## 7. Core User Flows

### 7.1 Account And Workspace Creation

1. User signs up.
2. User creates or joins a workspace.
3. User selects workspace type:
   - Business
   - Agency
4. User invites team members if needed.
5. User proceeds to add a domain.

### 7.2 Agency Client Setup

1. Agency user creates a client.
2. Agency enters client name, optional logo, contact email, and notes.
3. Agency adds one or more domains under the client.
4. Agency configures crawl limits, report frequency, and alert rules.
5. Agency optionally invites client users with restricted portal access.

### 7.3 Domain Verification

1. User adds a domain such as `example.com`.
2. System generates a unique verification token.
3. User receives DNS TXT instructions.
4. User adds the TXT record:

```txt
allinone-seo-verification=abc123xyz
```

5. System periodically checks DNS.
6. Domain status changes from `pending` to `verified`.
7. User can begin crawls and monitoring.

Future verification options:

- HTML file upload.
- Meta tag verification.
- Google Search Console OAuth.

### 7.4 Site Crawl

1. User starts first crawl manually or after verification.
2. Crawler fetches homepage.
3. Crawler discovers internal links.
4. Crawler respects robots.txt unless explicitly configured otherwise for allowed owner-only diagnostics.
5. Crawler applies plan limits for page count, depth, and crawl frequency.
6. Crawler stores snapshots and extracted SEO metadata.
7. SEO analyzer processes pages and generates issues.
8. Dashboard updates with site score, pages, issues, and recommendations.

### 7.5 Change Monitoring

1. Scheduled crawl runs daily, weekly, or monthly depending on plan.
2. System compares latest page data against prior snapshots.
3. System detects SEO-relevant changes:
   - Title changed.
   - Meta description changed.
   - H1 changed.
   - Canonical changed.
   - Robots directive changed.
   - Page became `noindex`.
   - Status code changed.
   - Internal links changed.
   - Schema changed.
   - Core Web Vitals changed if script data is available.
4. System creates change events.
5. Critical events trigger alerts.
6. Users can review change history by site, page, or client.

### 7.6 Issue Management

1. Analyzer creates issues from crawl results.
2. Issues are grouped by:
   - Site.
   - Client.
   - Page.
   - Template.
   - Issue type.
   - Severity.
3. User opens issue detail.
4. User can:
   - Assign owner.
   - Add internal note.
   - Add client-visible note.
   - Ignore issue.
   - Mark in progress.
   - Mark fixed.
5. System reopens issue if it reappears in a future crawl.

### 7.7 AI Recommendation Flow

1. User opens a page or issue.
2. System sends page metadata, extracted content, and issue context to AI layer.
3. AI generates:
   - Suggested title.
   - Suggested meta description.
   - H1/H2 improvements.
   - Schema recommendation.
   - Internal linking suggestion.
   - Plain-language explanation.
   - Developer or CMS-specific fix brief.
4. User reviews and copies recommendation.
5. Future CMS integrations may allow direct publishing or patch generation.

### 7.8 Agency Reporting Flow

1. Agency configures report cadence per client.
2. System generates report covering:
   - SEO health score.
   - New issues.
   - Fixed issues.
   - Critical changes.
   - Priority recommendations.
   - Crawl history.
   - Optional traffic/search data from integrations.
3. Agency can review and edit report notes.
4. Agency exports PDF or shares read-only report link.
5. Client views report in branded portal.

## 8. Main Application Screens

### 8.1 Business Dashboard

Shows one organization’s websites.

Required widgets:

- Overall SEO health score.
- Domains monitored.
- Critical issues.
- New changes since last crawl.
- Pages crawled.
- Crawl status.
- Top priority fixes.
- Recent alerts.

### 8.2 Agency Dashboard

Shows all clients and sites in one command center.

Required widgets:

- Total clients.
- Total domains.
- Average SEO health score.
- Sites with critical regressions.
- Failed crawls.
- Verification problems.
- New critical issues across all sites.
- Upcoming reports.
- Team workload.
- Top 10 priority fixes across all clients.

### 8.3 Clients

Agency-only screen.

Required features:

- Client list.
- Client health score.
- Number of domains.
- Critical issue count.
- Last crawl date.
- Report status.
- Assigned account owner.
- Client portal access status.

### 8.4 Sites / Domains

Required features:

- Domain list.
- Verification status.
- Script install status.
- Last crawl status.
- Crawl frequency.
- Page count.
- Issue counts by severity.
- Platform label such as WordPress, Shopify, Webflow, or custom.

### 8.5 Pages

Required features:

- URL table.
- Status code.
- Indexability.
- Title.
- Meta description status.
- H1 status.
- Canonical status.
- Word count.
- Internal incoming links.
- Issues count.
- Last crawled date.

### 8.6 Issues

Required features:

- Global issue list.
- Filters by client, site, severity, type, status, assignee, and date.
- Grouping by template and issue type.
- Bulk actions.
- Issue lifecycle status.
- Priority score.

### 8.7 Page Detail

Required sections:

- URL summary.
- Current SEO metadata.
- Indexability.
- Headings.
- Links.
- Images.
- Schema.
- Content summary.
- Issues affecting page.
- AI recommendations.
- Change history.
- Raw crawl snapshot reference.

### 8.8 Technical Audit

Required sections:

- Robots.txt analysis.
- Sitemap analysis.
- Canonical analysis.
- Redirect chains.
- Broken links.
- Status code distribution.
- Duplicate metadata.
- Thin content.
- Schema presence.
- Internal link graph.

### 8.9 Content Recommendations

Required sections:

- Missing or weak titles.
- Missing or weak meta descriptions.
- Heading structure issues.
- Thin pages.
- Duplicate content signals.
- Internal link opportunities.
- AI-generated content briefs.

### 8.10 Alerts

Required features:

- Alert rules.
- Alert history.
- Channel settings.
- Severity thresholds.
- Site-specific and agency-wide alerts.

### 8.11 Reports

Required features:

- Report templates.
- Scheduled reports.
- Generated reports.
- PDF export.
- Shareable report links.
- White-label branding controls.

### 8.12 Settings

Required sections:

- Workspace settings.
- Team members.
- Roles and permissions.
- Billing.
- API keys.
- Integrations.
- Verification settings.
- Script install instructions.

## 9. SEO Analyzer Requirements

### 9.1 Technical SEO Checks

Critical:

- Page returns 5xx.
- Page blocked by robots.txt.
- Important page has `noindex`.
- Missing title.
- Broken canonical.
- Canonical points to non-200 URL.
- Sitemap unavailable.
- Robots.txt unavailable or malformed.
- Homepage not crawlable.

Warnings:

- Duplicate title.
- Duplicate meta description.
- Missing meta description.
- Multiple H1 tags.
- Missing H1.
- Redirect chain.
- 4xx internal link.
- Image missing alt text.
- Oversized HTML.
- Missing viewport tag.
- Missing canonical.
- Mixed indexability signals.

Suggestions:

- Weak title.
- Long title.
- Short title.
- Long meta description.
- Short meta description.
- Thin content.
- Poor heading hierarchy.
- Low internal link count.
- Missing structured data.
- Sitemap URL not internally linked.

### 9.2 Template Detection

System should group pages into probable templates using URL patterns and content structure.

Examples:

- `/blog/*`
- `/products/*`
- `/collections/*`
- `/docs/*`
- `/category/*`

Template-level issue examples:

- All product pages missing Product schema.
- All blog pages have duplicate title format.
- All category pages are noindexed.
- All docs pages have missing meta descriptions.

### 9.3 Internal Link Graph

System should calculate:

- Incoming internal links per page.
- Outgoing internal links per page.
- Orphan pages.
- Deep pages.
- Pages in sitemap but not internally linked.
- Pages internally linked but not in sitemap.
- Broken internal links.
- Most linked pages.

### 9.4 Site Score

Site score should be calculated from:

- Critical issue count.
- Warning issue count.
- Number of affected important pages.
- Crawl coverage.
- Indexability health.
- Sitemap health.
- Internal link health.
- Change regression count.

Scores should be explainable. Users must be able to see why a score changed.

## 10. Website Script Requirements

The script is optional for MVP but important for phase two.

### 10.1 Script Tag

```html
<script
  async
  src="https://cdn.allinoneseo.com/seo.js"
  data-site-id="SITE_ID"
></script>
```

### 10.2 Data Collected

Allowed data:

- Page URL.
- Title.
- Meta tags.
- Canonical.
- Headings.
- Schema presence.
- Link data.
- Rendered DOM SEO signals.
- Core Web Vitals.
- SPA route changes.
- Client-side rendering delays.

Restricted data:

- Form field values.
- Password fields.
- Payment fields.
- Personal user data.
- Full session recording.

### 10.3 Privacy Controls

Requirements:

- Avoid collecting personal data by default.
- Redact query parameters based on configuration.
- Support domain allowlist.
- Respect customer data processing settings.
- Provide script disable switch.
- Provide documentation for privacy and compliance.

## 11. Architecture

### 11.1 Recommended Stack

Frontend:

- Next.js.
- TypeScript.
- Component-based dashboard UI.
- Data tables, filters, charts, and detail panels.

Backend:

- Next.js API routes or NestJS service.
- PostgreSQL.
- Redis-backed queues.
- Worker processes for crawling, DNS checks, analysis, reports, and alerts.
- Playwright for rendered crawling.
- Object storage for HTML snapshots and report assets.

Infrastructure:

- CDN for website script.
- Background job runner.
- Rate limiting.
- Observability.
- Error tracking.
- Scheduled jobs.

### 11.2 Major Services

Application API:

- Authentication.
- Workspaces.
- Clients.
- Domains.
- Issues.
- Recommendations.
- Reports.
- Billing.

Crawler Service:

- URL frontier management.
- HTTP crawling.
- Rendered crawling.
- Robots.txt handling.
- Sitemap discovery.
- Crawl limits.
- Snapshot storage.

Analyzer Service:

- Extracts metadata.
- Runs SEO checks.
- Detects duplicates.
- Detects templates.
- Builds internal link graph.
- Calculates scores.

Verification Service:

- Generates tokens.
- Checks DNS TXT records.
- Manages verification status.
- Handles retries and expiration.

Ingestion Service:

- Receives script events.
- Validates site ID.
- Applies rate limits.
- Stores page observations.

AI Service:

- Generates recommendations.
- Summarizes issues.
- Creates developer briefs.
- Creates client-friendly explanations.
- Enforces token and usage limits.

Reporting Service:

- Generates scheduled reports.
- Produces PDFs.
- Creates shareable links.
- Supports agency branding.

Alerting Service:

- Evaluates alert rules.
- Sends email alerts.
- Supports Slack/webhook later.
- Tracks delivery status.

## 12. Data Model

### 12.1 Core Tables

`users`

- `id`
- `email`
- `name`
- `password_hash` or auth provider reference
- `created_at`
- `updated_at`

`workspaces`

- `id`
- `name`
- `type` (`business`, `agency`)
- `plan`
- `created_at`
- `updated_at`

`workspace_members`

- `id`
- `workspace_id`
- `user_id`
- `role`
- `created_at`

`clients`

- `id`
- `workspace_id`
- `name`
- `logo_url`
- `contact_email`
- `notes`
- `created_at`
- `updated_at`

`domains`

- `id`
- `workspace_id`
- `client_id`
- `domain`
- `platform`
- `verification_status`
- `script_status`
- `crawl_frequency`
- `created_at`
- `updated_at`

`domain_verifications`

- `id`
- `domain_id`
- `method`
- `token`
- `status`
- `expires_at`
- `verified_at`
- `created_at`

`crawl_runs`

- `id`
- `domain_id`
- `status`
- `started_at`
- `completed_at`
- `pages_discovered`
- `pages_crawled`
- `pages_failed`
- `triggered_by`
- `error_message`

`pages`

- `id`
- `domain_id`
- `url`
- `normalized_url`
- `page_type`
- `importance`
- `first_seen_at`
- `last_seen_at`
- `last_crawled_at`

`page_snapshots`

- `id`
- `page_id`
- `crawl_run_id`
- `status_code`
- `html_object_key`
- `title`
- `meta_description`
- `h1`
- `canonical`
- `robots_directive`
- `word_count`
- `content_hash`
- `metadata_json`
- `created_at`

`seo_issues`

- `id`
- `workspace_id`
- `client_id`
- `domain_id`
- `page_id`
- `template_id`
- `issue_type`
- `severity`
- `priority_score`
- `status`
- `title`
- `description`
- `recommendation`
- `first_detected_at`
- `last_detected_at`
- `resolved_at`
- `assigned_to`

`seo_recommendations`

- `id`
- `issue_id`
- `page_id`
- `type`
- `input_hash`
- `recommendation_json`
- `created_at`

`change_events`

- `id`
- `domain_id`
- `page_id`
- `crawl_run_id`
- `change_type`
- `severity`
- `previous_value`
- `new_value`
- `created_at`

`script_events`

- `id`
- `domain_id`
- `page_url`
- `event_type`
- `payload_json`
- `created_at`

`reports`

- `id`
- `workspace_id`
- `client_id`
- `domain_id`
- `title`
- `status`
- `period_start`
- `period_end`
- `pdf_object_key`
- `share_token`
- `created_at`

`integrations`

- `id`
- `workspace_id`
- `client_id`
- `domain_id`
- `provider`
- `status`
- `config_json`
- `created_at`
- `updated_at`

`alert_rules`

- `id`
- `workspace_id`
- `client_id`
- `domain_id`
- `name`
- `event_type`
- `severity_threshold`
- `channel`
- `enabled`
- `created_at`

`alerts`

- `id`
- `alert_rule_id`
- `domain_id`
- `page_id`
- `event_id`
- `status`
- `sent_at`
- `created_at`

## 13. Roles And Permissions

### Business Roles

Owner:

- Manage billing.
- Manage members.
- Add/remove domains.
- View all data.
- Configure alerts and integrations.

Admin:

- Manage domains.
- Configure crawls.
- Manage issues.
- View reports.

Member:

- View dashboards.
- Manage assigned issues.
- Generate recommendations.

Viewer:

- Read-only access.

### Production Roles

Product Owner:

- System role: `OWNER`.
- Full workspace, billing, team, client, domain, crawl, issue, report, alert, and integration control.
- Protected from removal or downgrade in Settings.

Agency Admin:

- System role: `ADMIN`.
- Manage team access except the Product Owner.
- Manage clients, domains, crawls, issues, reports, alerts, and integrations.

SEO Operator:

- System role: `MEMBER`.
- Run crawls, update SEO issues, generate recommendations, review reports, and execute SEO workflows.
- Cannot manage billing, team seats, or workspace-level access.

Client Viewer:

- System role: `VIEWER`.
- Read-only access for clients, executives, and stakeholders.
- View dashboards, reports, issues, and site health without mutation permissions.

## 14. Security And Compliance Requirements

Authentication:

- Secure password handling or trusted auth provider.
- Email verification.
- Password reset.
- Session expiration.

Authorization:

- Strict workspace isolation.
- Strict client isolation for agency portals.
- Role-based access checks on every API request.

Domain Verification:

- Domains cannot be crawled beyond low-risk public preview limits until verified.
- Verification tokens must be unique and time-bound.
- Verification status should be periodically rechecked for sensitive actions.

Crawler Safety:

- Respect robots.txt by default.
- Apply domain-level rate limits.
- Identify crawler with clear user agent.
- Avoid crawling external domains unless explicitly allowed.
- Prevent SSRF through URL validation and network restrictions.

Script Security:

- Validate site IDs.
- Enforce origin/domain checks.
- Rate limit ingestion.
- Avoid collecting personal data.

Data Security:

- Encrypt sensitive integration tokens.
- Store HTML snapshots securely.
- Provide data deletion workflow.
- Maintain audit logs for agency/client access.

## 15. MVP Scope

The MVP should prove the core product loop:

1. User adds and verifies a domain.
2. System crawls the site.
3. System finds SEO issues.
4. System prioritizes what matters.
5. User gets page-level recommendations.
6. System monitors future changes.
7. Agency users can repeat this across multiple client websites.

### MVP Included

- User signup/login.
- Workspace creation.
- Business and agency workspace types.
- Agency clients.
- Add domains.
- DNS TXT verification.
- Basic HTTP crawler.
- Sitemap discovery.
- Robots.txt analysis.
- SEO issue scanner.
- Site score.
- Page list.
- Issue list.
- Page detail view.
- Change detection between crawls.
- Issue lifecycle statuses.
- AI suggestions for title, meta description, and H1.
- Weekly scheduled recrawl.
- Basic email alerts for critical changes.
- Agency all-sites dashboard.
- Basic branded PDF or shareable report.

### MVP Excluded

- Keyword rank tracking.
- Backlink tracking.
- Full script-based Core Web Vitals.
- Direct CMS publishing.
- Google Search Console integration.
- Google Analytics integration.
- Slack integration.
- Advanced white-label custom domains.

## 16. MVP vs Complete SaaS Product

This section separates the first shippable version from the complete long-term SaaS product.

### 16.1 Product Scope Matrix

| Module              | MVP                                                                                 | Complete SaaS Product                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Authentication      | Email/password or auth provider, basic account management                           | SSO, enterprise login, advanced audit logs, account recovery controls                                            |
| Workspaces          | Business and agency workspace types                                                 | Multi-brand workspace management, enterprise org hierarchy                                                       |
| Agency Clients      | Create clients, attach domains, view client health                                  | Client portals, client comments, custom permissions, client-specific branding                                    |
| Team Roles          | Owner, admin, member, viewer                                                        | Advanced roles, custom permissions, approval workflows                                                           |
| Domain Management   | Add domain, assign to workspace/client                                              | Bulk import, domain groups, tags, portfolio-level settings                                                       |
| Domain Verification | DNS TXT verification                                                                | DNS TXT, HTML file, meta tag, Google Search Console verification                                                 |
| Crawler             | Basic HTTP crawler, sitemap discovery, robots.txt handling                          | Rendered crawling, crawl budget controls, custom user agents, crawl rules, JavaScript-heavy site support         |
| Crawl Scheduling    | Weekly scheduled crawl, manual crawl                                                | Daily/hourly/custom schedules, smart recrawl based on page importance                                            |
| Page Storage        | Store page metadata and snapshot reference                                          | Snapshot retention policies, visual diffs, rendered DOM snapshots                                                |
| SEO Rules           | Core technical checks for title, meta, H1, canonical, status codes, robots, sitemap | Advanced schema validation, hreflang, pagination, faceted navigation, Core Web Vitals, ecommerce-specific checks |
| Issue Management    | Issue list, severity, status, assignment                                            | SLA tracking, due dates, approvals, recurring issue detection, comments, client-visible notes                    |
| Change Detection    | Detect key SEO metadata/status/indexability changes                                 | Full historical diffing, visual diffing, template-level regression detection                                     |
| Site Score          | Basic explainable score                                                             | Weighted score by traffic, revenue, page type, search visibility, and business priority                          |
| Page Importance     | Manual importance labels or basic automatic detection                               | Search Console-driven importance, traffic/revenue weighting, navigation prominence                               |
| Template Detection  | Basic URL-pattern grouping                                                          | Advanced template inference using layout/content similarity                                                      |
| Internal Link Graph | Basic incoming/outgoing link counts and broken internal links                       | Visual graph, orphan detection, link equity modeling, internal link opportunity engine                           |
| AI Recommendations  | Title, meta description, H1 suggestions                                             | Full fix briefs, developer instructions, CMS-specific guidance, content briefs, schema generation                |
| Reports             | Basic agency/client report, PDF or share link                                       | White-label report builder, scheduled reports, custom sections, branded client portals                           |
| Alerts              | Basic email alerts for critical changes                                             | Slack, webhook, Microsoft Teams, alert routing, escalation rules                                                 |
| Website Script      | Not included by default                                                             | CDN script, Core Web Vitals, SPA route monitoring, rendered DOM observations                                     |
| Integrations        | Not included by default                                                             | Google Search Console, Google Analytics, WordPress, Shopify, Webflow, Slack, Vercel, Netlify                     |
| Billing             | Simple plan limits can be manual/private beta                                       | Self-serve billing, usage-based limits, invoices, trials, plan upgrades                                          |
| Public API          | Not included                                                                        | Public API, webhooks, partner integrations                                                                       |
| White Label         | Basic logo/name on report                                                           | Custom domain, branded portal, custom email sender, agency-level templates                                       |

### 16.2 MVP Feature List

The MVP must include only the features required to deliver continuous SEO audits for businesses and agencies.

Account and workspace:

- User signup and login.
- Business workspace.
- Agency workspace.
- Team member invitation.
- Basic role-based access.

Agency management:

- Create clients.
- Add one or more domains per client.
- View all clients from one agency dashboard.
- View all domains across all clients.
- Filter issues by client and domain.

Domain verification:

- Add domain.
- Generate DNS TXT verification token.
- Check DNS verification.
- Show pending, verified, failed, and expired states.

Crawling:

- Manual crawl.
- Weekly scheduled crawl.
- HTTP crawling.
- Homepage-based internal link discovery.
- Sitemap discovery.
- Robots.txt analysis.
- Crawl page count limits by plan.

SEO analysis:

- Missing title.
- Duplicate title.
- Missing meta description.
- Duplicate meta description.
- Missing H1.
- Multiple H1 tags.
- Missing canonical.
- Broken canonical.
- 4xx internal links.
- 5xx pages.
- `noindex` detection.
- Robots.txt blocking detection.
- Sitemap errors.
- Thin content warning.
- Missing image alt text warning.

Dashboard:

- Site health score.
- Domain list.
- Page list.
- Issue list.
- Page detail view.
- Crawl run status.
- Recent changes.
- Priority issues.

Issue workflow:

- Open, ignored, in progress, fixed, and reappeared statuses.
- Assign issue to team member.
- Internal notes.
- Severity and priority score.
- First detected and last detected timestamps.

Change monitoring:

- Compare latest crawl to previous crawl.
- Detect title, meta description, H1, canonical, status code, robots directive, and indexability changes.
- Show changes on site and page views.

AI:

- Generate title suggestions.
- Generate meta description suggestions.
- Generate H1 suggestions.
- Explain issue in plain language.

Reports:

- Generate basic client report.
- Include score, issue summary, fixed issues, new issues, and priority recommendations.
- Export PDF or create shareable read-only link.
- Basic agency logo/name branding.

Alerts:

- Email alert for critical page down.
- Email alert for important page becoming `noindex`.
- Email alert for robots.txt blocking crawl.
- Email alert for sitemap failure.

Billing and limits:

- Plan limits can be configured manually for private beta.
- Enforce domain and page crawl limits.
- Track AI recommendation usage.

### 16.3 Complete SaaS Product Feature List

The complete SaaS product expands the MVP into a full SEO operations platform.

Advanced crawling:

- Rendered crawling with Playwright.
- JavaScript-heavy site support.
- Custom crawl rules.
- Custom crawl depth.
- Include/exclude URL patterns.
- Crawl speed controls.
- Crawl budget management.
- Crawl comparison across environments such as staging and production.

Website script:

- CDN-hosted script.
- SPA route monitoring.
- Core Web Vitals collection.
- Rendered DOM SEO checks.
- Client-side canonical/title/meta detection.
- Frontend SEO regression detection.
- Privacy controls and URL/query redaction.

Advanced SEO analysis:

- Schema validation.
- Hreflang validation.
- Pagination checks.
- Faceted navigation checks.
- Duplicate content clustering.
- Redirect chain analysis.
- Canonical cluster analysis.
- Ecommerce product/category checks.
- Blog/content quality checks.
- Accessibility-adjacent SEO checks.
- Lighthouse/Core Web Vitals integration.

Advanced agency features:

- Client portal.
- Client comments.
- Client-visible and internal-only notes.
- Custom report templates.
- Scheduled monthly/weekly reports.
- White-label custom domain.
- Custom email sender.
- Per-client branding.
- Agency-level templates.
- Bulk client/domain import.
- Portfolio-wide issue prioritization.

Advanced AI:

- Developer fix briefs.
- CMS-specific instructions for WordPress, Shopify, Webflow, Wix, and custom sites.
- Schema generation.
- Internal linking recommendations.
- Content gap analysis.
- Blog brief generation.
- Product/category page optimization.
- Prioritized SEO action plan.
- Client-friendly report summaries.

Integrations:

- Google Search Console.
- Google Analytics.
- WordPress plugin.
- Shopify app.
- Webflow integration.
- Slack alerts.
- Microsoft Teams alerts.
- Webhooks.
- Vercel and Netlify deployment checks.
- Zapier or Make integration.

Advanced monitoring:

- Daily/hourly crawl schedules.
- Smart recrawls for important pages.
- Alert escalation.
- Alert routing by client/team member.
- Regression detection by template.
- Visual page diffing.
- Historical trend charts.

Enterprise:

- SSO.
- Advanced audit logs.
- Custom data retention.
- Dedicated crawler infrastructure.
- Custom contracts and billing.
- Public API.
- Partner API keys.

### 16.4 MVP Release Boundary

If a feature does not directly support the first loop of verifying a site, crawling it, finding issues, tracking changes, and reporting results, it should not block MVP.

MVP blockers:

- Authentication and workspace access.
- Agency client/domain structure.
- Domain verification.
- Crawl execution.
- SEO issue generation.
- Site/page/issue dashboard.
- Change detection.
- Basic AI recommendations.
- Basic report generation.

Not MVP blockers:

- Keyword rank tracking.
- Backlink monitoring.
- Website script.
- Google integrations.
- CMS publishing.
- Advanced white-label portals.
- Slack/webhook alerts.
- Rendered crawling unless the first target customers require JavaScript-heavy site support.

## 17. Phase Two Scope

- Website script and ingestion service.
- Core Web Vitals monitoring.
- SPA route detection.
- Google Search Console integration.
- Google Analytics integration.
- Slack alerts.
- Webhook alerts.
- WordPress plugin.
- Shopify app.
- Webflow integration.
- Advanced agency reporting.
- Custom report templates.
- Client portal comments.
- Template-level AI fix briefs.

## 18. Phase Three Scope

- Keyword tracking.
- Content briefs.
- Competitor comparisons.
- Backlink integrations.
- Automated CMS updates with approval.
- Public API.
- Advanced crawler configuration.
- Enterprise SSO.
- Audit logs.
- Custom data retention controls.

## 19. Pricing Model

Plans should be based on operational cost drivers and agency value.

Pricing dimensions:

- Number of domains.
- Number of crawled pages.
- Crawl frequency.
- Number of team seats.
- Number of client portals.
- AI recommendation credits.
- Report generation volume.
- Integrations.
- White-label features.

Example plans:

- Starter: 1 domain, 500 pages, weekly crawl.
- Growth: 5 domains, 5,000 pages, daily crawl.
- Agency: 25 domains, 50,000 pages, daily/weekly mix, white-label reports.
- Agency Pro: 100 domains, advanced reports, client portals, Slack/webhooks.
- Enterprise: custom limits, SSO, audit logs, custom support.

## 20. MVP Acceptance Criteria

The MVP is ready for private beta when the following criteria are met.

### Account And Workspace

- A new user can create an account.
- A user can create a business workspace.
- A user can create an agency workspace.
- An agency user can create clients.
- Team members can be invited into a workspace.
- Role-based access prevents users from viewing other workspaces.

### Domain Verification

- A user can add a domain.
- The system generates a unique TXT verification token.
- The system checks DNS and marks the domain verified.
- Failed or pending verification states are visible in the UI.
- Unverified domains cannot run full production crawls.

### Crawling

- A verified domain can be crawled manually.
- A verified domain can be crawled on a weekly schedule.
- The crawler discovers internal links from the homepage.
- The crawler respects robots.txt by default.
- The crawler stores page status, metadata, headings, links, canonical, robots directives, and snapshot reference.
- Failed crawl runs show actionable error messages.

### SEO Analysis

- The analyzer creates issues for core technical SEO problems.
- Issues have severity, status, page/site association, and first/last detected timestamps.
- Duplicate titles and meta descriptions can be detected.
- Sitemap and robots.txt issues can be detected.
- Site score updates after each crawl.

### Change Detection

- The system compares current crawl results with the previous crawl.
- The system records title, meta, H1, canonical, robots directive, status code, and indexability changes.
- Critical changes can trigger an email alert.

### Dashboard

- Business users can view site-level overview, pages, issues, and page detail.
- Agency users can view all clients and domains in one dashboard.
- Agency users can filter issues by client, domain, severity, status, and assignee.
- Users can update issue status and assignment.

### AI Recommendations

- A user can generate AI suggestions for title, meta description, and H1.
- AI output is tied to a page and stored as a recommendation.
- AI usage is tracked per workspace.

### Reporting

- An agency user can generate a basic client report.
- A report includes health score, new issues, fixed issues, priority recommendations, and crawl summary.
- A report can be exported or shared through a read-only link.

## 21. API Surface

The exact framework can vary, but the product should expose a clear API boundary around these resources.

### Auth And Workspace

- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/workspaces`
- `GET /api/workspaces/:workspaceId`
- `POST /api/workspaces/:workspaceId/invitations`
- `GET /api/workspaces/:workspaceId/members`
- `PATCH /api/workspaces/:workspaceId/members/:memberId`

### Agency Clients

- `POST /api/workspaces/:workspaceId/clients`
- `GET /api/workspaces/:workspaceId/clients`
- `GET /api/clients/:clientId`
- `PATCH /api/clients/:clientId`
- `DELETE /api/clients/:clientId`

### Domains And Verification

- `POST /api/workspaces/:workspaceId/domains`
- `GET /api/domains/:domainId`
- `PATCH /api/domains/:domainId`
- `POST /api/domains/:domainId/verification`
- `POST /api/domains/:domainId/verification/check`
- `GET /api/domains/:domainId/verification`

### Crawls

- `POST /api/domains/:domainId/crawl-runs`
- `GET /api/domains/:domainId/crawl-runs`
- `GET /api/crawl-runs/:crawlRunId`
- `POST /api/crawl-runs/:crawlRunId/cancel`

### Pages

- `GET /api/domains/:domainId/pages`
- `GET /api/pages/:pageId`
- `GET /api/pages/:pageId/snapshots`
- `GET /api/pages/:pageId/changes`

### Issues

- `GET /api/workspaces/:workspaceId/issues`
- `GET /api/domains/:domainId/issues`
- `GET /api/issues/:issueId`
- `PATCH /api/issues/:issueId`
- `POST /api/issues/bulk-update`

### Recommendations

- `POST /api/pages/:pageId/recommendations`
- `GET /api/pages/:pageId/recommendations`
- `GET /api/issues/:issueId/recommendations`

### Reports

- `POST /api/clients/:clientId/reports`
- `GET /api/clients/:clientId/reports`
- `GET /api/reports/:reportId`
- `POST /api/reports/:reportId/publish`
- `GET /api/public/reports/:shareToken`

### Alerts

- `POST /api/workspaces/:workspaceId/alert-rules`
- `GET /api/workspaces/:workspaceId/alert-rules`
- `PATCH /api/alert-rules/:alertRuleId`
- `GET /api/workspaces/:workspaceId/alerts`

### Script Ingestion

- `POST /api/ingest/script-event`

This endpoint should require site ID validation, origin checks, payload size limits, and rate limiting.

## 22. Background Jobs

Required jobs:

- `verify-domain-dns`
- `schedule-crawls`
- `run-crawl`
- `analyze-crawl-run`
- `detect-changes`
- `score-site`
- `send-alerts`
- `generate-report`
- `expire-verification-tokens`
- `cleanup-old-snapshots`

Each job should be idempotent where possible and safe to retry.

## 23. Default Plan Limits

Initial private beta limits can be conservative.

Starter:

- 1 workspace.
- 1 domain.
- 500 crawled pages.
- Weekly crawl.
- 50 AI recommendations per month.

Growth:

- 1 workspace.
- 5 domains.
- 5,000 crawled pages.
- Daily crawl.
- 500 AI recommendations per month.

Agency:

- 25 clients.
- 25 domains.
- 50,000 crawled pages.
- Daily or weekly crawl per site.
- 2,500 AI recommendations per month.
- White-label reports.

Agency Pro:

- 100 clients.
- 100 domains.
- 250,000 crawled pages.
- Custom crawl schedules.
- 10,000 AI recommendations per month.
- Client portals.
- Advanced reports.

## 24. Success Metrics

Activation:

- Percentage of users who verify first domain.
- Percentage of verified domains with first crawl completed.
- Time from signup to first actionable issue.

Engagement:

- Weekly active workspaces.
- Issues viewed per workspace.
- Recommendations generated.
- Reports generated.
- Alerts configured.

Retention:

- Domains with recurring crawls enabled.
- Agencies adding multiple clients.
- Issues resolved over time.
- Reports sent repeatedly.

Revenue:

- Paid conversion rate.
- Average revenue per workspace.
- Agency plan adoption.
- Expansion revenue from additional domains/pages.

Product Quality:

- Crawl success rate.
- False positive issue rate.
- Alert delivery success rate.
- AI recommendation acceptance rate.

## 25. Engineering Milestones

### Milestone 1: Foundation

- Authentication.
- Workspace model.
- Agency client model.
- Domain model.
- DNS TXT verification.
- Basic UI shell.

### Milestone 2: Crawler And Analyzer

- Crawl queue.
- HTTP crawler.
- Sitemap and robots handling.
- Metadata extraction.
- Basic SEO checks.
- Page and snapshot storage.

### Milestone 3: Dashboard

- Site overview.
- Page table.
- Issue table.
- Page detail.
- Site score.
- Crawl run status.

### Milestone 4: Monitoring

- Scheduled recrawls.
- Change detection.
- Alert rules.
- Email alerts.
- Issue lifecycle updates.

### Milestone 5: Agency Layer

- All-sites dashboard.
- Client management.
- Cross-client issue filters.
- Team assignments.
- Client portal foundation.

### Milestone 6: AI And Reporting

- AI title/meta/H1 suggestions.
- Issue explanations.
- Developer fix briefs.
- Basic reports.
- White-label branding.

## 26. Key Product Risks

Crawler reliability:

- Some sites block crawlers or require JavaScript rendering.
- Mitigation: start with HTTP crawler, add rendered crawler fallback, document crawl user agent.

False positives:

- SEO rules can be context-specific.
- Mitigation: allow ignored issues, explain checks, improve rules based on feedback.

High infrastructure cost:

- Crawling and AI can become expensive.
- Mitigation: plan limits, queues, caching, snapshot storage policies, AI quotas.

Agency complexity:

- Multi-client permissions can become risky.
- Mitigation: design workspace/client isolation early, test authorization deeply.

Data sensitivity:

- HTML snapshots may contain sensitive public-but-private content.
- Mitigation: secure storage, retention controls, redaction options.

## 27. Open Decisions

- Product name and verification TXT namespace.
- Whether MVP should include website script or delay it to phase two.
- Auth provider selection.
- Billing provider.
- PDF generation method.
- Object storage provider.
- Whether rendered crawling is MVP or phase two.
- Exact agency report format.
- Initial AI model/provider.

## 28. Recommended MVP Decision

Ship the MVP crawler-first.

The website script is valuable, but it increases privacy, infrastructure, documentation, and support complexity. A crawler-first MVP can still deliver the core promise:

- Verify site.
- Crawl pages.
- Detect issues.
- Track changes.
- Prioritize fixes.
- Generate AI recommendations.
- Send reports.

The script should be added in phase two when the product needs Core Web Vitals, SPA observations, and rendered DOM monitoring.

## 29. Final Product Thesis

Most SEO tools show a pile of issues. All In One SEO should show what matters now.

The product wins by combining:

- Continuous monitoring.
- Change detection.
- Issue lifecycle.
- Template-level insights.
- AI fix briefs.
- Agency workflows.
- White-label reporting.

For businesses, it becomes a safety system for organic visibility.

For agencies, it becomes the operating system for managing SEO across every client website.

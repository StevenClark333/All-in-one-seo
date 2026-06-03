# All In One SEO UI/UX Roadmap

This document captures the product organization findings from the Semrush reference screenshots and turns them into an implementation checklist for All In One SEO.

Use this document as the UI/UX source of truth for the next product polish phase. Use `PRODUCTION_TASK_LIST.md` for execution status.

## 1. UX Direction

All In One SEO should feel like a project/domain-first SEO operations product.

The user should not feel that Pages, Issues, Fix Center, Reports, Technical Audit, AI, and Integrations are scattered separate modules. Once a domain is selected, every major screen should clearly stay inside that domain context and let the user move between tools without losing the active project.

## 2. Reference Findings

### Semrush Home / Folders

Observed patterns:

- Global top search bar for task, website, or keyword lookup.
- Compact left icon rail.
- Product category cards across the top.
- Folder/project rows for domains.
- Each domain row shows core metrics in one scan:
  - AI visibility
  - Mentions
  - Site health
  - Visibility
  - Organic traffic
  - Organic keywords
  - Backlinks
- Domain/project rows are the main entry point into tools.

All In One SEO gap:

- Our Overview and Sites pages need stronger project rows with more operational metrics.
- We need a global search/task bar.
- We need project/folder grouping for agencies with many clients/domains.

### Semrush Site Audit List

Observed patterns:

- Tool-specific page with breadcrumb.
- Search by project name or domain.
- Create SEO project action.
- Dense table, not card-heavy.
- Columns are tool-specific:
  - Project
  - Last update
  - Pages crawled
  - Site health
  - AI search health
  - Errors
  - Warnings
  - Crawlability
  - HTTPS
  - Internal SEO

All In One SEO gap:

- Our Sites table should become more of a project audit table.
- We need columns for crawl health, errors, warnings, crawlability, HTTPS, internal SEO, and schema/markup.
- We need tighter table density and fewer oversized cards for operational views.

### Semrush Position Tracking

Observed patterns:

- Dedicated module even when limited.
- Project table includes:
  - Device/location
  - Visibility
  - Diff
  - Improved keywords
  - Declined keywords
  - All keywords
  - Updated
- Filters for target type and date range.

All In One SEO gap:

- Rank tracking is still intentionally out of MVP, but the product navigation should reserve a future “Rank Tracking” or “Search Performance” module.
- Near-term replacement should use Google Search Console data for visibility, clicks, impressions, CTR, and average position.

### Semrush Site Audit Detail

Observed patterns:

- Page title includes active project: `Site Audit: domain.com`.
- Context row shows domain, update date, device, JS rendering state, and pages crawled.
- Actions are contextual:
  - Rerun campaign
  - Looker Studio
  - PDF
  - Export
  - Share
  - Settings
- Tool tabs:
  - Overview
  - Issues
  - Crawled Pages
  - Statistics
  - Compare Crawls
  - Progress
  - JS Impact
- Overview uses gauge-style cards and split panels:
  - Site Health
  - Crawled Pages
  - AI Search Health
  - Blocked from AI Search
  - Errors
  - Warning issue list

All In One SEO gap:

- Our domain workspace should become a stronger Site Audit page, not just a collection of stacked sections.
- We need tabs inside the domain workspace.
- We need explicit actions for run crawl, PDF/report, export, share, and settings.
- We need a crawled-page breakdown and issue category panel.

### Semrush Thematic Reports

Observed patterns:

- Thematic report cards are grouped below the main audit overview.
- Cards include:
  - Robots.txt
  - Crawlability
  - HTTPS
  - International SEO
  - Core Web Vitals
  - Site Performance
  - Internal Linking
  - Markup

All In One SEO gap:

- We need a “Thematic Reports” section in the domain workspace.
- Existing data can power several cards now:
  - Robots.txt
  - Sitemap
  - Crawlability
  - HTTPS
  - Internal Linking
  - Markup / Schema
  - Performance
  - Indexability
  - Canonicals
  - JS Rendering

## 3. Product Navigation Target

### Global Navigation

Keep global navigation for agency-wide operations:

- Overview
- Clients
- Sites / Projects
- Alerts
- Reports
- Integrations
- Billing
- Settings

### Domain Workspace Navigation

Inside a selected domain/project, use domain-scoped tabs:

- Overview
- Issues
- Crawled Pages
- Internal Links
- Changes
- Fixes
- Reports
- Integrations
- Settings

### Future SEO Product Groups

As the product grows, organize tools into groups:

- Site Performance
  - Site Audit
  - Crawled Pages
  - JS Rendering
  - Core Web Vitals
- Competitive Analysis
  - Domain Overview
  - Organic Search Console
  - Top Pages
- Keyword Research
  - Search Console Queries
  - Keyword Opportunities
  - Content Gap
- Content Ideas
  - Content Recommendations
  - AI Briefs
  - Template Fix Briefs
- Link Building / Internal SEO
  - Internal Link Graph
  - Fix Center
  - Link Opportunities

## 4. Missing Features And UX Improvements

### A. Project / Domain Table Improvements

- [x] Rename Sites page toward Projects or Sites and Projects.
- [x] Add project/folder grouping by client.
- [x] Add Semrush-style project rows.
- [x] Add search by client, project name, or domain.
- [x] Add columns:
  - Health score
  - Last crawl
  - Pages crawled
  - Errors
  - Warnings
  - Crawlability
  - HTTPS
  - Internal SEO
  - Schema / Markup
  - Fixes pending
  - Reports
- [x] Add row actions:
  - Open workspace
  - Run crawl
  - Create report
  - Settings

### B. Domain Workspace / Site Audit Detail

- [x] Rename the project workspace page header to `Site Audit: domain.com`.
- [x] Add breadcrumb: Home > SEO > Site Audit > domain.com.
- [x] Add context metadata row:
  - Domain
  - Client
  - Last updated
  - Pages crawled
  - Platform
  - JS rendering status
  - Verification status
- [x] Add action buttons:
  - Rerun crawl
  - Generate report / PDF
  - Export
  - Share
  - Settings
- [x] Convert stacked workspace sections into tabs:
  - Overview
  - Issues
  - Crawled Pages
  - Internal Links
  - Changes
  - Fixes
  - Reports
  - Integrations
- [x] Keep active project selector visible on every tab.

### C. Site Audit Overview Cards

- [ ] Add Site Health gauge/card.
- [ ] Add Crawled Pages breakdown:
  - Healthy
  - Broken
  - Have issues
  - Redirects
  - Blocked
- [ ] Add Errors card with trend.
- [ ] Add Warnings card with top warning list.
- [ ] Add AI Search Health / AI crawler accessibility card.
- [ ] Add Blocked from AI Search card:
  - ChatGPT-User
  - OAI-SearchBot
  - Googlebot
  - Google-Extended
- [ ] Add quick “View all issues” link from overview.

### D. Thematic Reports

- [ ] Add Thematic Reports section to domain workspace.
- [ ] Add Robots.txt card.
- [ ] Add Sitemap card.
- [ ] Add Crawlability card.
- [ ] Add HTTPS card.
- [ ] Add Internal Linking card.
- [ ] Add Markup / Schema card.
- [ ] Add Performance card.
- [ ] Add Indexability card.
- [ ] Add Canonicals card.
- [ ] Add JS Rendering card.
- [ ] Link each card to the relevant filtered detail view.

### E. Domain-Scoped Destination Pages

- [x] Add active project banner to domain-scoped destination pages.
- [x] Scope Pages by active domain.
- [x] Scope Issues by active domain.
- [x] Scope Fix Center by active domain.
- [x] Scope Reports by active domain.
- [x] Scope Technical Audit by active domain.
- [x] Scope AI Recommendations by active domain.
- [ ] Add persistent project selector to scoped pages.
- [ ] Add domain-scoped breadcrumbs to scoped pages.
- [ ] Make all scoped page “back” actions return to the domain workspace.

### F. Global Search / Command Bar

- [ ] Add top search bar.
- [ ] Search domains.
- [ ] Search clients.
- [ ] Search pages.
- [ ] Search issues.
- [ ] Search reports.
- [ ] Search actions such as “run crawl” or “create report.”
- [ ] Add keyboard shortcut later.

### G. Sidebar And Information Architecture

- [ ] Move from flat sidebar to grouped navigation.
- [ ] Add compact icon rail for primary product areas.
- [ ] Add expanded SEO menu with sections:
  - Dashboard
  - Site Performance
  - Competitive Analysis
  - Keyword Research
  - Content Ideas
  - Internal SEO
  - Reporting
- [ ] Keep agency admin pages separate from SEO tool pages.
- [ ] Avoid exposing internal docs or roadmap pages in customer navigation.

### H. Search Console Powered Position / Visibility Module

- [ ] Add “Search Performance” module as near-term position tracking substitute.
- [ ] Show visibility from GSC average position and impressions.
- [ ] Show improved queries.
- [ ] Show declined queries.
- [ ] Show top queries.
- [ ] Show top pages.
- [ ] Add date range filter.
- [ ] Add country/device filters when data exists.
- [ ] Reserve true keyword rank tracking as future paid subsystem.

### I. Reports And Export UX

- [ ] Add one-click PDF from domain workspace.
- [ ] Add CSV export for pages/issues.
- [ ] Add share link from domain workspace.
- [ ] Add report schedule shortcut from domain workspace.
- [ ] Show latest report status on project row.

### J. Visual Design System Adjustments

- [ ] Reduce overuse of large cards on dense operational pages.
- [ ] Use more compact tables where users need scanning/comparison.
- [ ] Keep card radius at 8px or less.
- [ ] Standardize section headers, action bars, tabs, and filter rows.
- [ ] Add health/status gauges where they clarify score state.
- [ ] Use consistent colors:
  - Green for healthy/fixed
  - Red for errors/critical
  - Amber for warnings/pending
  - Blue/violet for informational AI/workflow signals
- [ ] Prevent horizontal overflow in all tables and action rows.

## 5. Recommended Implementation Batches

### UX Batch 1: Project Table Upgrade

- [x] Upgrade Sites page into a Semrush-style Projects table.
- [x] Add richer domain metrics.
- [x] Add client/folder grouping.
- [x] Add search and compact row actions.

### UX Batch 2: Site Audit Workspace Upgrade

- [x] Rename workspace header to `Site Audit: domain.com`.
- [x] Add domain metadata row.
- [x] Add action bar.
- [x] Add tabs.
- [x] Move current workspace content into Overview tab.

### UX Batch 3: Thematic Reports

- [ ] Add thematic report cards.
- [ ] Map existing crawler/analyzer data into card states.
- [ ] Link each card to filtered details.

### UX Batch 4: Project Selector And Breadcrumbs

- [ ] Add active project selector to scoped pages.
- [ ] Add breadcrumbs to domain-scoped pages.
- [ ] Preserve `domainId` across navigation.

### UX Batch 5: Search Performance Module

- [ ] Build GSC-powered search performance dashboard.
- [ ] Add query/page/date filters.
- [ ] Link it from the domain workspace.

### UX Batch 6: Global Search / Command Bar

- [ ] Add global top search.
- [ ] Search domains, clients, pages, issues, reports, and actions.

## 6. Current Priority

The next implementation batch should be **UX Batch 1: Project Table Upgrade**.

Reason:

- It changes the first impression of the product.
- It reinforces the agency/domain operating model.
- It makes multiple-client management easier immediately.
- It matches the strongest pattern visible in the Semrush home and Site Audit list screenshots.

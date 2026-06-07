# UI/UX Competitor Gap Analysis

Last updated: 2026-06-08

## Goal

Make All In One SEO easier, softer, and more beautiful than the common SEO tool pattern for a nontechnical user. The product should answer three questions immediately:

- What is wrong?
- What should I fix first?
- What button do I press next?

## Sources Reviewed

- Semrush Site Audit Overview: https://www.semrush.com/kb/540-site-audit-overview
- Semrush Site Audit product page: https://www.semrush.com/features/site-audit/
- Semrush Site Audit Thematic Reports: https://www.semrush.com/kb/959-site-audit-thematic-reports
- Semrush Site Audit Issues report: https://www.semrush.com/kb/541-site-audit-issues-report
- Semrush Position Tracking: https://www.semrush.com/position-tracking/
- Semrush Position Tracking Overview: https://www.semrush.com/kb/549-position-tracking-overview-manual
- Ahrefs Site Audit: https://ahrefs.com/site-audit
- Ahrefs Site Audit issue settings: https://help.ahrefs.com/using-ahrefs/site-audit-new/how-to-configure-pre-set-issues-within-ahrefs-site-audit/
- Ubersuggest Site Audit guide: https://ubersuggest.zendesk.com/hc/en-us/articles/4405444013211-Running-a-Site-Audit-With-Ubersuggest
- Ubersuggest Site Audit tutorial: https://ubersuggest.zendesk.com/hc/en-us/articles/32125971038491-Site-Audit-Tutorial-and-Video-Guide
- Screaming Frog SEO Spider tabs: https://www.screamingfrog.co.uk/seo-spider/user-guide/tabs/

## Competitive Patterns

### Semrush

What works:

- Project-first entry point.
- Strong site health score and crawled-page summary.
- Issues split into errors, warnings, and notices.
- Thematic reports for crawlability, HTTPS, internal linking, markup, Core Web Vitals, and performance.
- Clear export/rerun/report actions after reviewing issues.
- Position tracking focuses on visibility, estimated traffic, average position, locations, devices, competitors, and change alerts.

Gap for us:

- We have many of these modules, but the experience still feels like separate product pages rather than one guided workflow.
- Our dashboard needs a plain-language next step before charts and tables.

### Ahrefs

What works:

- Strong health-score and crawl-history reporting.
- Dense but scannable audit data.
- Configurable issue importance for advanced teams.

Gap for us:

- We should keep the detailed power-user data, but hide the complexity behind simple first-step guidance for new users.

### Ubersuggest

What works:

- Beginner-friendly audit flow.
- Issues are paired with difficulty and potential SEO impact.
- Broad overview first, then recommendations.

Gap for us:

- Our issue pages should keep using "Solution" and "Do this" language, and the dashboard should do the same.

### Screaming Frog

What works:

- Excellent crawl data depth.
- Tabs and filters expose every technical detail.
- Real-time overview and issue tabs are strong for experts.

Gap for us:

- This is the pattern to avoid for the target user. We should not lead with technical tabs, raw crawl tables, or jargon.

## Current Product Gaps

| Area | Current State | Better Version |
| --- | --- | --- |
| First screen | Metrics, cockpit, tables, issue queue | Friendly action plan first, analytics second |
| Tone | Operational and technical | Calm, plain, encouraging, "do this next" |
| Navigation | Many SEO modules visible at once | Guided primary paths with advanced tools still available |
| Issue solving | Improved, but still spread across Issues, Fix Center, Recommendations | One recommended solution path per issue |
| Visual feel | Softer after latest theme pass, but still dense | More white space, softer panels, orange highlights, fewer competing sections |
| Nontechnical usability | Requires understanding SEO terms | Explain impact in human language and show the exact next button |

## Product Direction

The product should become a guided SEO assistant dashboard:

1. Start with "Today's SEO plan".
2. Show 3 to 5 plain-language next steps.
3. Use severity, impact, and effort labels.
4. Let the user click one button to continue.
5. Keep expert charts/tables lower on the page.

## Implementation Checklist

### Batch A: Friendly Dashboard

- [x] Add soft global theme.
- [x] Add "Today's SEO plan" panel to the dashboard.
- [x] Translate dashboard actions into plain language.
- [x] Move dense analytics below the guided plan.
- [x] Add friendly empty states for no sites, no issues, and no reports.

### Batch B: Navigation Simplification

- [x] Rename technical labels where possible:
  - Sites -> Projects
  - Fix Center -> Fixes
  - AI -> Content Ideas
  - Technical -> Internal Links
- [x] Add a compact "main path" section:
  - Dashboard
  - Projects
  - Problems
  - Fixes
  - Reports
- [x] Keep advanced sections visually quieter.

### Batch C: Issue Solving

- [x] Put the recommended solution above issue metadata everywhere.
- [x] Add "Why this matters" in plain English.
- [x] Add "Can I fix this here?" status:
  - Yes, apply fix
  - Needs CMS
  - Needs developer
- [x] Group URL-specific technical issue types into friendly filter categories.
- [x] Default the Problems page to a short prioritized list with an explicit show-all option.
- [x] Keep the template filter short by showing only high-priority patterns by default.
- [x] Add one-click export/handoff where direct fix is not possible.

### Batch D: Visual Polish

- [x] Reduce uppercase labels on user-facing cards.
- [x] Use softer section dividers.
- [x] Use orange only for primary actions.
- [x] Use green for healthy/done.
- [x] Use amber/red only for actual urgency.
- [x] Make dashboard sections shorter and more scannable.

### Batch E: Verification

- [x] Browser-check live dashboard after login.
- [x] Browser-check mobile viewport.
- [x] Confirm no route errors in Vercel logs.
- [x] Confirm user can move from dashboard to one fix path without confusion.

### Batch F: Analytics Simplification

- [x] Add a plain-language growth plan above Search Performance metrics.
- [x] Move advanced Search Performance filters into a collapsible section.
- [x] Replace hard black analytics actions with orange primary actions.
- [x] Reduce uppercase analytics labels in Search Performance, saved views, and reusable SEO filters.
- [x] Apply the same guided-plan pattern to keyword research and competitor analysis.
- [x] Browser-check live Search Performance desktop and mobile.

### Batch G: Softer Frontend Pass

- [x] Lighten the global canvas, borders, shadows, and surface treatment.
- [x] Add softer expandable-section behavior for dense setup areas.
- [x] Add a plain-language report delivery plan above report setup.
- [x] Collapse advanced report schedule, template, and white-label setup blocks.
- [x] Reduce uppercase labels on the Reports workflow.
- [x] Keep mobile navigation focused on the main path so page content appears sooner.
- [ ] Browser-check Reports desktop and mobile after deployment.

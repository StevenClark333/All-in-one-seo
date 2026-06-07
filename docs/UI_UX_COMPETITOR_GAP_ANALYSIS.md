# UI/UX Competitor Gap Analysis

Last updated: 2026-06-08

## Goal

Make All In One SEO easier, softer, and more beautiful than the common SEO tool pattern for a nontechnical user. The product should answer three questions immediately:

- What is wrong?
- What should I fix first?
- What button do I press next?

## Sources Reviewed

- Semrush Site Audit Overview: https://www.semrush.com/kb/540-site-audit-overview
- Semrush Site Audit Crawled Pages: https://www.semrush.com/kb/543-site-audit-crawled-pages
- Semrush Site Audit product page: https://www.semrush.com/features/site-audit/
- Semrush Site Audit Thematic Reports: https://www.semrush.com/kb/959-site-audit-thematic-reports
- Semrush Site Audit Issues report: https://www.semrush.com/kb/541-site-audit-issues-report
- Semrush Position Tracking: https://www.semrush.com/position-tracking/
- Semrush Position Tracking Overview: https://www.semrush.com/kb/549-position-tracking-overview-manual
- Semrush pricing: https://www.semrush.com/pricing/
- Ahrefs pricing: https://ahrefs.com/pricing
- Ahrefs limits and usage help: https://help.ahrefs.com/en/articles/9720420-what-is-my-subscription-plan-how-can-i-check-what-i-have
- Ahrefs Site Audit: https://ahrefs.com/site-audit
- Ahrefs Site Audit Page Explorer filters: https://help.ahrefs.com/en/articles/1399529-how-to-use-site-audit-filters-in-page-explorer-and-link-explorer
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
| Integrations | Long provider setup page that starts with an admin-style form | Plain-language connection plan first, then provider setup only when needed |
| Rank tracking | Metrics, filters, and manual data forms appear before guidance | Show rank movement guidance first, then charts, then advanced data management |
| Billing | Plan, usage, and upgrade choices appear as admin data | Start with reassurance: current plan, usage risk, and the safest next billing action |
| Pages | Crawl inventory starts with metrics, templates, filters, and a table | Start with a page-care plan: risky pages, repeated template fixes, and easy title checks |
| Internal Links | Link graph starts as technical metrics, issues, opportunities, and a detailed table | Lead with suggested links, hard-to-find pages, and coverage before showing graph detail |
| Projects | Wide audit table and bulk import appear as the main experience | Start with setup/health/next-project guidance, then keep the table as detail |
| Settings | Team roles, permissions, invites, and removals feel like admin controls | Start with seat comfort, admin safety, and pending invites before detailed role rules |
| Clients | Agency client management opens with counts, issue load, settings, and imports | Start with client care: setup gaps, urgent attention, and reports worth sharing |
| Content Ideas | AI recommendation center starts with generation lists and quota wording | Start with page copy, fix briefs, and repeated-page help in plain language |

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
- [x] Browser-check Reports desktop and mobile after deployment.

### Batch H: Integration Setup Simplification

Competitive evidence:

- Semrush keeps site audit detail behind severity groups and thematic reports, so users do not have to understand every technical check at once.
- Ahrefs pairs health-score summaries with issue groups and fix instructions.
- Ubersuggest frames audit issues around actionable recommendations, which is closer to the nontechnical user target.

Implementation:

- [x] Add a connection setup plan above Integrations provider detail.
- [x] Start with Google data, website platform, and automation as three plain-language choices.
- [x] Collapse the generic manual integration form behind a softer expandable row.
- [x] Add direct anchors for Search Console, Analytics, WordPress, Shopify, and configured integrations.
- [x] Reduce uppercase labels through shared Integrations metadata helpers.
- [x] Browser-check Integrations desktop and mobile after deployment.

### Batch I: Rank Tracking Simplification

Competitive evidence:

- Semrush Position Tracking leads with visibility, estimated traffic, average position, competitor comparison, and top 3/10/20/100 ranking views.
- Ahrefs Rank Tracker focuses on what moved, wins/losses, competitor gains, average position, position distribution, and device/location context.
- The better nontechnical version should explain which keyword needs attention next before showing inventory tables or manual rank-entry forms.

Implementation:

- [x] Add a plain-language rank movement plan above rank metrics.
- [x] Move saved views and filters into a collapsible "Adjust rank view" section.
- [x] Collapse manual keyword, rank, and metric entry forms into "Manage tracking data".
- [x] Add direct anchors for rank distribution, data management, tracked keywords, and competitor gaps.
- [x] Reduce uppercase labels in Rank Tracking metrics, forms, and metadata helpers.
- [x] Browser-check Rank Tracking desktop and mobile after deployment.

### Batch J: Billing Calmness

Competitive evidence:

- Semrush and Ahrefs pricing pages center plan limits, projects, tracked keywords, usage, and upgrade paths.
- Ahrefs help explicitly directs users to account limits and usage, which makes usage confidence part of billing UX.
- A nontechnical billing page should answer "am I okay?", "am I near a limit?", and "should I change anything?" before showing plan cards.

Implementation:

- [x] Add a plain-language billing comfort plan above current plan and usage detail.
- [x] Make current plan, usage risk, and invoices/payment the first three billing choices.
- [x] Add anchors for current plan, usage, and plan comparison.
- [x] Highlight the current plan inside plan cards.
- [x] Reduce uppercase labels in Billing metadata.
- [x] Browser-check Billing desktop and mobile after deployment.

### Batch K: Frontend Softness and Alerts Calmness

Competitive evidence:

- Semrush keeps monitoring and tracking workflows calm by surfacing a short status summary before dense configuration.
- A friendlier SEO portal should make alerts feel like "what should I watch?" rather than a technical routing table.
- The primary navigation should feel light and stable so users can scan the main path without a heavy admin-console frame.

Implementation:

- [x] Soften the primary sidebar rail from dark navy to a light, quiet rail.
- [x] Rename the Alerts primary action from "Evaluate rules" to "Check alerts now".
- [x] Add a plain-language alert comfort plan above rule configuration.
- [x] Surface active rules, delivery health, and latest signal as compact cards.
- [x] Add anchors for alert rules, delivery history, and rule creation.
- [x] Replace uppercase alert form labels and metadata labels with softer labels.
- [x] Add friendlier empty states for no alert rules and no deliveries.
- [x] Browser-check Alerts desktop and mobile locally.

### Batch L: Page Inventory Calmness

Competitive evidence:

- Semrush and Ahrefs both keep crawled-page inventory useful by combining page-level data with issue groups, statuses, and filters.
- Screaming Frog exposes deep page tables for experts, but that is the pattern to soften for this product's target user.
- A nontechnical page inventory should answer "which pages need attention?" and "can one template fix help many pages?" before showing raw crawl rows.

Implementation:

- [x] Add a plain-language page care plan above page metrics and crawl inventory.
- [x] Surface critical pages, repeated template fixes, and missing titles as the first three choices.
- [x] Add anchors for page inventory and template groups.
- [x] Rename the filter action to "Show pages" and the domain label to "Project".
- [x] Explain template groups as repeated-page fixes instead of URL-pattern scoring.
- [x] Replace uppercase page metrics, table headers, and mobile metadata labels with softer labels.
- [x] Add friendlier empty states for no page patterns and no crawled pages.

### Batch M: Internal Link Calmness

Competitive evidence:

- Semrush surfaces internal linking as a thematic audit area instead of forcing users to start with raw crawl rows.
- Ahrefs keeps internal-link work tied to site audit/page explorer workflows, where issues and opportunities can be filtered.
- Screaming Frog exposes the deepest link tables for experts, but this product should keep that detail below a friendlier plan.

Implementation:

- [x] Rename the page from "Internal link graph" to the softer "Internal links".
- [x] Add a plain-language link care plan above metrics and graph details.
- [x] Surface suggested links, hard-to-find pages, and coverage as the first three choices.
- [x] Add anchors for suggested links, link issues, and detailed link counts.
- [x] Rename "Graph issues" to "Link issues" and "Page link metrics" to "Detailed link counts".
- [x] Replace uppercase technical metadata labels and table headers with softer labels.
- [x] Add friendlier empty states for no link suggestions, no link issues, and no link data.

### Batch N: Project List Calmness

Competitive evidence:

- Semrush and Ahrefs both organize work around projects/site audits before users drill into detailed tables.
- The strongest pattern is to show project health and setup state first, then let users open the project that needs attention.
- For a nontechnical user, bulk import and dense audit columns should be optional detail, not the top-level workflow.

Implementation:

- [x] Rename "Sites and Projects" to the simpler "Projects".
- [x] Add a plain-language project care plan above the wide audit table.
- [x] Surface setup gaps, lowest-health project, and ready projects as the first three choices.
- [x] Add compact project summary cards above the detailed table.
- [x] Rename "Project audit table" to "Project details".
- [x] Replace uppercase project table labels and client group labels with softer labels.
- [x] Collapse bulk import behind an optional "Add many projects at once" panel.

### Batch O: Settings Calmness

Competitive evidence:

- Semrush and Ahrefs account areas rely on seats, roles, and workspace access rules, which can feel administrative for nontechnical users.
- A softer version should answer "who can access this?", "do I have seats?", and "which invite needs attention?" before showing detailed permissions.
- Role detail should be available but not dominate the first view.

Implementation:

- [x] Add a plain-language workspace comfort plan above team management.
- [x] Surface seats, trusted admins, and pending invites as the first three choices.
- [x] Add anchors for team members, invite teammate, and pending invitations.
- [x] Move invite teammate above detailed role permissions.
- [x] Collapse role permissions into an optional role guide.
- [x] Add role descriptions directly under each teammate.
- [x] Rename actions to "Save role" and "Remove access".
- [x] Add a friendlier pending-invitations empty state.

### Batch P: Client Care Calmness

Competitive evidence:

- Semrush and Ahrefs both organize agency work around projects, reports, and client-facing outcomes, but the detail can still feel like account administration.
- A softer client workflow should answer "who needs setup?", "who needs attention?", and "what can I share with the client?" before showing tables or settings.
- Bulk import and client settings should stay available, but not dominate the first view for a nontechnical user.

Implementation:

- [x] Add a plain-language client care plan above the client list.
- [x] Surface setup gaps, urgent clients, and report readiness as the first three choices.
- [x] Rename "Agency clients" to "Client list" and soften list helper text.
- [x] Collapse bulk client import behind an optional "Add many clients at once" panel.
- [x] Add an easy setup guide on the new-client screen.
- [x] Rename the new-client primary action to "Create client".
- [x] Add a plain-language client next-steps plan on client detail pages.
- [x] Rename "Client domains" to "Client websites".
- [x] Collapse client settings behind an optional detail panel.
- [x] Add friendlier empty states for no clients, no websites, no priority issues, and no reports.

### Batch Q: Content Ideas Calmness

Competitive evidence:

- Semrush content tools frame work around content ideas, writing assistance, readability, SEO, and next content actions rather than exposing prompt mechanics first.
- Ahrefs-style content workflows are most useful when they point to gaps, pages, and fixes before showing deeper data.
- A nontechnical user should choose "help me write page copy", "help me explain a fix", or "help me handle repeated pages" before seeing raw AI generation lists.

Implementation:

- [x] Rename the page heading from "AI recommendations" to "Content Ideas".
- [x] Add a plain-language content idea plan above domain filters and generation sections.
- [x] Surface page copy, fix briefs, and repeated-page briefs as the first three choices.
- [x] Replace quota wording with "ideas left this month".
- [x] Collapse heavy generation sections into expandable page copy, fix brief, and repeated-page areas.
- [x] Rename generic "Generate" actions to "Create page ideas", "Create fix brief", and "Create shared brief".
- [x] Rename recent recommendations to "Saved ideas and briefs".
- [x] Add friendlier empty states for no pages, no fix briefs, and no repeated-page briefs.

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
- Semrush My Reports: https://www.semrush.com/kb/34-my-reports
- Ahrefs pricing: https://ahrefs.com/pricing
- Ahrefs limits and usage help: https://help.ahrefs.com/en/articles/9720420-what-is-my-subscription-plan-how-can-i-check-what-i-have
- Ahrefs Site Audit: https://ahrefs.com/site-audit
- Ahrefs Report Builder: https://ahrefs.com/report-builder
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

| Area                   | Current State                                                                                   | Better Version                                                                                           |
| ---------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| First screen           | Metrics, cockpit, tables, issue queue                                                           | Friendly action plan first, analytics second                                                             |
| Tone                   | Operational and technical                                                                       | Calm, plain, encouraging, "do this next"                                                                 |
| Navigation             | Many SEO modules visible at once                                                                | Guided primary paths with advanced tools still available                                                 |
| Issue solving          | Improved, but still spread across Issues, Fix Center, Recommendations                           | One recommended solution path per issue                                                                  |
| Visual feel            | Softer after latest theme pass, but still dense                                                 | More white space, softer panels, orange highlights, fewer competing sections                             |
| Nontechnical usability | Requires understanding SEO terms                                                                | Explain impact in human language and show the exact next button                                          |
| Integrations           | Long provider setup page that starts with an admin-style form                                   | Plain-language connection plan first, then provider setup only when needed                               |
| Rank tracking          | Metrics, filters, and manual data forms appear before guidance                                  | Show rank movement guidance first, then charts, then advanced data management                            |
| Billing                | Plan, usage, and upgrade choices appear as admin data                                           | Start with reassurance: current plan, usage risk, and the safest next billing action                     |
| Pages                  | Crawl inventory starts with metrics, templates, filters, and a table                            | Start with a page-care plan: risky pages, repeated template fixes, and easy title checks                 |
| Internal Links         | Link graph starts as technical metrics, issues, opportunities, and a detailed table             | Lead with suggested links, hard-to-find pages, and coverage before showing graph detail                  |
| Projects               | Wide audit table and bulk import appear as the main experience                                  | Start with setup/health/next-project guidance, then keep the table as detail                             |
| Settings               | Team roles, permissions, invites, and removals feel like admin controls                         | Start with seat comfort, admin safety, and pending invites before detailed role rules                    |
| Clients                | Agency client management opens with counts, issue load, settings, and imports                   | Start with client care: setup gaps, urgent attention, and reports worth sharing                          |
| Content Ideas          | AI recommendation center starts with generation lists and quota wording                         | Start with page copy, fix briefs, and repeated-page help in plain language                               |
| Fixes                  | Fix Center starts with many statuses, filters, audit details, and delivery mechanics            | Start with one calm path: review a fix, send it, then check it                                           |
| Project Setup          | Add-domain and project detail pages start with domain/crawl/settings language                   | Start with website setup, verification, first crawl, and the clearest next problem                       |
| Account Start          | Signup, login, reset, and workspace creation feel like bare account forms                       | Start with reassurance, explain the setup path, and use softer action language                           |
| Verification           | Ownership, email, and password confirmation pages still feel like technical blockers            | Explain why the check matters, show one safe path, and make the next action obvious                      |
| Reports                | Report detail and shared reports still start like analytics summaries                           | Start with the client story: main takeaway, what changed, and next fix before metrics                    |
| Crawl Runs             | Individual crawl pages start with raw artifacts, detected changes, and snapshots                | Start with a crawl recap: result, changed pages, failed pages, and what to open next                     |
| Project Workspace      | Domain workspace still reads like a command center with dense labels and many paths             | Start with a short website focus plan, softer actions, and calmer section labels before deeper analytics |
| Workspace Depth        | Lower workspace sections still create a long scroll and repeated help text in headings          | Keep the summary visible, collapse deeper work queues, and make help text quieter                        |
| Content Ideas Depth    | Content Ideas still opens long page, issue, template, and saved-output lists                    | Keep the writing plan first, then show short previews with full lists one click away                     |
| Tool Labels            | Project tool tabs still use mixed labels like Crawled Pages, Google Results, and Rank Tracker   | Use short, friendly labels consistently: Pages, Search, Rank, Links, and Ideas                           |
| Internal Links Depth   | Internal Links still shows too many issues and page-count rows at once                          | Keep suggested links first, limit issue previews, and collapse detailed link counts                      |
| Dashboard Depth        | Dashboard still exposes portfolio tables and production build details before problem review     | Keep the plan and top problems visible, then make workspace/build detail optional                        |
| Search Ideas Depth     | Keyword Research still opens with cockpit language, several full lists, and raw query inventory | Rename to Search Ideas, show short action previews, and make deeper keyword data optional                |
| Competitor Depth       | Competitive Analysis still leads into setup forms and a full domain comparison table            | Rename to Competitor Insights, keep watchlist previews visible, and make setup/table detail optional     |
| Rank Depth             | Rank Tracking still exposes a full tracked-keyword inventory table in the main view             | Lead with movement/gaps, then make keyword inventory optional and capped                                 |
| Product Softness       | Shared cards, tables, loading states, and navigation still feel slightly admin-like             | Use calmer canvas, lighter surfaces, softer rows, warmer action states, and quieter loading transitions  |
| Projects Concision     | Projects page still lets a wide audit table and import tools compete with the first decision    | Lead with a risk-based shortlist, then collapse full inventory and bulk import into optional detail      |
| Problems Flow          | Problems page still exposed filters and bulk status controls before the actual solve path       | Lead with the clearest fix, then keep filters and multi-change controls optional                         |

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

### Batch R: Fix Workflow Calmness

Competitive evidence:

- Semrush Site Audit Issues groups problems by severity and keeps export/rerun/report actions close to issue review.
- Ahrefs-style audit workflows keep detailed issue and page data available, but the first view should still point to the next practical fix.
- Ubersuggest pairs audit issues with recommendation language, impact, and difficulty, which is closer to the nontechnical user target.

Implementation:

- [x] Rename the page lead from "Recommended fixes ready to apply" to the simpler "Fixes".
- [x] Add a plain-language fix comfort plan above status counters.
- [x] Surface review, send, and check as the first three choices.
- [x] Move detailed fix and verification counters into an optional "Detailed fix status" panel.
- [x] Rename "Fixes to apply" to "Fix list".
- [x] Collapse domain/status filters behind "Adjust fix view".
- [x] Rename the filter action to "Show fixes".
- [x] Rename fix actions to "Approve fix", "Mark sent", "Mark fixed", "Save edit", and "Send fix".
- [x] Add a friendlier empty state for no fixes ready yet.

### Batch S: Project Setup Calmness

Competitive evidence:

- Semrush and Ahrefs keep project/site audit workflows centered on a project, its setup state, crawl health, and issues before users drill into technical settings.
- Screaming Frog-style raw crawl details are powerful, but the nontechnical user should not start with domain settings, scripts, artifacts, and lifecycle actions.
- A softer project workflow should answer "is setup done?", "can I crawl?", and "what should I fix next?" first.

Implementation:

- [x] Rename the new-domain flow to "Add project website".
- [x] Add a plain-language website setup plan above the project creation form.
- [x] Rename "Domain" to "Website address", "Client" to "Client or brand", and "Crawl frequency" to "Crawl rhythm".
- [x] Replace the pending-verification note with a calmer verification explanation.
- [x] Rename the primary project creation action to "Add website".
- [x] Add a plain-language project care plan above project detail metrics.
- [x] Surface setup, crawl, and problems as the first three choices on project detail.
- [x] Rename project detail settings to optional "Project details".
- [x] Collapse lifecycle controls, install script, and crawl files behind optional panels.
- [x] Replace uppercase project metrics and table labels with softer labels.
- [x] Add friendlier empty states for no crawled pages, no crawl files, and no open issues.

### Batch T: Account Start Calmness

Competitive evidence:

- Semrush and Ahrefs both rely on account, project, and workspace setup before users reach audit data, so the entry flow must reduce uncertainty.
- A nontechnical user should know what will happen after signup before being asked for workspace details.
- Login and password reset should feel safe and reassuring instead of like bare system forms.

Implementation:

- [x] Add a three-step start plan to signup.
- [x] Rename the signup workspace label to "Workspace name".
- [x] Rename the signup action to "Create my workspace".
- [x] Add calming context copy and orange primary action treatment to login.
- [x] Add privacy-safe helper copy and orange primary action treatment to password reset.
- [x] Add gentle setup plans to business and agency onboarding.
- [x] Rename business and agency onboarding primary actions to "Create workspace".
- [x] Add a workspace setup plan to the generic create-workspace screen.
- [x] Rename "Workspace type" to "Best fit".

### Batch U: Verification Calmness

Competitive evidence:

- Semrush and Ahrefs both rely on project setup and verified data sources before deeper analytics become useful, but the best user experience keeps setup blockers short and reassuring.
- A nontechnical user should understand why ownership, email, and password checks matter before seeing records, tokens, or system actions.
- Technical history should stay available for support, but it should not dominate the first view.

Implementation:

- [x] Rename the domain verification header to "Confirm ownership".
- [x] Add a plain-language verification comfort plan above ownership methods.
- [x] Explain the ownership check in terms of safe crawls and fixes.
- [x] Rename "Use method" to "Show instructions".
- [x] Rename verification generation and check actions to "Create setup value" and "Check ownership".
- [x] Use softer orange primary actions on verification blockers.
- [x] Collapse verification history into an optional panel.
- [x] Add a friendlier empty state for no verification checks.
- [x] Soften email confirmation copy and action language.
- [x] Soften password reset confirmation copy and action language.

### Batch V: Report Storytelling Calmness

Competitive evidence:

- Semrush My Reports emphasizes client-ready report creation, PDF delivery, scheduling, templates, and branded sharing rather than raw audit tables.
- Ahrefs Report Builder focuses on shareable, polished SEO reporting with reusable report structures.
- A nontechnical user should be able to open a report and immediately know what to tell a client before reviewing every metric.

Implementation:

- [x] Add report-focused competitor sources to the roadmap.
- [x] Rename report creation and setup actions with calmer, client-oriented language.
- [x] Replace black primary report actions with softer orange primary actions.
- [x] Add a "Client story" panel to internal report detail pages.
- [x] Add a "Client summary" panel to public shared report pages.
- [x] Lead reports with main takeaway, what changed, and next fix before metric blocks.
- [x] Soften report metric labels by removing uppercase tracking.
- [x] Improve report empty states for templates and schedules.
- [x] Make "Create client link" reliably create a share token for draft reports.

### Batch W: Crawl Recap Calmness

Competitive evidence:

- Semrush Site Audit and Crawled Pages views emphasize crawl status, issue movement, and crawled-page summaries before deeper technical evidence.
- Ahrefs-style crawl history is useful, but the first view should explain whether the crawl worked and where to look next.
- Screaming Frog-style artifacts, response codes, and snapshots should remain available for experts without becoming the first thing a nontechnical user has to parse.

Implementation:

- [x] Rename crawl-run detail to "Crawl recap".
- [x] Add a plain-language crawl recap plan above metrics.
- [x] Surface crawl result, changed pages, failed pages, and best next step.
- [x] Rename "Cancel crawl" to the softer "Stop crawl".
- [x] Use orange icon treatment and softer metric labels.
- [x] Collapse robots/sitemap artifacts behind an optional panel.
- [x] Collapse page snapshots behind an optional panel.
- [x] Add friendlier empty states for missing artifacts and snapshots.

### Batch X: Project Workspace Calmness

Competitive evidence:

- Semrush Site Audit overview leads with status, top issues, and direct rerun/report actions before deeper audit detail.
- Ahrefs and Ubersuggest keep audit depth available, but the useful first step is a short health summary and clear next action.
- A nontechnical user should not have to choose between every SEO module before knowing what to do today.

Implementation:

- [x] Rename the workspace header away from "Site Audit" language.
- [x] Add a plain-language website focus plan above the workspace analytics.
- [x] Surface the first fix, latest crawl, and report update as three clear choices.
- [x] Rename "Rerun crawl" to "Run new check" and make it the softer orange primary action.
- [x] Rename "Generate report" to "Create report" and "PDF" to "Download PDF".
- [x] Rename workspace tabs from "Crawled Pages", "Search Performance", and "AI" to shorter labels.
- [x] Replace command-center/cockpit language with calmer project-plan wording.
- [x] Remove uppercase tracking from workspace helper cards and metadata.
- [x] Limit workspace page inventory to a short preview with a direct full-pages action.

### Batch Y: Workspace Depth Calmness

Competitive evidence:

- Semrush and Ubersuggest keep the first audit screen focused on status, top work, and a few drill-down paths instead of exposing every lower table at once.
- Ahrefs keeps deep detail available, but the summary and filters guide the user before raw inventory.
- A nontechnical user benefits when extra analytics are visible on demand without making the first page feel endless.

Implementation:

- [x] Move lower workspace detail into a single "More project details" expandable panel.
- [x] Keep work queue, search performance, priority issues, page preview, readiness, crawl history, changes, and reports available inside that panel.
- [x] Make help icons use a short accessible label instead of repeating full tooltip copy in headings.
- [x] Add a short explanation that the deeper analytics are optional and can be opened when needed.

### Batch Z: Content Ideas Depth Calmness

Competitive evidence:

- Semrush and Ubersuggest keep recommendation flows focused on a small number of next actions before deeper lists.
- Ahrefs-style depth is useful for advanced users, but a nontechnical writing workflow should not open with every URL and every issue.
- A softer content workflow should make "pick page copy, fix brief, or repeated-page brief" the main decision, with inventory available only when requested.

Implementation:

- [x] Keep the Content Ideas plan as the first decision point.
- [x] Close page-copy, fix-brief, and repeated-page sections by default.
- [x] Limit page-copy and fix-brief previews to the first 8 items.
- [x] Limit repeated-page brief previews to the first 6 groups.
- [x] Limit saved ideas and briefs to the first 8 outputs.
- [x] Add friendly preview notes that send users to the full Pages or Problems view when more items exist.

### Batch AA: Navigation Label Calmness

Competitive evidence:

- Semrush product navigation uses short, recognizable labels and keeps deeper concepts inside the page, not in every tab name.
- A nontechnical user should not have to parse labels like "Crawled Pages" or "Google Results" just to move around.
- Short labels reduce horizontal overflow and make project tools easier to scan on smaller screens.

Implementation:

- [x] Rename shared project tool labels:
  - Crawled Pages -> Pages
  - Google Results -> Search
  - Rank Tracker -> Rank
  - Internal Links -> Links
  - Content Ideas -> Ideas
- [x] Align sidebar display labels for Search, Rank, and Links.

### Batch AB: Internal Links Depth Calmness

Competitive evidence:

- Semrush-style internal linking guidance keeps the next helpful action visible before deeper crawl inventory.
- Ahrefs and Screaming Frog provide deep link counts, but those details should be optional for nontechnical users.
- A softer workflow should make suggested links feel like the main path and keep long issue/page lists out of the first view.

Implementation:

- [x] Limit suggested link previews to the first 8 clear actions.
- [x] Limit link issue previews to the first 8 items.
- [x] Add plain-language preview notes when more opportunities, issues, or pages exist.
- [x] Rename "Detailed link counts" to "More link detail".
- [x] Collapse page-by-page link counts by default.
- [x] Limit the expanded link-count table to the first 10 pages.

### Batch AC: Dashboard Depth Calmness

Competitive evidence:

- Semrush and Ahrefs overview screens prioritize health, issue status, and clear next actions before deeper project inventory.
- Ubersuggest keeps the beginner audit path focused on simple recommendations and avoids leading with internal product status.
- A nontechnical user should not have to read a portfolio table or build checklist before seeing what problem to fix next.

Implementation:

- [x] Move website/project detail into a closed "More workspace detail" panel.
- [x] Rename "Monitored sites" detail to softer website/client site detail language.
- [x] Limit the dashboard website detail preview to 6 rows.
- [x] Add a plain-language preview note that sends users to Projects for the full list.
- [x] Rename "Production build map" to "Product setup checklist".
- [x] Explain that setup checklist content is internal and skippable for most users.

### Batch AD: Search Ideas Depth Calmness

Competitive evidence:

- Semrush Keyword Overview and Position Tracking make keyword work feel like choosing the next opportunity, not reading every query row at once.
- Ahrefs and Ubersuggest expose deep keyword data, but beginner-friendly flows keep the next content action visible first.
- A nontechnical user should see one useful search idea, one page to improve, and optional deeper query detail.

Implementation:

- [x] Rename the Keyword Research page header to "Search ideas".
- [x] Replace "Demand cockpit" with softer "Search demand" language.
- [x] Rename "Workflow queue" to "Writing queue".
- [x] Limit best search idea previews to the first 8 items.
- [x] Limit page-improvement previews to the first 6 items.
- [x] Move competitor gaps, intent groups, and raw query inventory into a closed "More search detail" panel.
- [x] Limit deeper competitor and query previews inside that panel.
- [x] Add plain-language preview notes when more ideas or queries exist.

### Batch AE: Competitor Depth Calmness

Competitive evidence:

- Semrush competitor views emphasize who is leading, which competitor is worth watching, and which organic opportunities to act on next.
- Ahrefs and Ubersuggest keep deeper competitor tables available, but the beginner-friendly path starts with a short watchlist and next action.
- A nontechnical user should not need to fill a competitor form or read a full domain table before seeing who is ahead.

Implementation:

- [x] Rename the Competitive Analysis page header to "Competitor insights".
- [x] Soften the header copy toward who is ahead and what to improve next.
- [x] Rename external competitor list to "Competitors to watch".
- [x] Limit visible competitor rows to the first 6.
- [x] Move the Add Competitor form into a closed optional panel.
- [x] Move the domain comparison table into a closed "More comparison detail" panel.
- [x] Limit the expanded domain comparison preview to the first 6 projects.
- [x] Add plain-language preview notes when more competitors or projects exist.

### Batch AF: Rank Depth Calmness

Competitive evidence:

- Semrush Position Tracking focuses on movement, visibility, top positions, and competitor changes before raw keyword lists.
- Ahrefs and Ubersuggest expose rank tables, but nontechnical users benefit from seeing drops and opportunities first.
- A softer rank page should answer "what moved?" before showing every tracked keyword row.

Implementation:

- [x] Rename the Rank Tracking page header to "Rank movement".
- [x] Soften the header copy toward moved, dropped, and improvable keywords.
- [x] Keep competitor rank gaps visible before raw keyword inventory.
- [x] Limit visible competitor rank gaps to the first 6 items.
- [x] Move tracked keyword inventory into a closed "More keyword detail" panel.
- [x] Limit the expanded keyword inventory preview to the first 8 keywords.
- [x] Remove uppercase tracking from the keyword inventory table header.
- [x] Add plain-language preview notes when more rank gaps or keywords exist.

### Batch AG: Product Softness Pass

Competitive evidence:

- Semrush keeps dense analytics readable by using a calm canvas, soft panels, restrained borders, and orange as the main action color.
- A nontechnical user benefits when shared UI chrome feels consistent before they enter deeper SEO data.
- Softer loading and table states make the app feel smoother even when pages are data-heavy.

Implementation:

- [x] Remove the decorative global glow and use a calmer canvas.
- [x] Lighten shared borders, shadows, cards, and hover states.
- [x] Make tables easier to scan with softer headers and calmer row hover.
- [x] Make primary orange actions feel warmer and less heavy.
- [x] Soften sidebar rail, main path surface, and secondary navigation hover states.
- [x] Soften route loading skeletons so page transitions feel smoother.

### Batch AH: Projects Concision

Competitive evidence:

- Semrush project and audit views make the next project action visible before deep crawl inventory.
- Ahrefs and Screaming Frog expose deep tables, but those tables are better as optional detail for nontechnical users.
- A softer Projects page should answer "which website should I open first?" before showing every audit column.

Implementation:

- [x] Add a risk-based project shortlist above the full project inventory.
- [x] Sort the shortlist by setup needs, critical problems, lower health, and pending fixes.
- [x] Limit the first view to six project cards.
- [x] Move the wide project audit table into a closed "More project detail" section.
- [x] Keep search and the full table available inside the optional detail section.
- [x] Keep bulk project import collapsed as an agency-only advanced action.
- [x] Rename the global loading copy from command-center language to "Loading your workspace."

### Batch AI: Problems Flow Calmness

Competitive evidence:

- Semrush Issues views organize problems by severity, but the first useful step is still which item to open and what action to take.
- Ubersuggest-style beginner flows pair audit findings with simple recommendations before advanced filtering.
- A nontechnical user should not see filters and bulk controls before the recommended problem-solving path.

Implementation:

- [x] Rename the Problems header away from "SEO issues" language.
- [x] Add a plain-language "Problem solving plan" above filters and the issue list.
- [x] Surface the first urgent problem, guided-fix count, and critical/warning mix as the first decision.
- [x] Move the full filter form into a closed "Refine problem list" section.
- [x] Replace workflow/filter wording with softer problem/status language.
- [x] Move bulk status updates into a closed "Change several at once" section.
- [x] Keep top problems and solution cards visible before advanced controls.

### Batch AJ: Fix Center Calmness

Competitive evidence:

- Semrush-style workflows make the next fix action visible before exposing delivery history, exports, or technical status.
- Nontechnical users need "review, send, check" language before they see platform handoff details.
- Fix detail should stay available, but the first view should feel like a short task queue, not an automation audit.

Implementation:

- [x] Soften the Fix Center header copy toward reviewing one fix, sending instructions, and checking improvement.
- [x] Rename detailed status to "More fix progress" and keep it optional.
- [x] Replace visible workflow and delivery audit wording with send options, progress notes, and website language.
- [x] Rename user-facing fix statuses from draft/exported/applied to ready to review/sent/fixed.
- [x] Rename verification failure and pending states to softer action labels.
- [x] Use the send icon and plain send wording on the fix send action.
- [x] Soften the shared Fixes navigation description away from export and technical-detail language.
- [x] Keep platform instructions, snippets, and timestamps available inside optional detail panels.

### Batch AK: Alerts Watch Calmness

Competitive evidence:

- Semrush and Ahrefs make monitoring easier by showing high-level health and important changes before notification plumbing.
- Ubersuggest-style beginner flows work better when setup language says what the user wants to watch, not how routing is configured.
- A nontechnical user should see "what is being watched?" before delivery history, escalation, or channel details.

Implementation:

- [x] Rename the Alerts page header to "Watch changes".
- [x] Soften the header copy toward important website changes and simple notifications.
- [x] Rename the primary action to "Check now".
- [x] Move alert-rule creation into a closed "Add a watch" panel.
- [x] Rename rule setup fields to watch name, website, change to watch, importance, and send by.
- [x] Move backup notification fields into a nested optional panel.
- [x] Rename "Alert rules" to "Watching now".
- [x] Move delivery history into a closed "Message history" panel.
- [x] Make the watch list full width so message history no longer competes with the main task.
- [x] Remove the duplicate empty-state setup button so "Add a watch" is the single setup entry point.
- [x] Replace delivery/routing/escalation wording with message health, backup notification, and watch language.

### Batch AL: Reports Update Calmness

Competitive evidence:

- Semrush report workflows emphasize a quick client-ready report path, with templates and scheduling available after the first report is useful.
- Ahrefs and Ubersuggest keep exports and recurring reports available, but the first useful action is a simple update someone can read.
- A nontechnical user should not see formats, schedules, branding, and library tables all competing before understanding how to create the first update.

Implementation:

- [x] Rename the Reports page header to "Client updates".
- [x] Add soft header copy that frames reports as readable website progress updates.
- [x] Rename the report count badge from generated reports to ready updates.
- [x] Rename "Create a client report" to "Create a client update".
- [x] Move template and date choices into an optional "Choose format and dates" panel.
- [x] Move the update library directly after the create form so saved client updates are visible before optional setup.
- [x] Rename domain fields to website language.
- [x] Rename report templates to saved formats and keep the list collapsed.
- [x] Rename scheduled reports to scheduled updates and keep the list collapsed.
- [x] Soften report library wording to "Update library" with sharing and download language.
- [x] Replace advanced/delivery/export helper text with schedules, saved formats, and downloaded updates.

### Batch AM: Connections Setup Calmness

Competitive evidence:

- Semrush integration setup keeps the first decision around useful data sources and connected projects before users manage deeper settings.
- Ahrefs and Ubersuggest-style beginner flows work best when setup copy explains what the user will get, not the authentication or webhook plumbing underneath.
- A nontechnical user should see "connect Google, connect my website platform, send messages" before launch checks, automation URLs, or saved connection records.

Implementation:

- [x] Rename the Integrations page header to "Connections".
- [x] Soften the configured-count badge away from provider-record language.
- [x] Rewrite the manual integration panel as optional manual connection setup.
- [x] Replace Search Console and Analytics map/import wording with match/refresh wording.
- [x] Rewrite WordPress receiver and callback labels as connection keys, update links, setup steps, and connection tests.
- [x] Rewrite Shopify, Webflow, and Slack setup copy around website matching and messages.
- [x] Move Vercel, Netlify, Zapier/Make, and saved connection records into a closed "Advanced connection settings" panel.
- [x] Replace deployment/webhook/workflow language in the advanced panel with launch checks, message URLs, and saved connections.
- [x] Browser-check Connections desktop and mobile after deployment.

### Batch AN: Page Detail Calmness

Competitive evidence:

- Semrush URL and on-page views keep detailed SEO fields available, but the useful first question is which page fix to handle next.
- Ahrefs Page Explorer and Site Audit URL detail provide strong evidence, but a nontechnical user should not start with raw snapshot, canonical, robots, or workflow wording.
- Ubersuggest-style recommendations are closer to the target tone when they frame issues as practical page improvements.

Implementation:

- [x] Add a plain-language page care plan above page metrics.
- [x] Surface the first open page problem, search-result basics, and suggestion generation as the first three choices.
- [x] Rename page metrics from HTTP/open/critical/internal-link language to page response, open problems, urgent problems, and helpful links.
- [x] Rename "Latest SEO snapshot" to "What Google sees" with plain labels for title, description, heading, preferred page, search visibility, and page copy.
- [x] Rename "Issue history" to "Problems on this page" and replace severity/status labels with importance/progress.
- [x] Rename AI recommendations to page suggestions with softer helper copy.
- [x] Move page changes and internal link detail into a closed "More page detail" panel.
- [x] Browser-check Page Detail desktop and mobile after deployment.

### Batch AO: Page List Concision

Competitive evidence:

- Semrush's Crawled Pages report keeps page-by-page data, filtering, and individual URL drilldowns available, but it also encourages sorting and fixing the most important pages first.
- Ahrefs Page Explorer supports preset and advanced filters for deep technical analysis, so the depth should stay available without dominating the first view.
- A softer page inventory should show the most repeated page fixes first, then move the longer pattern list behind an optional panel.

Implementation:

- [x] Rename page inventory labels toward pages checked, page patterns, urgent pages, titles ready, page list, response, problems, and last check.
- [x] Limit visible repeated page fixes to the first eight groups.
- [x] Move the remaining page pattern groups into a closed "More page patterns" panel.
- [x] Limit visible page rows to the first fifteen pages.
- [x] Move the remaining page rows into a closed "More pages" panel.
- [x] Replace raw crawl/template wording with website-check and repeated-fix language.
- [x] Browser-check Page List desktop and mobile after deployment.

### Batch AP: Search Growth Calmness

Competitive evidence:

- Semrush search and position workflows keep visibility, movement, and the next opportunity visible before deeper keyword tables.
- Ahrefs-style Google Search Console and Page Explorer views preserve query/page depth with filters, but the first view is easier when it answers "what went up, what slipped, and where can we get more clicks?"
- Ubersuggest-style beginner reporting works best when search metrics use visits, times seen, and practical next steps instead of raw analytics labels.

Implementation:

- [x] Rename Search Performance to "Google search growth".
- [x] Rewrite header and workspace copy around searches, pages, clicks, and simple Google movement.
- [x] Rename metric labels to search visibility, visits from Google, times seen, and average spot.
- [x] Rename filter setup to "Narrow the view" and keep it optional.
- [x] Limit visible movement lists to the first five search terms.
- [x] Move extra rising/slipping search terms into closed optional panels.
- [x] Move top search-term and page tables into a closed "More search data" panel.
- [x] Limit each deeper table preview to the first eight rows.
- [x] Soften the route loading copy.
- [x] Browser-check Google Search Growth desktop and mobile after deployment.

### Batch AQ: Ideas And Fix Notes Calmness

Competitive evidence:

- Semrush On Page SEO Checker frames work as optimization ideas and explains why the ideas help, which is easier than asking a beginner to understand prompts or handoffs.
- Semrush Content Toolkit keeps content ideas, title suggestions, meta suggestions, and search intent analysis grouped around writing help.
- Ahrefs Site Audit preserves recommendations for how to fix issues, but a softer product should translate those into short notes and instructions before showing technical detail.

Implementation:

- [x] Rename Content Ideas to "Ideas and fixes".
- [x] Rewrite header and workspace copy away from crawled pages, AI prompts, templates, briefs, and handoffs.
- [x] Rename page copy ideas to page writing ideas.
- [x] Rename fix briefs to fix notes and use instruction language.
- [x] Rename repeated-page briefs to repeated-page notes.
- [x] Replace developer/CMS/client handoff wording with simple note and instruction wording.
- [x] Replace crawl/inventory wording with website-check and full-page-list wording.
- [x] Rename saved ideas and briefs to saved ideas and notes.
- [x] Rename the shared sidebar label and helper copy to Ideas and fixes.
- [x] Browser-check Ideas and Fixes desktop and mobile after deployment.

### Batch AR: Plan And Usage Calmness

Competitive evidence:

- Semrush keeps the first pricing action simple with a trial path and plain plan choice before deeper account management.
- Ahrefs pricing presents projects, users, crawl credits, reports, and included tools as plan-fit information rather than exposing billing mechanics first.
- A softer account page should answer "what do I have, how much room is left, and where do invoices live?" before subscription/provider terminology.

Implementation:

- [x] Rename Billing and plans to "Plan and usage".
- [x] Add short header copy that explains plan, usage room, and billing details.
- [x] Rename billing provider, subscription, and status labels into softer billing-help and plan-state language.
- [x] Rename current plan to "What you have now".
- [x] Rename usage to "Room left this month".
- [x] Rename usage meters to projects, pages checked, ideas and fixes, seats, and client updates.
- [x] Rename plan limits to pages checked, check rhythm, ideas and fixes, team seats, and reports.
- [x] Soften plan buttons from subscription wording to trial and choose-plan wording.
- [x] Mark a manually assigned workspace plan as current in the plan cards.
- [x] Rename the billing guidance card to "Account comfort plan".
- [x] Soften sidebar Billing copy and display label to "Plan".
- [x] Browser-check Plan and Usage desktop and mobile after deployment.

### Batch AS: Website Links Calmness

Competitive evidence:

- Semrush Site Audit keeps internal linking and crawl evidence available, but the useful first view is issue priority and what to fix next.
- Ahrefs Site Audit preserves page/link depth for analysis, while still grouping problems into understandable issue areas and reports.
- A softer link page should answer "which page needs a better path?" before exposing crawl, sitemap, orphan, or raw technical language.

Implementation:

- [x] Rename Internal links to "Website links".
- [x] Rewrite header and project note around better page paths and helpful link ideas.
- [x] Rename metric labels to pages checked, links pointing in, links going out, hard-to-find pages, and page list gaps.
- [x] Rename suggested-link details from anchor/priority to suggested words and importance.
- [x] Rename link issues to pages that need help.
- [x] Replace crawl, orphan, sitemap, and deep-page wording with website checks, pages needing links, page list gaps, and hard-to-find pages.
- [x] Rename "More link detail" to "More page link counts".
- [x] Translate stored technical issue titles into plain page-link wording on the Links page.
- [x] Soften sidebar Links helper copy away from crawlability/schema/rendering language.
- [x] Browser-check Website Links desktop and mobile after deployment.

### Batch AT: Client Care Calmness

Competitive evidence:

- Semrush project and client workflows keep each website/account organized around health, progress, and reportable next steps.
- Ahrefs project dashboards preserve site audit detail, but the useful first view is whether a project is connected, has issues, and is ready to report.
- A softer client area should say websites, checks, updates, and client notes before crawl cadence, raw audit detail, or technical status wording.

Implementation:

- [x] Rename client metrics from domains/pages/critical warnings to websites, pages checked, and urgent/planned work.
- [x] Rename client website helper text away from crawl status toward recent checks and fixes.
- [x] Rename per-website page and last-crawl labels to pages checked and last check.
- [x] Rename client settings helper text from crawl rhythm to check rhythm.
- [x] Rename new-client setup and default crawl cadence to check rhythm.
- [x] Soften check rhythm dropdown options to "Only when I start it", weekly, daily, and custom rhythm.
- [x] Add accessible labels to the client settings fields.
- [x] Replace raw audit detail wording with client update and extra technical detail wording.
- [x] Normalize odd separator characters in client detail metadata.
- [x] Browser-check Client Care desktop and mobile after deployment.

### Batch AU: Team Access Calmness

Competitive evidence:

- Semrush-style account areas keep permission detail available, but the first decision should still feel like choosing safe access for a teammate.
- Ahrefs and Ubersuggest-style workflows work better for nontechnical users when setup language explains what people can see or change, not the internal SEO operations behind it.
- A softer Settings page should say plan, team, clients, websites, checks, problems, updates, alerts, and connections before crawl, workflow, audit, or provider terminology.

Implementation:

- [x] Replace role descriptions that used production workflow, audit, and operator language with plain teammate/client access language.
- [x] Rename owner/admin/member/viewer permissions toward websites, checks, problems, updates, alerts, and connections.
- [x] Replace role-guide helper text with safer access-level wording.
- [x] Soften the shared Projects sidebar helper from scan wording to website-check wording.
- [x] Browser-check Team Access desktop and mobile after deployment.

### Batch AV: Fix Send Calmness

Competitive evidence:

- Semrush Site Audit Issues keeps severity and issue depth available, but the useful path is still to review a problem, follow the recommendation, and re-check progress.
- Ahrefs Site Audit preserves detailed issue evidence and exports, while keeping the first action tied to issue review and practical fixes.
- A softer Fix Center should say website checks, fix notes, connections, and check notes before crawl data, provider codes, handoff, export, or verification wording.

Implementation:

- [x] Rewrite the Fixes header and generate tooltip away from crawl/internal-link language.
- [x] Rename Fix list helpers from domains/internal-link/status language to websites, website-link fixes, and progress.
- [x] Rename issue, manual instruction, platform brief, export, handoff, and verification labels to problem, full fix instruction, fix note, download note, steps to send, and check note.
- [x] Format platform delivery modes as notes instead of handoffs in the Fix Center UI.
- [x] Hide raw connection provider codes behind friendly WordPress, Zapier, and Make labels.
- [x] Replace recrawl wording with running a new website check.
- [x] Normalize visible separator characters in Fix Center metadata.
- [x] Soften the shared active-project selector from domain/project-view language to website work language.
- [x] Browser-check Fix Send desktop and mobile after deployment.

### Batch AW: Client Update Detail Calmness

Competitive evidence:

- Semrush My Reports focuses on polished client-ready reports, PDF sharing, and scheduled delivery rather than forcing users to read raw audit terms first.
- Ahrefs reporting and dashboard flows keep issue and crawl depth available, but the useful client-facing story is status, progress, and next action.
- A softer report detail should say update, website check, next steps, and problem movement before audit data, crawl summary, recommendations, or issue movement.

Implementation:

- [x] Rename the report-detail back link from project/report wording to website workspace and client updates.
- [x] Replace pending audit-data wording with a fresh website-check prompt.
- [x] Rename priority recommendations to next steps and issue scope to current problem list.
- [x] Rename crawl summary to website check summary with pages checked and pages needing another look.
- [x] Rename issue movement labels to problem movement, new/fixed problems, urgent/planned open, and important changes.
- [x] Rename report format section options from crawl/recommendation/issue wording to website checks, next steps, and problem movement.
- [x] Browser-check Client Update Detail desktop and mobile after deployment.

### Batch AX: Problem Detail Calmness

Competitive evidence:

- Semrush Site Audit issue pages keep technical evidence available, but the useful path is still problem, why it matters, recommendation, and follow-up check.
- Ahrefs Site Audit preserves deep crawl and page evidence, while guiding users through issue groups, affected URLs, and practical fixes.
- A softer problem detail should say best next step, fix note, progress, page details, and website check before analyzer, workflow, handoff, AI guidance, or recrawl wording.

Implementation:

- [x] Rename issue-detail navigation, timeline, metadata, and action copy toward website workspace, problem found, last seen, website check, and problem area.
- [x] Rename solution and fix controls from recommended solution, handoff, and fix brief wording to best next step, fix note, and fix workspace.
- [x] Rename AI guidance and workflow sidebar sections to fix ideas, progress, assigned person, notes, and progress history.
- [x] Soften shared issue-solution helper labels from CMS/developer/recrawl/handoff language to website editor, site helper, fix note, and new website check.
- [x] Browser-check Problem Detail desktop and mobile after deployment.

### Batch AY: Problems List Calmness

Competitive evidence:

- Semrush Site Audit keeps grouped issue data available, but the list view works best when priority, impact, and a clear fix path are visible before deeper technical detail.
- Ahrefs Site Audit keeps affected URLs and recommendations available, while still helping users scan by problem importance and move into practical next steps.
- A softer Problems list should say next best fix, problem, website check, and open fix steps before analyzer-generated work, issue counts, solution jargon, or scan language.

Implementation:

- [x] Rename Problems list helper copy away from analyzer-generated work and toward website problems.
- [x] Rename top solution cards to next best fix cards and soften stored solution text before display.
- [x] Rename repeated-row action tooltip from resolving an issue to opening clear fix steps.
- [x] Replace visible issue/scan/crawl wording in list cards, empty states, and plan cards with problem and website-check language.
- [x] Browser-check Problems List desktop and mobile after deployment.

### Batch AZ: Dashboard First Impression Calmness

Competitive evidence:

- Semrush Site Audit Overview emphasizes site health, the most important problems, rerun/report actions, and deeper thematic widgets only after the user understands the current state.
- Semrush Site Audit Issues groups work by severity and trend, which supports a dashboard that says urgent/planned/idea before technical audit language.
- Ahrefs dashboard and Site Audit materials make Health Score and project-level metrics the first orientation point, with deeper issue detail still available after the overview.
- A softer home dashboard should say check website, urgent problems, planned work, website health, and client updates before scan, crawl, analyzer, technical SEO, or source-of-truth wording.

Implementation:

- [x] Rename dashboard primary actions from scan/project language to checking a website and adding a website.
- [x] Rename dashboard metrics and table helpers from critical issues, crawl status, analyzer, and technical SEO wording to urgent problems, recent checks, and website health.
- [x] Translate stored top-problem titles into plain-language dashboard labels.
- [x] Soften internal setup checklist names and descriptions away from crawler/analyzer/source-of-truth language.
- [x] Browser-check Dashboard desktop and mobile after deployment.

### Batch BA: Global Search Calmness

Competitive evidence:

- Semrush keeps global navigation and project search close to practical actions like opening a project, rerunning a check, or creating a report.
- Ahrefs navigation patterns make project, report, and site-audit entry points quick to reach without asking users to know the technical feature name first.
- A softer global search should say website, problem, update, and check website before domain, issue, command surface, URL, or run crawl wording.

Implementation:

- [x] Rename global search help text from domains/issues/reports to websites/problems/updates.
- [x] Rename default search actions from crawl/domain/Fix Center/technical feature names to check website, add website, open fixes, and simple growth labels.
- [x] Rename result categories from Domain, Issue, and Report to Website, Problem, and Update.
- [x] Translate stored problem titles in search results into plain-language labels.
- [x] Browser-check Global Search desktop and mobile after deployment.

### Batch BB: Website Detail Calmness

Competitive evidence:

- Semrush project and audit detail flows keep page and technical depth available, but the first screen still orients users around health, most important problems, and the next check.
- Ahrefs preserves crawl/page inventory detail for deeper review, while the easier beginner path is to summarize what was checked and what needs attention.
- A softer website detail page should say website check, pages to review, priority problems, and setup files before crawl, artifacts, status codes, or raw issue wording.

Implementation:

- [x] Rename the saved-website primary action from crawl language to "Check website".
- [x] Rewrite website detail helper text, metrics, plan cards, and error messages around website checks and problems.
- [x] Cap the visible page list to the first ten pages and link to the full Pages area for the rest.
- [x] Cap priority problems to the first five and link to the full Problems area for the rest.
- [x] Translate stored problem titles on the website detail page into plain-language labels.
- [x] Rename optional setup, lifecycle, install, and setup-file panels away from crawl/script/artifact wording.
- [x] Browser-check Website Detail desktop and mobile after deployment.

### Batch BC: Projects Page Wording Cleanup

Competitive evidence:

- Semrush project lists keep deeper audit controls available, but the top-level project list reads like a website portfolio with health and next actions.
- Ahrefs keeps page and crawl depth available behind project/site audit detail, while the first project screen can stay lighter with setup, health, and urgent-work labels.
- A softer Projects page should say websites, checks, urgent/planned work, and page access before crawled pages, crawlability, critical errors, or domain import wording.

Implementation:

- [x] Rename the Projects primary action from "Add project" to "Add website".
- [x] Replace visible crawl/crawled/scanning wording with website-check language.
- [x] Rename Critical/Errors/Warnings labels to urgent and planned work.
- [x] Rename deeper table labels from crawlability, internal SEO, and markup to Google access, page links, and Google details.
- [x] Rename bulk import copy from domains/projects/crawl cadence to websites and check rhythm.
- [x] Browser-check Projects desktop and mobile after deployment.

### Batch BD: Website Check Recap Calmness

Competitive evidence:

- Semrush Site Audit keeps crawl history and audit depth available, but each run summary first shows health, progress, important changes, and what to do next.
- Ahrefs Site Audit preserves page and crawl evidence for deeper review, while the first recap can still use plain change, page, and response labels.
- A softer recap page should say website check, page changes, setup files, and pages needing another look before crawl runs, robots/sitemap files, HTTP codes, snapshots, or raw metadata language.

Implementation:

- [x] Rename crawl-run headline, status, action, metrics, and recap cards to website-check language.
- [x] Rename setup-file panels away from robots/sitemap discovery and translate setup file types into access-helper and page-list labels.
- [x] Rename detected changes and page snapshots into page changes and more page detail.
- [x] Translate change severities, change types, and response codes into plain-language labels.
- [x] Browser-check Website Check Recap desktop and mobile after deployment.

### Batch BE: Website Workspace Wording Cleanup

Competitive evidence:

- Semrush project workspaces keep audit history and detail cards available, but the main path still uses project health, next action, and issue priority labels that are easy to scan.
- Ahrefs keeps technical evidence behind site-audit and page detail areas, while the project overview can stay focused on health, problems, and recent checks.
- A softer website workspace should say website checks, page coverage, priority problems, health areas, and recent checks before crawl coverage, technical audit, robots/sitemap, raw data, or issue/audit jargon.

Implementation:

- [x] Rename workspace summary labels from domain/crawl/rendering language to website, pages checked, browser check, and last check language.
- [x] Rename metric and health-card labels from crawl coverage, critical/warnings, errors, and audit details to page coverage, urgent/planned, and health details.
- [x] Rename thematic health cards from robots/sitemap/crawlability/internal linking/markup/canonicals/JS rendering to access file, page list, Google access, page links, Google details, preferred pages, and browser check.
- [x] Rename deeper workspace queue, page, recent-check, and error copy away from issues, crawl runs, crawler, and domain settings language.
- [x] Browser-check Website Workspace desktop and mobile after deployment.

### Batch BF: Website Link Health Detail Calmness

Competitive evidence:

- Semrush internal linking and site-audit drilldowns keep link evidence available, but the action path is still which page needs help and which link to add.
- Ahrefs and Screaming Frog expose deeper link tables, but beginner-friendly review works better when priority and page-list problems are translated before scores and raw issue text.
- A softer link-health detail page should say website, page links, page-list gaps, priority, and plain descriptions before domain, sitemap, raw issue descriptions, or numeric importance scores.

Implementation:

- [x] Rename remaining project/domain/table labels in the link-health detail route to website and page-list language.
- [x] Replace numeric importance scores with plain priority labels.
- [x] Translate common page-link problem descriptions into plain guidance.
- [x] Browser-check Website Link Health Detail desktop and mobile after deployment.

### Batch BG: Website Filter Wording Calmness

Competitive evidence:

- Semrush and Ahrefs keep project-level scoping available, but the visible filter flow should still read as choosing a website and search term, not an internal project/query object.
- Semrush keyword research keeps deeper keyword and competitor detail available behind compact views, while the first read stays focused on search ideas, opportunity, and next action.
- A softer shared filter and keyword research flow should say website, all websites, search term, and your website trails before project, raw query inventory, or data-model wording.

Implementation:

- [x] Rename shared project filters to website filters and all websites.
- [x] Rename shared query filters to search-term filters.
- [x] Rename active project banner language to active website and website workspace.
- [x] Rewrite keyword research advanced filter and deeper-detail copy away from project/raw-query language.
- [x] Browser-check Keyword Research desktop and mobile after deployment.

### Batch BH: Competitor Comparison Calmness

Competitive evidence:

- Semrush competitive views start with website-vs-competitor visibility and practical opportunities before exposing deeper tables.
- Ahrefs keeps deep comparison data available, but its Site Explorer and competitor views still orient users around competing websites, top pages, and organic keywords.
- A softer competitor page should say your website, competitor website, pages checked, problems, and search terms before project, domain table, crawls, or issue counts.

Implementation:

- [x] Rename competitor comparison filters from project/domain language to website language.
- [x] Rename competitor metrics and deeper table labels to pages checked, problems, websites, and search terms.
- [x] Rewrite empty-state and plan-card copy away from project/crawl/domain wording.
- [x] Rename focused workspace breadcrumb and navigation aria label from project tools to website tools.
- [x] Browser-check Competitor Insights desktop and mobile after deployment.

### Batch BI: Page Review Calmness

Competitive evidence:

- Semrush page and audit lists keep detailed checks available, but the beginner path starts with pages needing attention and plain problem counts.
- Ahrefs and Screaming Frog expose large URL inventories, while a softer product should summarize checked pages, repeated page patterns, and the next page to improve first.
- A softer Pages flow should say website, pages checked, page problems, and priority labels before project, crawl, audit fields, or numeric priority scores.

Implementation:

- [x] Rename Pages list filters, empty states, and loading copy away from project/crawl language.
- [x] Replace page-pattern numeric priority scores with plain priority labels.
- [x] Rename page-detail workspace and audit-field copy to website/decision language.
- [x] Browser-check Pages list and Page Detail desktop and mobile after deployment.

### Batch BJ: Search Performance Filter Calmness

Competitive evidence:

- Semrush and Ahrefs keep project-level search performance filters available, but the visible filter language should still feel like choosing a website and search term.
- Google Search Console-style tables preserve query-level detail, while a softer product can translate the first filter controls before exposing deeper rows.
- A softer Google search growth page should say website, all websites, and search term before project, query, or data-model wording.

Implementation:

- [x] Rename the Google search growth website filter from project language to website language.
- [x] Rename the all-projects filter option to all websites.
- [x] Rename the query filter label to search term.
- [x] Browser-check Google Search Growth filters desktop and mobile after deployment.

### Batch BK: Connections Setup Calmness

Competitive evidence:

- Semrush and Ahrefs keep integration setup details available, but setup screens work better when the first labels describe the user task rather than internal IDs.
- WordPress, Shopify, Vercel, and Netlify setup flows still need exact paste values, but those values can be framed as setup codes, message links, and launch checks.
- A softer Connections page should say websites, setup codes, tools, and saved connection details before domains, project IDs, site IDs, providers, or raw records.

Implementation:

- [x] Rename the manual connection website option from all domains to all websites.
- [x] Rename WordPress setup labels from domain and Site ID language to website and setup-code language.
- [x] Rename launch-check labels from project/site/provider/record wording to setup code, launch check, tool, and saved details.
- [x] Browser-check Connections desktop and mobile locally.
- [x] Browser-check Connections desktop and mobile after deployment.

### Batch BL: Client Care Calmness

Competitive evidence:

- Semrush and Ahrefs keep agency/client depth available, but client-facing account screens should start with websites, attention, and updates rather than project and issue jargon.
- Agency workflows are easier for nontechnical users when urgent work is framed as what needs attention today instead of severity and open-issue counts.
- A softer client area should say websites, fixes, attention, and behind-the-scenes detail before domains, projects, critical issues, technical detail, or raw severity labels.

Implementation:

- [x] Rename Clients list helper copy from projects and priority issues to websites and attention items.
- [x] Rename Clients list counts from domains and open issues to websites and needs-attention wording.
- [x] Rename Client detail priority issues and severity labels to needs-attention, urgent, planned, and fix wording.
- [x] Browser-check Clients list and Client Detail desktop and mobile locally.
- [x] Browser-check Clients list and Client Detail desktop and mobile after deployment.

### Batch BM: Report Detail Calmness

Competitive evidence:

- Semrush and Ahrefs keep report sections and audit evidence available, but shareable report detail should read like a client update before it reads like an issue ledger.
- Client-friendly reporting works better when the top metrics say website health, needs attention, fixed items, and fix movement instead of health score, open issues, severity, or problem movement.
- A softer report detail page should preserve change and check evidence while translating the first-read labels into plain update language.

Implementation:

- [x] Rename report detail metrics from health score and open issues to website health and needs attention.
- [x] Rename report movement labels from problem/issue language to item and fix language.
- [x] Translate change severity labels into urgent/planned wording.
- [x] Browser-check Report Detail desktop and mobile locally.
- [x] Browser-check Report Detail desktop and mobile after deployment.

### Batch BN: Shared Report Link Calmness

Competitive evidence:

- Semrush and Ahrefs keep shareable reporting useful by preserving progress, site-check, and issue evidence, but the client-facing read should start as an update, not an audit table.
- Public report links for nontechnical clients need even softer labels than internal tools because the reader may not know what health score, open issues, severity, or recommendations mean.
- A softer shared report should say website health, needs attention, next steps, website check summary, and fix movement before raw score, open issues, severity, or priority recommendations.

Implementation:

- [x] Rename shared report story and metric labels to website health, needs attention, and fixed-this-period wording, with natural singular/plural count text.
- [x] Translate shared report change severity labels into urgent/planned wording.
- [x] Add website check summary and fix movement sections to shared report links when those sections are enabled.
- [x] Browser-check Shared Report Link desktop and mobile locally.
- [x] Browser-check Shared Report Link desktop and mobile after deployment.

### Batch BO: Ideas And Fix Notes Calmness

Competitive evidence:

- Semrush and Ahrefs keep AI/content suggestions connected to audit evidence, but beginner-friendly idea generation should read like page ideas, fix notes, and shared notes rather than raw issue or priority metadata.
- Nontechnical users need the note queue to say website, urgent/planned, saved idea, and saved note before domain separators, severity labels, or P-score shorthand.
- A softer ideas-and-fixes page should preserve page, problem, and repeated-template depth while making each row feel like choosing the next helpful note to create.

Implementation:

- [x] Rename Ideas and fixes row metadata from domain/severity shorthand to website and urgent/planned wording.
- [x] Replace repeated-page P-score badges with plain priority labels.
- [x] Use natural singular/plural labels for saved ideas and notes.
- [x] Browser-check Ideas and fixes desktop and mobile locally.
- [x] Browser-check Ideas and fixes desktop and mobile after deployment.

### Batch BP: Add Website Setup Calmness

Competitive evidence:

- Semrush and Ahrefs both keep setup details available, but their onboarding value is clearer when users know which website is being added and what will happen next.
- Nontechnical setup should say website, ownership, and check rhythm before project, domain, crawl setup, or crawler permission language.
- A softer Add website flow should make the first saved step feel calm: add the website, choose the platform, choose how often the site should be checked, then confirm ownership.

Implementation:

- [x] Rename Add website first-viewport copy away from project and crawl setup wording.
- [x] Rename setup tiles and form labels from crawl rhythm to check rhythm.
- [x] Replace domain/crawl permission wording with website and check wording.
- [x] Browser-check Add website desktop and mobile locally.
- [ ] Browser-check Add website desktop and mobile after deployment.

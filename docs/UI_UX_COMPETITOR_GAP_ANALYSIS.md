# UI/UX Competitor Gap Analysis

Last updated: 2026-06-10

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
- [x] Surface setup gaps, quick-care clients, and report readiness as the first three choices.
- [x] Rename "Agency clients" to "Client list" and soften list helper text.
- [x] Collapse bulk client import behind an optional "Add many clients at once" panel.
- [x] Add an easy setup guide on the new-client screen.
- [x] Rename the new-client primary action to "Create client".
- [x] Add a plain-language client next-steps plan on client detail pages.
- [x] Rename "Client domains" to "Client websites".
- [x] Collapse client settings behind an optional detail panel.
- [x] Add friendlier empty states for no clients, no websites, no priority issues, and no reports.

### Batch EX: Client Quick-Care Wording

Competitive evidence:

- Semrush and Ahrefs keep agency work tied to projects, reports, and client-facing outcomes, but their expert-first labels can make account care feel stressful.
- A beginner-friendly client area should keep priority visible while describing it as quick-care work.
- The product direction is to help a nontechnical user choose the right client without feeling like every account is in crisis.

Implementation:

- [x] Centralize client quick-care labels, plan copy, and empty states in the product copy helper.
- [x] Replace urgent client language on the client list and client detail pages.
- [x] Reuse the shared quick-care severity label for client problem rows.
- [x] Cover client quick-care wording with unit tests.
- [x] Browser-check client quick-care wording locally.
- [x] Browser-check client quick-care wording after deployment.

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
- [x] Browser-check Add website desktop and mobile after deployment.

### Batch BQ: Ownership Check Calmness

Competitive evidence:

- Semrush and Ahrefs keep ownership and project setup checks necessary, but their first-read setup flows work best when users understand the next permission step without learning crawler terminology.
- Nontechnical users should see website ownership, setup value, and website check language before domain, verification token, production crawl, or settings-inspection language.
- A softer ownership page should keep exact DNS/file/meta values copyable while translating status, errors, and success messages into calm next-step wording.

Implementation:

- [x] Rename ownership-page first-read copy away from project/domain/crawl wording.
- [x] Rename setup/status messages from verification token and production crawl wording to setup value and website check wording.
- [x] Keep technical setup values visible while softening history, error, and status labels.
- [x] Browser-check Ownership desktop and mobile locally.
- [x] Browser-check Ownership desktop and mobile after deployment.

### Batch BR: Billing Plan Language Calmness

Competitive evidence:

- Semrush and Ahrefs price plans around projects, crawl credits, reports, users, and limits, but beginner-friendly billing should translate those limits into what the user can actually do.
- Nontechnical users should compare websites, pages checked, check rhythm, ideas and fixes, teammates, and updates before domain limits, crawl frequency, or plan mechanics.
- A softer billing page should preserve exact limits while making plan comparison feel like checking room for work, not reading internal quota names.

Implementation:

- [x] Rename Billing usage and plan limits from projects/domains to websites.
- [x] Translate raw check rhythm values into every-day/every-week/manual wording.
- [x] Rewrite plan comfort copy from sites to websites for consistency.
- [x] Browser-check Billing desktop and mobile locally.
- [x] Browser-check Billing desktop and mobile after deployment.

### Batch BS: Alert Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep alerts and monitoring tied to change detection, but user-facing setup works best when alert choices describe what the user should watch.
- Nontechnical users should choose urgent/planned/idea importance, watched website changes, and message health before seeing raw severity, status, or event-code language.
- A softer Alerts page should preserve exact alert rules while translating rule options and delivery status into calm, plain-language labels.

Implementation:

- [x] Rename Alerts watched-change options from raw event names to plain website-change labels.
- [x] Translate alert importance labels from critical/warning/suggestion to urgent/planned/idea.
- [x] Translate message delivery status from pending/failed wording to waiting/needs-review wording.
- [x] Browser-check Alerts label desktop and mobile locally.
- [x] Browser-check Alerts label desktop and mobile after deployment.

### Batch BT: Client Status Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep account/client depth available, but a nontechnical client workflow should describe website setup, ownership, checks, and report readiness in everyday language.
- Agency users should see whether a client website is ready, being checked, or needs attention before reading raw platform, verification, crawl, or report status labels.
- A softer client area should preserve exact status detail while translating it into what the user can do next.

Implementation:

- [x] Translate client website platform labels into WordPress site, Shopify store, and similar website wording.
- [x] Translate ownership and latest-check statuses into ownership-confirmed and finished/waiting/checking wording.
- [x] Translate client report status into ready-to-share/shared/needs-review wording.
- [x] Browser-check Client list and Client detail desktop and mobile locally.
- [x] Browser-check Client list and Client detail desktop and mobile after deployment.

### Batch BU: Page Suggestion Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep page-level issue and recommendation detail available, but the easier path is to describe page suggestions as title ideas, description ideas, and fix notes.
- Nontechnical users should see urgent/planned/idea importance and friendly progress labels before raw suggestion, recommendation-type, or issue-status wording.
- A softer page detail view should preserve page evidence while making the next suggestion feel like a useful writing or fix idea.

Implementation:

- [x] Rename Page Detail suggestion importance from suggestion to idea.
- [x] Translate page suggestion card types into title idea, description idea, page idea, and fix note wording.
- [x] Add friendlier page problem progress labels for set-aside and needs-another-look states.
- [x] Browser-check Page Detail suggestion labels desktop and mobile locally.
- [x] Browser-check Page Detail suggestion labels after deployment.

### Batch BV: Client Update Status Calmness

Competitive evidence:

- Semrush and Ahrefs reporting flows keep report creation, sharing, schedules, and branded links visible, but nontechnical users need to know whether an update is ready to share.
- A softer report page should say draft, ready to share, shared, waiting for DNS, and every week/month before generated, published, pending, verified, or enum-style cadence wording.
- Client reporting should feel like preparing a helpful update, not managing technical report records.

Implementation:

- [x] Translate report library statuses into draft, ready-to-share, shared, and needs-review wording.
- [x] Translate branded report link statuses into waiting-for-DNS, active, and needs-DNS-help wording.
- [x] Translate scheduled update frequency into every-week/every-month wording.
- [x] Browser-check Client updates status labels desktop and mobile locally.
- [x] Browser-check Client updates status labels after deployment.

### Batch BW: Report Detail Status Calmness

Competitive evidence:

- Semrush and Ahrefs client reports keep the reporting story easy to scan, with status and check progress acting as support rather than technical labels.
- Nontechnical readers should see shared, ready-to-share, finished, checking-now, and needs-review wording before published, generated, completed, running, or failed status names.
- Shared reports need the softest language because the reader may never use the internal SEO workspace.

Implementation:

- [x] Translate private report detail status labels into draft, ready-to-share, shared, and needs-review wording.
- [x] Translate private and shared website-check statuses into finished, checking-now, waiting-to-start, stopped, and needs-review wording.
- [x] Rename the public report header from published report to shared SEO update.
- [x] Browser-check private and shared report detail status labels desktop and mobile locally.
- [x] Browser-check private and shared report detail status labels after deployment.

### Batch BX: Problem Progress Label Calmness

Competitive evidence:

- Semrush and Ahrefs issue queues keep severity, status, and recommendation detail available, but the first-read labels still need to say what the user should do next.
- Nontechnical users should see urgent, planned, idea, being fixed, set aside, needs another look, and client-friendly wording before critical, warning, suggestion, in-progress, ignored, reappeared, or client-visible status names.
- The Problems flow should feel like a guided fix list, not a technical status console.

Implementation:

- [x] Translate Problems filter, row, and bulk-update urgency/progress labels into plain-language wording.
- [x] Replace template priority shorthand with a readable priority label.
- [x] Translate Problem detail badges, progress options, note visibility, and fix idea types into softer wording.
- [x] Browser-check Problems list and Problem detail status labels desktop and mobile locally.
- [x] Browser-check Problems list and Problem detail status labels after deployment.

### Batch BY: Website Detail Setup Label Calmness

Competitive evidence:

- Semrush and Ahrefs project detail screens keep crawl, verification, and setup file detail available, but beginner users need a plain-language website state first.
- Nontechnical users should see websites, website workspace, WordPress site, every week/day, ownership confirmed, tag connected, robots file, page list, and finished/checking wording before project, platform enum, crawl frequency, verification status, script status, or artifact type labels.
- The Website detail page should feel like a calm setup-and-check path, not a technical project record.

Implementation:

- [x] Rename Website detail navigation from project wording toward website wording.
- [x] Translate website platform, check rhythm, ownership, website tag, setup file, and latest-check statuses into softer labels.
- [x] Browser-check Website detail setup/status labels desktop and mobile locally.
- [x] Browser-check Website detail setup/status labels after deployment.

### Batch BZ: Add Website Setup Label Calmness

Competitive evidence:

- Semrush and Ahrefs onboarding flows ask for project, platform, and crawl settings, but a beginner-friendly first setup should use website and rhythm language before product mechanics.
- Nontechnical users should see WordPress site, Shopify store, I am not sure yet, every week, every day, and only when I start it before raw platform or crawl-frequency wording.
- The Add Website page should feel like a gentle first step, not a technical configuration form.

Implementation:

- [x] Translate Add Website platform options into website-type labels.
- [x] Translate Add Website check rhythm options and helper copy into every-week/every-day/manual-start wording.
- [x] Browser-check Add Website setup labels desktop and mobile locally.
- [x] Browser-check Add Website setup labels after deployment.

### Batch CA: Ownership Verification Label Calmness

Competitive evidence:

- Semrush and Ahrefs verification flows expose technical setup options, but a softer product should describe ownership steps by what the user can recognize and do.
- Nontechnical users should see DNS record, website file, homepage tag, Google Search Console, ownership confirmed, waiting for setup, and needs another try before raw verification method or status wording.
- The ownership page should feel like a guided confirmation path, not a DNS/status troubleshooting console.

Implementation:

- [x] Translate ownership method labels into calmer website-access wording.
- [x] Translate ownership status badges and check history into plain-language status labels.
- [x] Soften setup field labels for file, homepage tag, and Search Console instructions.
- [x] Prevent hidden help tooltips from widening mobile pages before hover or focus.
- [x] Browser-check Ownership Verification labels desktop and mobile locally.
- [x] Browser-check Ownership Verification labels after deployment.

### Batch CB: Website List Label Calmness

Competitive evidence:

- Semrush and Ahrefs project lists keep platform, setup, and report state visible, but a beginner-friendly list should explain the website state before product or database wording.
- Nontechnical users should see WordPress site, Shopify store, ownership confirmed, needs setup, ready to share, shared, and create update before raw platform, verification, or report statuses.
- The Websites list should feel like a calm care list, not a project inventory table.

Implementation:

- [x] Translate Websites table platform labels into website-type wording.
- [x] Translate ownership labels into ownership-confirmed and needs-setup wording.
- [x] Translate report labels into update/share wording.
- [x] Browser-check Websites list labels desktop and mobile locally.
- [x] Browser-check Websites list labels after deployment.

### Batch CC: Rank Keyword Status Calmness

Competitive evidence:

- Semrush and Ahrefs rank tracking tables show keyword state and movement, but a softer workflow should frame status as what the user is doing with the keyword.
- Nontechnical users should see watching, paused for now, and set aside before active, paused, archived, or database-style tracking states.
- The Rank movement page should feel like a gentle watchlist for keyword progress, not a raw tracking inventory.

Implementation:

- [x] Translate keyword tracking statuses into watching, paused-for-now, and set-aside wording.
- [x] Browser-check Rank keyword status labels desktop and mobile locally.
- [x] Browser-check Rank keyword status labels after deployment.

### Batch CD: Website Check Recap Label Calmness

Competitive evidence:

- Semrush and Ahrefs crawl/run details expose status, trigger, and crawl artifacts, but a nontechnical recap should say what happened and how the check started.
- Nontechnical users should see finished, checking now, waiting to start, stopped, needs another try, scheduled check, I started it, and automatic check before completed, running, queued, cancelled, failed, scheduled, manual, or system.
- The Website check recap should feel like a plain-language after-action note, not a crawl-run record.

Implementation:

- [x] Translate Website check recap status labels into finished/checking/waiting/stopped/needs-another-try wording.
- [x] Translate check trigger labels into scheduled, manual, and automatic check wording.
- [x] Browser-check Website check recap labels desktop and mobile locally.
- [x] Browser-check Website check recap labels after deployment.

### Batch CE: Website Workspace Status Calmness

Competitive evidence:

- Semrush and Ahrefs website/project dashboards keep platform, crawl, report, and change state close together, but a beginner-friendly workspace should say what each state means for the site owner.
- Nontechnical users should see WordPress site, Shopify store, ownership confirmed, monitoring connected, ready to share, page title changed, and checking now before raw platform, verification, script, report, event, or crawl-run statuses.
- The Website workspace should feel like a guided project room, not a compact system dashboard.

Implementation:

- [x] Translate Website workspace platform, ownership, monitoring, check, report, and change-event labels into plain-language wording.
- [x] Browser-check Website workspace status labels desktop and mobile locally.
- [x] Browser-check Website workspace status labels after deployment.

### Batch CF: Connections Label Calmness

Competitive evidence:

- Semrush documents connecting Google Analytics and Google Search Console so site data can be analyzed from one central interface, and Ahrefs documents Google Search Console performance inside its dashboard/rank-tracking flows.
- Semrush and Ahrefs make integrations a data-readiness step, but a beginner-friendly setup page should explain whether each connection is connected, needs sign-in, not connected yet, or needs another try before exposing provider/status enums.
- Nontechnical users should see Google Analytics, Search Console site, WordPress fix connection, monitoring connected, connection works, and ready/done wording before raw provider, status, permission, script, test, or setup-step values.

Implementation:

- [x] Translate Connections provider, setup status, Google permission, WordPress script/test/step, and launch-check labels into plain-language wording.
- [x] Browser-check Connections labels desktop and mobile locally.
- [x] Browser-check Connections labels after deployment.

### Batch CG: Fix Confirmation Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep audit issue progress and recheck/fixed states visible, but beginner users need a plain confirmation path after a fix is sent.
- Nontechnical users should see waiting to check, fix worked, still needs help, not checked yet, and waiting for turn before pending, verified fixed, still failing, not checked, or generic waiting states.
- The Fix Center should feel like a calm fix-confirmation checklist, not a technical verification ledger.

Implementation:

- [x] Translate Fix Center verification labels and lifecycle waiting wording into plain-language confirmation states.
- [x] Browser-check Fix Center confirmation labels desktop and mobile locally.
- [x] Browser-check Fix Center confirmation labels after deployment.

### Batch CH: Keyword Intent Label Calmness

Competitive evidence:

- Semrush and Ahrefs both expose keyword intent and rank/position metrics, but a beginner-friendly keyword workspace should translate intent into the reason someone is searching.
- Nontechnical users should see learning search, buying research, ready to buy, brand/site lookup, and not ranking yet before informational, commercial, transactional, navigational, or pending metric labels.
- The Search ideas page should feel like choosing the next useful topic, not decoding keyword-research terminology.

Implementation:

- [x] Translate Search ideas intent groups and opportunity intent labels into plain-language search reasons.
- [x] Replace missing keyword position labels with not-ranking-yet wording.
- [x] Browser-check Search ideas page desktop and mobile locally; local database has no Search Console rows, so exact label rules are covered by unit tests.
- [x] Browser-check Search ideas intent and position labels after deployment.

### Batch CI: Search Position Label Calmness

Competitive evidence:

- Semrush and Ahrefs both keep search position, visibility, and movement metrics visible for deeper analysis, but a beginner-friendly search page should explain missing or new metrics before showing tool jargon.
- Nontechnical users should see not ranking yet and new this period before pending, zero-position, or terse new movement labels.
- The Google search growth page should feel like a plain-language progress view, not a raw Search Console table.

Implementation:

- [x] Translate Search Performance average spot, movement rows, and deeper tables away from pending/new wording.
- [x] Cover the exact search position and movement labels with unit tests.
- [x] Browser-check Search Performance position labels desktop and mobile locally.
- [x] Browser-check Search Performance position labels after deployment.

### Batch CJ: Competitor Metric Label Calmness

Competitive evidence:

- Semrush and Ahrefs competitor comparison views keep rank, visibility, and health-style metrics available, but a beginner-friendly competitor page should make missing data feel like a normal setup state.
- Nontechnical users should see not ranking yet, waiting for rankings, no score yet, no client yet, and average spot before pending, unassigned, or raw average-position wording.
- The Competitor insights page should feel like a gentle comparison guide, not a data warehouse table.

Implementation:

- [x] Translate competitor rank, website health, and owner fallback labels into plain-language wording.
- [x] Cover the exact competitor comparison labels with unit tests.
- [x] Browser-check Competitor insights metric labels desktop and mobile locally.
- [x] Browser-check Competitor insights metric labels after deployment.

### Batch CK: Rank Metric Label Calmness

Competitive evidence:

- Semrush and Ahrefs rank tracking views keep position, volume, difficulty, and top-10 distribution visible, but a beginner-friendly tracker should explain missing rank inputs without making the user feel behind.
- Nontechnical users should see not ranking yet, no volume yet, no difficulty yet, no client yet, average spot, and waiting for ranks before pending, unknown, unassigned, or average-position wording.
- The Rank movement page should feel like a calm keyword watchlist, not a raw keyword database.

Implementation:

- [x] Translate Rank Tracking rank, volume, difficulty, client, average, and distribution labels into plain-language wording.
- [x] Cover the exact rank-tracking fallback labels with unit tests.
- [x] Browser-check Rank Tracking metric labels desktop and mobile locally.
- [x] Browser-check Rank Tracking metric labels after deployment.

### Batch CL: Page Snapshot Label Calmness

Competitive evidence:

- Semrush and Ahrefs both keep crawl response, page copy, and metadata checks available, but a beginner-friendly page inventory should describe unchecked data as a normal next step.
- Nontechnical users should see not checked yet, no client yet, not found yet, and not counted yet before pending, unknown, unassigned, or missing field wording.
- The Pages list and page detail view should feel like a calm page-care guide, not a raw crawl export.

Implementation:

- [x] Translate Pages list and page-detail response, owner, metadata, copy-count, and last-check labels into plain-language wording.
- [x] Cover the exact page snapshot fallback labels with unit tests.
- [x] Browser-check page snapshot labels desktop and mobile locally.
- [x] Browser-check page snapshot labels after deployment.

### Batch CM: Website Health Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep website health, crawl response, setup files, and owner context visible, but a beginner-friendly website workspace should frame missing health data as a normal next check.
- Nontechnical users should see no score yet, no client yet, not checked yet, and response labels with plain status before pending, unassigned, or raw crawl wording.
- The Websites list, website detail, and website workspace should feel like a guided website-health view, not a technical site-audit export.

Implementation:

- [x] Translate website health, owner, setup-file response, page response, and percentage fallbacks into plain-language wording.
- [x] Cover the exact website health fallback labels with unit tests.
- [x] Browser-check website health labels desktop and mobile locally.
- [x] Browser-check website health labels after deployment.

### Batch CN: Overview Context Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep project context, owners, and site health visible across dashboards, but a beginner-friendly overview should avoid unassigned or pending labels in the main path.
- Nontechnical users should see no client yet, no owner yet, and no score yet before unassigned or pending labels in shared website context and overview tables.
- The Overview and shared website workspace bar should feel like a calm project guide, not a staffing or database status report.

Implementation:

- [x] Translate shared active-website context, overview client, overview owner, and overview score labels into plain-language fallback wording.
- [x] Cover the exact overview owner fallback label with unit tests.
- [x] Browser-check overview context labels desktop and mobile locally.
- [x] Browser-check overview context labels after deployment.

### Batch CO: Problem Detail Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep issue ownership, affected page metadata, and note history available, but beginner users need those details to feel like helpful context rather than missing database fields.
- Nontechnical users should see no client yet, no owner yet, not found yet, and no author yet before unassigned, missing, or unknown labels in the Problems flow.
- The Problems list and problem detail page should feel like a guided fix workspace, not an audit row with raw assignment and crawl placeholders.

Implementation:

- [x] Translate Problems list/detail client, owner, note-author, and latest-page metadata fallbacks into plain-language wording.
- [x] Cover the exact problem note-author fallback label with unit tests.
- [x] Browser-check problem detail labels desktop and mobile locally.
- [x] Browser-check problem detail labels after deployment.

### Batch CP: Website Check Recap Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep crawl history, changed fields, response status, and page-level metadata visible, but beginner users need recap wording that explains what happened without raw crawl placeholders.
- Nontechnical users should see no client yet, not checked yet, not found yet, and not counted yet before unassigned, pending, missing, or zero-word fallback labels in the website-check recap.
- The crawl recap should feel like a calm after-check summary with optional detail, not a technical crawler log.

Implementation:

- [x] Translate website-check recap client, response, change-value, metadata, and word-count fallbacks into plain-language wording.
- [x] Cover the exact crawl recap response and change-value fallback labels with unit tests.
- [x] Browser-check website-check recap labels desktop and mobile locally.
- [x] Browser-check website-check recap labels after deployment.

### Batch CQ: Client Health Label Calmness

Competitive evidence:

- Semrush and Ahrefs make project and client-level health summaries scannable, but a beginner-friendly client workspace should avoid status words that sound like something is stuck.
- Nontechnical users should see no score yet before pending in client health summaries when a website has not produced a score.
- The Clients list and client detail page should feel like a calm account-care view, not an unresolved status board.

Implementation:

- [x] Translate Clients list, client detail summary, and client website health fallbacks into no-score-yet wording.
- [x] Cover the exact health fallback label through the shared website health label unit tests.
- [x] Browser-check client health labels desktop and mobile locally.
- [x] Browser-check client health labels after deployment.

### Batch CR: Report Health Label Calmness

Competitive evidence:

- Semrush and Ahrefs make reporting exportable and client-readable, but a beginner-friendly report should never make missing health data sound like a broken job.
- Nontechnical users and clients should see no score yet and a fresh-score takeaway before pending in report metrics and shared report summaries.
- The report detail and public share page should feel like a polished client update, not a technical audit dump.

Implementation:

- [x] Translate report detail and shared report health score fallbacks into no-score-yet and fresh-score wording.
- [x] Cover the exact health fallback label through the shared website health label unit tests.
- [x] Browser-check report health labels desktop and mobile locally.
- [x] Browser-check report health labels after deployment.

### Batch CS: Report Export Label Calmness

Competitive evidence:

- Semrush and Ahrefs make PDF/export reports and branded sharing part of the reporting workflow, but a beginner-friendly report should keep the same calm setup language after export.
- Nontechnical users and clients should see no score yet and not verified yet before pending in PDF report text and branded report-domain setup.
- The report hub and exported report should feel like one polished client-update flow, not two different status systems.

Implementation:

- [x] Translate PDF health score and branded-domain verification fallbacks away from pending wording.
- [x] Cover the exact PDF health fallback label with report unit tests.
- [x] Browser-check report export labels desktop and mobile locally.
- [ ] Browser-check report export labels after deployment.

### Batch CT: Alert Delivery Label Calmness

Competitive evidence:

- Semrush and Ahrefs make alerts and notifications useful by showing whether important changes reached the team, but a beginner-friendly alert center should explain what to do next before exposing delivery states.
- Nontechnical users should see waiting to send, needs a check, and sent before pending, failed, or raw delivery wording.
- The Alerts page should feel like a calm watch list for important changes, not a message-queue operations screen.

Implementation:

- [x] Translate alert delivery status and sent-at fallbacks into plain-language wording.
- [x] Cover the exact alert delivery labels with unit tests.
- [x] Browser-check alert delivery labels desktop and mobile locally.
- [x] Browser-check alert delivery labels after deployment.

### Batch CU: Website Ownership Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep project and client context close to website/search results, but a beginner-friendly workflow should treat missing ownership as a normal setup state.
- Nontechnical users should see no client yet before unassigned in the Add Website form and global search result descriptions.
- Adding or finding a website should feel like a gentle setup path, not a database assignment task.

Implementation:

- [x] Translate Add Website and global search ownership fallbacks away from unassigned wording.
- [x] Reuse the shared website-client label unit coverage for the exact no-client-yet text.
- [x] Browser-check website ownership labels desktop and mobile locally.
- [x] Browser-check website ownership labels after deployment.

### Batch CV: Verification Ownership Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep project ownership context visible during setup and verification, but a beginner-friendly confirmation step should treat missing client context as normal setup.
- Nontechnical users should see no client yet before unassigned on ownership confirmation pages.
- Verifying a website should feel like a guided safety step, not a database assignment task.

Implementation:

- [x] Translate ownership confirmation client fallback away from unassigned wording.
- [x] Reuse the shared website-client label unit coverage for the exact no-client-yet text.
- [x] Browser-check verification ownership label desktop and mobile locally.
- [x] Browser-check verification ownership label after deployment.

### Batch CW: Recommendation Ownership Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep project context attached to content and fix recommendations, but a beginner-friendly ideas page should not describe a missing client as unassigned work.
- Nontechnical users should see no client yet before unassigned when browsing page ideas and repeated-page notes.
- The AI ideas area should feel like a simple writing and fix-note helper, not an ownership-management table.

Implementation:

- [x] Translate page-idea and repeated-page recommendation ownership fallbacks away from unassigned wording.
- [x] Reuse the shared website-client label unit coverage for the exact no-client-yet text.
- [x] Browser-check recommendation ownership labels desktop and mobile locally.
- [ ] Browser-check recommendation ownership labels after deployment.

### Batch CX: Technical Audit Ownership Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep project context attached to technical problem lists and internal-link ideas, but a beginner-friendly audit should treat missing client context as a normal setup detail.
- Nontechnical users should see no client yet before unassigned when reviewing pages that need link help or page-by-page link counts.
- The technical audit should feel like a gentle website-links checklist, not an assignment-management report.

Implementation:

- [x] Translate technical-audit issue, page, and link-opportunity ownership fallbacks away from unassigned wording.
- [x] Reuse the shared website-client label unit coverage for the exact no-client-yet text.
- [x] Browser-check technical-audit ownership labels desktop and mobile locally.
- [x] Browser-check technical-audit ownership labels after deployment.

### Batch CY: Keyword Gap Volume Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep search-volume context beside competitor gaps, but a beginner-friendly keyword page should explain missing volume as a data state rather than an unknown value.
- Nontechnical users should see no volume yet before unknown volume when a competitor content gap has not imported search-volume data.
- The keyword research page should feel like a writing-opportunity guide, not a data-quality mystery.

Implementation:

- [x] Translate competitor content-gap missing volume away from unknown wording.
- [x] Reuse the shared rank-volume label unit coverage for the exact no-volume-yet text.
- [x] Browser-check keyword gap volume labels desktop and mobile locally.
- [ ] Browser-check keyword gap volume labels after deployment.

### Batch CZ: Settings Invite Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep team access and account controls close to workspace settings, but a beginner-friendly settings page should describe invitations as people waiting to join, not pending records.
- Nontechnical users should see invites waiting and waiting to join before pending invitations or pending counts.
- Settings should feel like a calm access checklist, not an admin status table.

Implementation:

- [x] Translate settings invitation headings, seat summary, plan tile, and cancel action away from pending/revoke wording.
- [x] Cover the exact invite-waiting labels with unit tests.
- [x] Browser-check settings invite labels desktop and mobile locally.
- [x] Browser-check settings invite labels after deployment.

### Batch DA: Export Ownership Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep exports and handoff files useful for sharing, but a beginner-friendly product should keep the same calm setup language outside the browser.
- Nontechnical users should see no client yet and no owner yet before unassigned in downloaded CSVs or fix notes.
- Exports should feel like polished client-ready helpers, not database extracts.

Implementation:

- [x] Translate pages CSV, problems CSV, and fix-note ownership fallbacks away from unassigned wording.
- [x] Cover the exact exported ownership labels with unit tests.
- [x] Verify export ownership labels through local API/download checks.
- [ ] Browser-check export ownership labels after deployment.

### Batch DB: Export Importance Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep severity available in reports and exports, but a beginner-friendly product should preserve the same action language when work leaves the app.
- Nontechnical users should see urgent, planned, and idea before raw critical, warning, suggestion, or severity labels in CSVs and fix notes.
- Downloaded problem files should feel like a helpful priority list, not an analyzer dump.

Implementation:

- [x] Translate problem CSV and fix-note severity wording into plain importance labels.
- [x] Cover the exact exported importance labels with unit tests.
- [x] Verify export importance labels through local API/download checks.
- [x] Browser-check export importance labels after deployment.

### Batch DC: Export Work List Label Calmness

Competitive evidence:

- Semrush and Ahrefs preserve issue type, priority, and status in exports, but a beginner-friendly product should translate those fields into the same plain work-list language used in the app.
- Nontechnical users should see problem area, start-here/do-next priority, and ready-to-review progress before issueType, priorityScore, OPEN, IN_PROGRESS, or REAPPEARED values.
- Downloaded problem files should feel like a gentle task list a client or website helper can read without decoding database fields.

Implementation:

- [x] Translate problem CSV issue type, priority score, and status columns into plain work-list labels.
- [x] Reuse the problem-area label in fix-note handoffs.
- [x] Cover the exact exported work-list labels with unit tests.
- [x] Verify export work-list labels through local API/download checks.
- [x] Browser-check export work-list labels after deployment.

### Batch DD: Export Page Check Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep crawled-page exports useful with response and last-check detail, but a beginner-friendly product should describe those fields as website response and last checked.
- Nontechnical users should see good, redirects, needs review, and not checked yet before httpStatus, statusCode, blank cells, or ISO crawl timestamps.
- Downloaded page files should feel like a page-care list, not a raw crawl inventory.

Implementation:

- [x] Translate pages CSV response and last-check fields into plain page-care labels.
- [x] Reuse the same page response and check-date labels used in the app.
- [x] Cover the exact exported page-check labels with unit tests.
- [x] Verify export page-check labels through local API/download checks.
- [x] Browser-check export page-check labels after deployment.

### Batch DE: Report PDF Story Label Calmness

Competitive evidence:

- Semrush and Ahrefs reports keep issue movement, crawl summaries, and change history available, but a beginner-friendly client update should label them as website progress and next steps.
- Nontechnical readers should see website or client, pages checked, problems ready to review, website changes found, and best next steps before client/domain, pages monitored, open issues, change summary, priority recommendations, or empty placeholders.
- Downloaded and shared report text should feel like a polished update, not a raw audit export.

Implementation:

- [x] Translate generated report text away from issue/crawl/domain labels toward website-progress wording.
- [x] Reuse the same gentle not-found change placeholder used in crawl recap views.
- [x] Cover the exact generated report PDF text with unit tests.
- [x] Verify generated report text through local report rendering checks.
- [x] Browser-check report PDF story labels after deployment.

### Batch DF: Download Filename Calmness

Competitive evidence:

- Semrush and Ahrefs make downloads feel like reusable handoff files, but a beginner-friendly product should avoid exposing raw issue/export naming even in file names.
- Nontechnical users should receive website-problems-to-review, website-page-care-list, link-repair-note, and internal-link-note before issues-export, pages-export, broken-link-fix, or internal-link-fix.
- Downloaded artifacts should feel like calm website care notes a client or helper can open without decoding product internals.

Implementation:

- [x] Rename problem and page CSV attachment filenames to plain website-care wording.
- [x] Rename link-fix markdown handoff filenames to note-based language.
- [x] Cover exported filename constants and link-fix note filenames with unit tests.
- [x] Verify CSV attachment filenames through local authenticated HTTP checks.
- [x] Browser-check download filenames after deployment.

### Batch DG: Export Column Label Calmness

Competitive evidence:

- Semrush and Ahrefs exports preserve detailed audit data, but a beginner-friendly handoff should keep spreadsheet headers in the same plain language as the app.
- Nontechnical users should see website and problems before raw domain or issues columns when opening downloaded CSV files.
- Spreadsheet exports should feel like website care checklists, not database-shaped audit dumps.

Implementation:

- [x] Move problem and page CSV row mapping into tested export-row helpers.
- [x] Rename downloaded problem CSV website column away from domain.
- [x] Rename downloaded page CSV website and problems columns away from domain and issues.
- [x] Verify exact CSV headers through unit tests and local authenticated HTTP checks.
- [x] Browser-check export column labels after deployment.

### Batch DH: Product Name Calmness

Competitive evidence:

- Semrush and Ahrefs use expert SEO positioning, but a beginner-first product should make the first screen feel like care and guidance before operations.
- Nontechnical users should see Website Care before SEO Ops on login, signup, the app shell, and browser metadata.
- The product frame should still preserve search-health depth while feeling softer, more welcoming, and easier to trust.

Implementation:

- [x] Centralize product display copy in a tested helper.
- [x] Rename visible app framing from SEO Ops to Website Care across the sidebar and auth screens.
- [x] Update metadata and product source-of-truth docs to the softer name.
- [x] Cover the product copy contract with unit tests.
- [x] Browser-check product name calmness after deployment.

### Batch DI: Plan Copy Calmness

Competitive evidence:

- Semrush and Ahrefs pricing language assumes buyers already understand SEO monitoring, but a beginner-first product should explain plans as website care and safe checks.
- Nontechnical users should see gentle weekly care check, checked every day, client website care, and white-label handoffs before SEO monitoring, daily monitoring, or operations wording.
- Pricing and verification copy should reduce anxiety before a user commits to setup or a plan.

Implementation:

- [x] Rewrite plan catalog descriptions from monitoring language to website-care language.
- [x] Soften email confirmation copy away from SEO issue wording.
- [x] Cover the exact plan descriptions and old monitoring phrases with unit tests.
- [x] Browser-check plan copy calmness after deployment.

### Batch DJ: Navigation Label Calmness

Competitive evidence:

- Semrush and Ahrefs expose expert module names like site audit, keyword research, rank tracking, and competitor analysis, which work for trained SEO users but slow down beginners.
- Nontechnical users should be able to scan the sidebar and see websites, problems, fixes, search growth, competitor insights, search ideas, rank movement, links, and ideas before expert tool names.
- Navigation help should describe the benefit of each area in plain care language instead of SEO workload, CMS, hosting, or technical module language.

Implementation:

- [x] Centralize softer sidebar labels and help text in the product copy helper.
- [x] Rename visible sidebar labels away from expert module wording while preserving existing routes.
- [x] Cover the exact beginner-facing navigation labels with unit tests.
- [x] Browser-check navigation label calmness locally.
- [x] Browser-check navigation label calmness after deployment.

### Batch DK: Website Tool Label Consistency

Competitive evidence:

- Semrush and Ahrefs keep multiple tool areas available inside each project, but a beginner-friendly product should not rename the same destinations differently between the sidebar and the active website toolbar.
- Nontechnical users should see Search Growth, Competitor Insights, Search Ideas, Rank Movement, Links, Ideas, and Connections consistently before Search, Competitors, Keywords, Rank, Technical, AI, or Integrations.
- The active website toolbar should feel like a small care map for the current website, not a second product vocabulary.

Implementation:

- [x] Reuse the product navigation copy helper for website tool labels.
- [x] Rename the active website toolbar labels to match the softer sidebar language.
- [x] Cover the exact website tool labels with unit tests.
- [x] Browser-check website tool label consistency locally.
- [x] Browser-check website tool label consistency after deployment.

### Batch DL: Report Update Copy Calmness

Competitive evidence:

- Semrush and Ahrefs make report builders powerful for trained SEO users, but beginner-facing handoffs should read as website updates rather than SEO reports or SEO workspaces.
- Nontechnical users should see weekly website update, regular client website update, shared website update, and important website changes before SEO update, SEO report, or SEO changes.
- Report creation and sharing should feel like a calm progress note that can be sent to a client or teammate without extra explanation.

Implementation:

- [x] Centralize report-update wording in the product copy helper.
- [x] Rename report list, schedule, share, detail, and generated website report title copy away from SEO report/update phrasing.
- [x] Cover the exact report update copy contract with unit tests.
- [x] Browser-check report update copy calmness locally.
- [x] Browser-check report update copy calmness after deployment.

### Batch DM: Automation Connection Copy Calmness

Competitive evidence:

- Semrush Site Audit connects with Zapier so teams can create tasks, re-run checks, and move updates into tools like Asana, Monday, Jira, Salesforce, HubSpot, and email.
- Ahrefs Looker Studio connectors and report templates show that competitor products keep automation and reporting integrations available for advanced workflows.
- A beginner-friendly product should keep Zapier and Make setup visible, but describe it as website care updates instead of SEO updates.

Implementation:

- [x] Centralize automation connection wording in the product copy helper.
- [x] Rename Zapier and Make helper text away from SEO updates toward website care updates.
- [x] Cover the exact automation connection copy contract with unit tests.
- [x] Browser-check automation connection copy calmness locally.
- [x] Browser-check automation connection copy calmness after deployment.

### Batch DN: Connection Page SEO Phrase Calmness

Competitive evidence:

- Semrush's Zapier App Center workflow keeps Site Audit automation powerful for trained teams, including tasks, re-checks, and handoffs into work tools.
- Ahrefs' Looker Studio connector and report templates keep advanced dashboard/report integrations available for marketers and analysts.
- A beginner-friendly Connections page should preserve those integration paths while saying website step, website pages, website messages, and Website Care plugin before SEO step, SEO pages, SEO messages, store SEO, or All In One SEO plugin.

Implementation:

- [x] Extend the connection copy helper to cover page plan, analytics, WordPress, Shopify, and Slack wording.
- [x] Rename visible Connections page phrases away from SEO jargon while preserving existing providers and routes.
- [x] Cover the exact connection-page wording with unit tests.
- [x] Browser-check connection page SEO phrase calmness locally.
- [x] Browser-check connection page SEO phrase calmness after deployment.

### Batch DO: Everyday Beginner Phrase Calmness

Competitive evidence:

- Semrush keeps powerful AI and workflow surfaces available, but its copy often assumes marketing comfort with SEO-specific vocabulary.
- Ahrefs keeps advanced reporting and dashboard language direct for marketers, while a beginner-first product should make common account and idea screens feel less technical before the user reaches deeper tools.
- The gentler product direction is to say website care workspace, website care work, and technical wording before SEO dashboard, everyday SEO work, SEO jargon, or SEO teammate on broad surfaces.

Implementation:

- [x] Centralize broad beginner-safe product phrases for account, settings, and ideas surfaces.
- [x] Replace visible beginner-surface SEO phrases in Ideas, Settings, and password reset copy.
- [x] Cover the exact broad beginner wording with unit tests.
- [x] Browser-check broad beginner phrase calmness locally.
- [x] Browser-check broad beginner phrase calmness after deployment.

### Batch DP: Client Report Detail Calmness

Competitive evidence:

- Semrush My Reports and Site Audit reporting keep export, branding, and scheduled report depth available, but the client-facing value is a clear report someone can read.
- Ahrefs report and dashboard workflows preserve advanced site and search data for deeper review, while the first shared-report read should summarize progress and next steps.
- The softer product direction is to say website progress score, update, and extra technical detail before fresh audit data or raw audit detail on broad onboarding and shared-report surfaces.

Implementation:

- [x] Centralize client-report and onboarding progress wording in the product copy helper.
- [x] Replace visible agency onboarding and shared-report audit phrases with softer progress wording.
- [x] Cover the exact client-report wording with unit tests.
- [x] Browser-check client-report detail calmness locally.
- [x] Browser-check client-report detail calmness after deployment.

### Batch DQ: Stored Report Title Calmness

Competitive evidence:

- Semrush My Reports presents report creation as customizable, professional reporting that can showcase work to clients without making the title itself feel like a technical audit artifact.
- Ahrefs Report Builder keeps advanced widgets and SEO data available, while the report container can still be configured and shared as a clear client-facing deliverable.
- The softer product direction is to display older stored SEO report titles as website updates or website health updates across report lists, detail pages, public shares, PDFs, and search results.

Implementation:

- [x] Add a conservative report-title formatter that softens SEO report titles without rewriting custom non-SEO titles.
- [x] Apply softened report titles to report library, report detail, public share, PDF text and filename, client detail, website workspace, and global search results.
- [x] Update seed demo report titles so future local data starts with website-update language.
- [x] Cover the exact title softening with unit tests.
- [x] Browser-check stored report title calmness locally.
- [x] Browser-check stored report title calmness after deployment.

### Batch DR: Client Setup Check Calmness

Competitive evidence:

- Semrush project and client-facing workflows keep setup, site health, and reporting visible, but they assume the user understands SEO check language.
- Ahrefs and Moz preserve crawl and audit depth for trained marketers, while a beginner client list should say website checks before SEO checks.
- The softer product direction is to make the client setup tile read as a simple next step: connect a website, then website checks can begin.

Implementation:

- [x] Centralize the client setup tile wording in the product copy helper.
- [x] Replace the visible client-list SEO checks phrase with website checks.
- [x] Cover the exact client setup wording with unit tests.
- [x] Browser-check client setup check calmness locally.
- [x] Browser-check client setup check calmness after deployment.

### Batch DS: Add Website First Check Calmness

Competitive evidence:

- Semrush project setup and Site Audit flows preserve powerful setup and checking depth, but beginner onboarding should frame the first step as a website check rather than an SEO check.
- Ahrefs and Moz keep audit and crawl detail available after setup, while the first Add Website screen should feel like a calm setup path for a nontechnical user.
- The softer product direction is to say ownership, check rhythm, and first website check before first SEO check on the Add Website screen.

Implementation:

- [x] Centralize the Add Website intro sentence in the product copy helper.
- [x] Replace the visible first SEO check phrase with first website check.
- [x] Cover the exact Add Website intro wording with unit tests.
- [x] Browser-check Add Website first-check calmness locally.
- [x] Browser-check Add Website first-check calmness after deployment.

### Batch DT: Dashboard Website Wording Calmness

Competitive evidence:

- Semrush and Ahrefs both keep project-level depth available, but beginner-facing dashboards should make the first decision feel like caring for websites, not managing projects.
- Ubersuggest's audit flow keeps the setup path closer to a website check, which is easier for a nontechnical user to understand.
- The softer product direction is to say websites, website list, and website details before project tables, project analytics, or project list on broad first-screen surfaces.

Implementation:

- [x] Centralize dashboard website wording in the product copy helper.
- [x] Replace visible dashboard project wording with website wording in links, details, help text, and next steps.
- [x] Replace project wording in website loading and business onboarding setup copy.
- [x] Cover the exact dashboard website wording with unit tests.
- [x] Browser-check dashboard website wording locally.
- [x] Browser-check dashboard website wording after deployment.

### Batch DU: Website Workspace Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep project workspaces and site-health metrics visible, but a beginner-first workspace should not ask the user to translate between project, site, and integration vocabulary.
- The active website view should reuse the same simple navigation language as the sidebar: websites, search growth, links, connections, and website health.
- The softer product direction is to make the individual website workspace feel like one guided care page before deeper expert tools.

Implementation:

- [x] Replace the visible website-workspace breadcrumb from Projects to Websites.
- [x] Replace the visible Websites list heading and table labels away from Projects, Site health, and Page links.
- [x] Reuse softer workspace tool labels for Search Growth, Links, and Connections.
- [x] Rename site-health wording in the workspace summary to website-health wording.
- [x] Cover the exact workspace health wording with unit tests.
- [x] Browser-check website workspace label calmness locally.
- [x] Browser-check website workspace label calmness after deployment.

### Batch DV: First-Impression Plan Copy Calmness

Competitive evidence:

- Semrush and Ahrefs use expert SEO language because their dashboards are built for trained marketers, but the beginner-first product should explain the first path without requiring SEO vocabulary.
- The first dashboard card and business onboarding paragraph should say website plan and website care plan before SEO plan or SEO terms.
- A nontechnical user should understand the first screen as a short care path, not a lesson in SEO terminology.

Implementation:

- [x] Centralize the first-impression plan wording in the product copy helper.
- [x] Rename the dashboard start panel from Today's SEO plan to Today's website plan.
- [x] Replace the dashboard SEO-term reassurance with plain technical-website-wording reassurance.
- [x] Replace business onboarding simple SEO plan copy with simple website care plan copy.
- [x] Cover the exact first-impression wording with unit tests.
- [x] Browser-check first-impression plan copy locally.
- [x] Browser-check first-impression plan copy after deployment.

### Batch DW: Rank Movement Website Label Calmness

Competitive evidence:

- Semrush and Ahrefs expose position tracking around projects and keywords, but a beginner-friendly rank screen should keep the selected website obvious before showing keyword inventory.
- The softer product direction is to say website in filters, table headers, and focused-work notes before project wording.
- A nontechnical user should understand rank movement as a website-specific watchlist, not a project-management surface.

Implementation:

- [x] Centralize Rank Movement website wording in the product copy helper.
- [x] Replace rank view copy from project-and-keyword wording to website-and-keyword wording.
- [x] Replace the manual tracking form project label and Choose project option with website wording.
- [x] Replace the tracked keyword table Project header with Website.
- [x] Cover the exact rank website wording with unit tests.
- [x] Browser-check rank movement website labels locally.
- [x] Browser-check rank movement website labels after deployment.

### Batch DX: Connections Action Label Calmness

Competitive evidence:

- Semrush and Ahrefs use integration-style language for advanced users, but a beginner-first product should keep one simple label for the place where tools are connected.
- The sidebar and website workspace already say Connections, so action buttons should not send a nontechnical user to a differently named Integrations area.
- The softer product direction is to make setup and fix-delivery actions read as one clear path: open Connections, connect the missing tool, then return to the fix or website.

Implementation:

- [x] Centralize Connections action labels in the product copy helper.
- [x] Replace visible Fix Center Open Integrations buttons with Open Connections.
- [x] Replace the website workspace Fix receiver prompt with Connect in Connections.
- [x] Cover the exact Connections action wording with unit tests.
- [x] Browser-check Connections action label calmness locally.
- [x] Browser-check Connections action label calmness after deployment.

### Batch DY: Dashboard Metric Help Calmness

Competitive evidence:

- Semrush and Ahrefs put health and visibility metrics on the first dashboard, but their helper text assumes the user is comfortable with SEO operations language.
- A beginner-first product should keep the same metrics while explaining them as website care, especially in tooltip or help text that appears on the first screen.
- The softer product direction is to make dashboard metrics feel like everyday website health checks rather than an expert SEO operations console.

Implementation:

- [x] Centralize dashboard metric help wording in the product copy helper.
- [x] Replace Average SEO health with Average website health.
- [x] Replace the generic SEO operations fallback with everyday website care.
- [x] Cover the exact dashboard metric help wording with unit tests.
- [x] Browser-check dashboard metric help calmness locally.
- [x] Browser-check dashboard metric help calmness after deployment.

### Batch DZ: Links Page Plan Calmness

Competitive evidence:

- Semrush and Ahrefs expose internal-link and crawl-depth detail, but their terminology can feel like an audit category instead of a simple next step.
- A beginner-first Links page should say links, link help, and care plan before page-link problems or page-link plan language.
- The softer product direction is to keep detailed link counts available while making the first action feel like helping important pages become easier to find.

Implementation:

- [x] Centralize Links page plan wording in the product copy helper.
- [x] Replace the Page links plan label with Links care plan.
- [x] Replace page-link problems preview copy with link-help items.
- [x] Cover the exact Links page wording with unit tests.
- [x] Browser-check Links page plan calmness locally.
- [x] Browser-check Links page plan calmness after deployment.

### Batch EA: Pages Content Check Calmness

Competitive evidence:

- Semrush and Ahrefs keep page-level SEO fields available for expert review, but a beginner-first page inventory should make the first content check feel simple.
- A nontechnical user is more likely to understand page titles and page details than deeper SEO fields.
- The softer product direction is to keep page diagnostics available while making the plan tile sound like a gentle review step.

Implementation:

- [x] Centralize the Pages content-check detail wording in the product copy helper.
- [x] Replace deeper SEO fields wording with rest-of-page-details wording.
- [x] Cover the exact Pages content-check wording with unit tests.
- [x] Browser-check Pages content check calmness locally.
- [x] Browser-check Pages content check calmness after deployment.

### Batch EB: Dashboard Search-Term Shortcut Calmness

Competitive evidence:

- Semrush and Ahrefs expose keyword tracking quickly, but beginner users often understand search terms before keywords.
- A softer dashboard shortcut should still lead to rank movement while using everyday language in the first-screen action list.
- The product direction is to reserve keyword detail for deeper views and make broad dashboard actions feel like plain website care.

Implementation:

- [x] Centralize the dashboard search-term shortcut label in the product copy helper.
- [x] Replace the Track keywords shortcut with Watch search terms.
- [x] Cover the exact shortcut wording with unit tests.
- [x] Browser-check dashboard search-term shortcut calmness locally.
- [x] Browser-check dashboard search-term shortcut calmness after deployment.

### Batch EC: Search Ideas Search-Term Calmness

Competitive evidence:

- Semrush and Ahrefs expose query and keyword datasets quickly, but that language can feel like raw data work for a nontechnical user.
- A beginner-first Search Ideas page should lead with search terms, simple briefs, and optional deeper detail before using analyst-style query wording.
- The softer product direction is to keep Search Console evidence available while making the first read feel like choosing one helpful search idea.

Implementation:

- [x] Centralize Search Ideas search-term wording in the product copy helper.
- [x] Replace deeper query data with optional deeper search-term detail.
- [x] Replace Search Console query/queries wording with search-term wording in metrics, workspace notes, and detail states.
- [x] Cover the exact Search Ideas wording with unit tests.
- [x] Browser-check Search Ideas search-term calmness locally.
- [x] Browser-check Search Ideas search-term calmness after deployment.

### Batch ED: Rank Movement Search-Term Calmness

Competitive evidence:

- Semrush and Ahrefs make keyword/rank tracking prominent, but that wording can feel like expert SEO inventory work for a nontechnical user.
- A beginner-first Rank Movement screen should keep rank evidence available while framing the watched items as search terms that moved.
- The softer product direction is to make the first scan answer one question: which search term needs attention next?

Implementation:

- [x] Centralize Rank Movement search-term wording in the product copy helper.
- [x] Replace tracked-keyword hero, metric, and plan wording with watched search-term wording.
- [x] Replace the manage-tracking panel labels and placeholders with search-term wording.
- [x] Cover the exact Rank Movement wording with unit tests.
- [x] Browser-check Rank Movement search-term calmness locally.
- [x] Browser-check Rank Movement search-term calmness after deployment.

### Batch EE: Website Workspace Search Summary Calmness

Competitive evidence:

- Semrush and Ahrefs expose search visibility, impressions, and query counts on overview surfaces, but their helper text assumes analytics comfort.
- A beginner-first website workspace should keep Google Search Console evidence visible while explaining it as search results and search terms.
- The softer product direction is to make the website overview answer "how people are finding this website" before exposing deeper performance detail.

Implementation:

- [x] Centralize website workspace search summary wording in the product copy helper.
- [x] Replace average-position visibility help with plain website visibility wording.
- [x] Replace organic-impression and query helper copy with search-result and search-term wording.
- [x] Cover the exact website workspace search summary wording with unit tests.
- [x] Browser-check website workspace search summary calmness locally.
- [x] Browser-check website workspace search summary calmness after deployment.

### Batch EF: Rank Competitor Gap Calmness

Competitive evidence:

- Semrush and Ahrefs expose competitor rank gaps for expert comparison, but beginner users need to understand that another page is simply ahead.
- A softer Rank Movement competitor panel should keep the same competitive evidence while saying competitor page gaps and positions.
- The product direction is to make competitive comparison feel like a page improvement prompt, not a technical rank audit.

Implementation:

- [x] Centralize Rank Movement competitor-gap wording in the product copy helper.
- [x] Replace Competitor rank gaps with Competitor page gaps.
- [x] Replace competitor-rank empty and hidden-note copy with competitor-position and deeper-page-review wording.
- [x] Cover the exact Rank competitor gap wording with unit tests.
- [x] Browser-check Rank competitor gap calmness locally.
- [x] Browser-check Rank competitor gap calmness after deployment.

### Batch EG: Rank Manual Data Calmness

Competitive evidence:

- Semrush and Ahrefs make rank, volume, and difficulty labels familiar for SEO teams, but those words can feel like expert data entry to a beginner.
- A softer manual Rank Movement panel should keep the same controls while saying Google position, monthly searches, and competition.
- The product direction is to make optional data entry feel like a guided update, not a keyword metrics import workflow.

Implementation:

- [x] Centralize Rank Movement manual-data labels in the product copy helper.
- [x] Replace Record rank and Save rank with Add Google position and Save position.
- [x] Replace Import metric, Save metric, Volume, Difficulty, and Owned rank with softer search-detail wording.
- [x] Cover the exact Rank manual-data wording with unit tests.
- [x] Browser-check Rank manual-data calmness locally.
- [x] Browser-check Rank manual-data calmness after deployment.

### Batch EH: Rank Plan Google Spot Calmness

Competitive evidence:

- Semrush and Ahrefs expose rank distribution and missing rank inputs for expert users, but a beginner-friendly rank screen should describe those as Google spots.
- A softer Rank Movement plan should keep the same tracking power while turning missing rank data into a simple next update.
- The product direction is to make the first rank scan feel like "what changed and what needs a saved Google spot," not a keyword database review.

Implementation:

- [x] Centralize Rank Movement plan, distribution, and missing-position labels in the product copy helper.
- [x] Replace Adjust rank view, Needs rank data, Fill missing rank data, need ranks, Waiting for ranks, Rank distribution, Movement monitor, and Keyword table wording with Google-spot and search-term wording.
- [x] Cover the exact Rank plan Google-spot wording with unit tests.
- [x] Browser-check Rank plan Google-spot calmness locally.
- [x] Browser-check Rank plan Google-spot calmness after deployment.

### Batch EI: Loading And Navigation Help Calmness

Competitive evidence:

- Semrush and Ahrefs use expert module names like keyword research, position tracking, competitive analysis, and issue analytics because their users expect SEO tooling language.
- A beginner-first product should keep the same power but avoid showing those expert labels during navigation help or loading states.
- The product direction is to make every transition feel like opening a clear work area: Competitor Insights, Problems, Search Ideas, and Rank Movement.

Implementation:

- [x] Replace sidebar help for Rank Movement away from keyword movement wording.
- [x] Replace Ideas help away from AI-sounding page recommendation wording.
- [x] Replace loading states for Competitive Analysis, Problems, Search Ideas, and Rank Movement with beginner-facing labels.
- [x] Cover navigation help and loading labels with unit tests.
- [x] Browser-check loading and navigation help calmness locally.
- [ ] Browser-check loading and navigation help calmness after deployment.

### Batch EJ: Search Ideas Keyword Wording Calmness

Competitive evidence:

- Semrush and Ahrefs use keyword research, tracked keyword, and rank-tracking language because their workflows are built for trained marketers.
- A beginner-first Search Ideas page should keep the same demand and competitor evidence while saying search ideas, search terms, and Google spots.
- The product direction is to make the page feel like choosing one helpful writing idea, not managing a keyword research database.

Implementation:

- [x] Centralize Search Ideas filter, setup, visibility, empty-state, and competitor-gap wording in the product copy helper.
- [x] Replace keyword opportunities, Adjust keyword filters, Import keyword data, Choose keywords to watch, Pick one keyword to improve, and Rank Tracking references with search-idea/search-term wording.
- [x] Cover the exact Search Ideas keyword wording with unit tests.
- [x] Browser-check Search Ideas keyword wording calmness locally.
- [x] Browser-check Search Ideas keyword wording calmness after deployment.

### Batch EK: Website Workspace Search Visibility Calmness

Competitive evidence:

- Semrush and Ahrefs keep search visibility close to project and site-audit summaries, but their helper text assumes the reader already knows the data source.
- A beginner-first website workspace should keep the same Google Search Console evidence while explaining visibility as how visible the website is across search terms.
- The product direction is to make the first website workspace scan feel like plain website care before a user opens deeper search growth detail.

Implementation:

- [x] Reuse the centralized website workspace search visibility helper on the main workspace metric card.
- [x] Guard against the older Search Console visibility phrase in product copy tests.
- [x] Browser-check website workspace search visibility calmness locally.
- [x] Browser-check website workspace search visibility calmness after deployment.

### Batch EL: Global Search Shortcut Calmness

Competitive evidence:

- Semrush and Ahrefs keep keyword and rank tools quick to reach, but their shortcut wording assumes a trained marketer knows those feature names.
- A beginner-first global search should still open Search Ideas and Rank Movement quickly while describing the action as search ideas and watched search terms.
- The product direction is to make Ctrl K feel like a helpful website-care shortcut, not a command palette full of expert SEO labels.

Implementation:

- [x] Centralize the Search Ideas and Rank Movement global-search action wording.
- [x] Replace Open keywords, keyword positions, and Open rank shortcut wording with search-idea and rank-movement language.
- [x] Cover the exact global-search shortcut wording with unit tests.
- [x] Browser-check global-search shortcut calmness locally.
- [x] Browser-check global-search shortcut calmness after deployment.

### Batch EM: Global Search Website Label Consistency

Competitive evidence:

- Semrush and Ahrefs expose projects and competitor tools as quick actions, but their labels assume the user already understands the product taxonomy.
- A beginner-first command search should use the same words as the sidebar: Websites and Competitor Insights.
- The product direction is to make every shortcut feel like it opens the same calm product area the user already saw, not a renamed expert module.

Implementation:

- [x] Centralize global-search website-check and competitor-insight shortcut wording.
- [x] Replace Open Projects and Open competitors language with Websites and Competitor Insights wording.
- [x] Cover the exact global-search website and competitor shortcut wording with unit tests.
- [x] Browser-check global-search website label consistency locally.
- [x] Browser-check global-search website label consistency after deployment.

### Batch EN: Search Growth Plan Keyword Calmness

Competitive evidence:

- Semrush and Ahrefs put keyword and ranking setup inside search-performance workflows, but a beginner-first Search Growth page should keep the path in search terms and Google spots.
- A nontechnical user should be guided to connect data, watch search terms, and use search ideas without seeing keyword database language.
- The product direction is to make Search Growth feel like improving Google visits, not managing rankings.

Implementation:

- [x] Centralize Search Growth setup and plan fallback wording in the product copy helper.
- [x] Replace Add keywords, Choose keywords to watch, ranking drop, and keyword ideas wording with search-term and search-idea language.
- [x] Cover the exact Search Growth plan wording with unit tests.
- [x] Browser-check Search Growth plan keyword calmness locally.
- [x] Browser-check Search Growth plan keyword calmness after deployment.

### Batch EO: Search Growth Detail Table Calmness

Competitive evidence:

- Semrush and Ahrefs keep CTR, position, and deeper search tables available for analysis, but those labels assume the user already knows marketing shorthand.
- A beginner-first Search Growth page should preserve the deeper table while using plain labels like click rate and search detail.
- The product direction is to make optional search tables feel like helpful detail, not an expert analytics report.

Implementation:

- [x] Centralize Search Growth detail-table wording in the product copy helper.
- [x] Replace CTR, More search data, Show tables, and more rows wording with softer detail language.
- [x] Cover the exact Search Growth detail-table wording with unit tests.
- [x] Browser-check Search Growth detail-table calmness locally.
- [x] Browser-check Search Growth detail-table calmness after deployment.

### Batch EP: Search Ideas Detail Metric Calmness

Competitive evidence:

- Semrush and Ahrefs expose keyword detail with impressions, CTR, positions, owned rank, and volume because their users expect SEO analytics shorthand.
- A beginner-first Search Ideas page should keep the same evidence while saying times seen, click rate, Google spot, and monthly searches.
- The product direction is to make deeper Search Ideas feel like choosing a writing opportunity, not reading a keyword metrics table.

Implementation:

- [x] Centralize Search Ideas detail metric labels in the product copy helper.
- [x] Replace CTR, impressions, position, owned rank, not ranking, and volume wording in visible Search Ideas detail sections.
- [x] Cover the exact Search Ideas detail metric wording with unit tests.
- [x] Browser-check Search Ideas detail metric calmness locally.
- [ ] Browser-check Search Ideas detail metric calmness after deployment.

### Batch EQ: Rank Movement Update Panel Calmness

Competitive evidence:

- Semrush and Ahrefs keep manual rank and keyword metric updates available, but those controls are framed as tracking data for trained SEO operators.
- A beginner-first Rank Movement page should keep those controls while presenting them as simple search-term updates.
- The product direction is to make optional Rank Movement updates feel like a calm helper, not a data-management console.

Implementation:

- [x] Centralize Rank Movement update-panel and plan-card labels in the product copy helper.
- [x] Replace Manage tracking data, Add data, tracked, Recover lost positions, No drops to fix, and tracked-keyword competitor-gap reasons with softer update language.
- [x] Cover the exact Rank Movement update-panel wording with unit tests.
- [x] Browser-check Rank Movement update-panel calmness locally.
- [x] Browser-check Rank Movement update-panel calmness after deployment.

### Batch ER: Report Change Summary Calmness

Competitive evidence:

- Semrush and Ahrefs reporting keeps change and audit evidence visible, but tracked-change language can feel like an internal log.
- A beginner-first report should describe important website changes in client-readable language.
- The product direction is to make shared updates feel calm and ready to send, not like a technical audit export.

Implementation:

- [x] Centralize report change-summary count and empty-state wording in the product copy helper.
- [x] Replace tracked changes, No major tracked changes, and No tracked changes wording in private and shared reports.
- [x] Cover the exact report change-summary wording with unit tests.
- [x] Browser-check report change-summary calmness locally.
- [x] Browser-check report change-summary calmness after deployment.

### Batch ES: Pages Care Language Calmness

Competitive evidence:

- Semrush and Ahrefs surface critical issues and urgent page groups for trained SEO teams, but that framing can feel alarming to a beginner.
- A beginner-first Pages area should still preserve the same priority signal while saying pages needing care and important page changes.
- The product direction is to make page review feel like a short care plan, not a technical severity dashboard.

Implementation:

- [x] Centralize Pages plan, metric, importance, and page-change empty-state wording in the product copy helper.
- [x] Replace critical-pages, urgent-pages, urgent-problems, and tracked-page-change language in Pages list and detail views.
- [x] Cover the exact Pages care wording with unit tests.
- [x] Browser-check Pages care language calmness locally.
- [x] Browser-check Pages care language calmness after deployment.

### Batch ET: Report Issue Movement Calmness

Competitive evidence:

- Semrush Site Audit and Ahrefs Site Audit keep audit issues grouped by severity, including error-style priority tabs that help trained SEO teams decide what to fix first.
- A beginner-first client report should keep the same priority signal while saying needs care and quick fixes instead of urgent open or urgent fix.
- The product direction is to make report sharing feel like a calm client handoff, not a severity dashboard.

Implementation:

- [x] Centralize report next-fix, issue-movement, and importance badge wording in the product copy helper.
- [x] Replace urgent fix, urgent open, and urgent severity badge wording in private and shared reports.
- [x] Cover the exact report issue-movement wording with unit tests.
- [x] Browser-check report issue-movement calmness locally.
- [x] Browser-check report issue-movement calmness after deployment.

### Batch EU: Ideas And Fixes Priority Calmness

Competitive evidence:

- Semrush and Ahrefs expose recommendations and site-audit fixes with severity labels that help expert users triage, but urgent priority language can feel stressful for a beginner.
- A beginner-first Ideas and Fixes page should keep the same priority signal while saying needs care first, high care priority, and needs quick care.
- The product direction is to make generated notes feel like helpful writing and fix support, not an AI-powered severity console.

Implementation:

- [x] Centralize Ideas and Fixes importance and priority wording in the product copy helper.
- [x] Replace urgent severity and urgent priority wording in fix-note and repeated-page note rows.
- [x] Cover the exact Ideas and Fixes priority wording with unit tests.
- [x] Browser-check Ideas and Fixes priority calmness locally.
- [ ] Browser-check Ideas and Fixes priority calmness after deployment.

### Batch EV: Website Workspace Care Priority Calmness

Competitive evidence:

- Semrush Site Audit and Ahrefs Site Audit keep errors, warnings, notices, and priority triage visible because trained SEO users expect that hierarchy.
- Screaming Frog exposes dense crawl tabs and issue data for expert review, which is powerful but not a calming first screen for a beginner.
- A beginner-first Website workspace should keep the same signal while saying care priorities, quick-care problems, and planned work.

Implementation:

- [x] Centralize Website workspace care-priority, severity, and first-action wording in the product copy helper.
- [x] Replace priority problems, urgent/planned, urgent fixes, and urgent-problem wording in the Website workspace.
- [x] Cover the exact Website workspace care-priority wording with unit tests.
- [x] Browser-check Website workspace care-priority calmness locally.
- [x] Browser-check Website workspace care-priority calmness after deployment.

### Batch EW: Dashboard Quick-Care Calmness

Competitive evidence:

- Semrush and Ahrefs put urgent errors and site-audit severity directly on their dashboards for expert triage.
- A beginner-first dashboard should keep the first-fix signal but frame it as needs care and quick-care work before reports.
- The product direction is to make the first screen feel like a calm daily plan, not a pressure-heavy audit queue.

Implementation:

- [x] Centralize dashboard quick-care labels, helper text, and first-action wording in the product copy helper.
- [x] Replace urgent work, urgent-problem, high-risk, and urgent-change wording on the home dashboard.
- [x] Cover the exact dashboard quick-care wording with unit tests.
- [x] Browser-check dashboard quick-care calmness locally.
- [x] Browser-check dashboard quick-care calmness after deployment.

### Batch EY: Report Export Quick-Care Calmness

Competitive evidence:

- Semrush and Ahrefs keep severity and issue movement visible in report and export workflows for expert triage.
- A beginner-first client handoff should keep the same priority signal while saying quick-care problems, important changes, and needs quick care.
- The product direction is to make report PDFs and CSV handoffs feel client-ready instead of like a severity export.

Implementation:

- [x] Replace urgent problem and urgent change wording in generated report PDF text.
- [x] Replace urgent importance wording in problem CSV exports.
- [x] Cover report PDF text and CSV importance wording with unit tests.
- [x] Runtime-check report/export quick-care calmness locally.
- [ ] Runtime-check report/export quick-care calmness after deployment.


### Batch EZ: Alert Rule Quick-Care Calmness

Competitive evidence:

- Semrush and Ahrefs alerting patterns preserve important change monitoring, but expert severity names can make every alert feel like an emergency.
- A beginner-first alert setup should say important change and needs quick care before raw critical or urgent labels.
- The product direction is to make alert rules feel like helpful watching, not an incident console.

Implementation:

- [x] Centralize alert importance and watched-change labels in the alert display helper.
- [x] Replace urgent change and urgent importance wording in alert rule setup and saved-rule rows.
- [x] Cover alert rule labels with unit tests.
- [x] Browser-check alert rule quick-care calmness locally.
- [ ] Browser-check alert rule quick-care calmness after deployment.

### Batch FA: Saved Website Care Priority Calmness

Competitive evidence:

- Semrush and Ahrefs keep project/site-audit detail organized around severity and priority so trained users can triage quickly.
- A beginner-first saved-website page should keep the same signal while saying quick care, planned work, and care priorities.
- The product direction is to make a saved website feel like a short care plan, not a severity dashboard.

Implementation:

- [x] Centralize saved-website care-priority labels and empty-state wording in the product copy helper.
- [x] Replace urgent/planned, priority-problem, and urgent severity wording on the saved-website detail page.
- [x] Reuse the shared quick-care problem severity formatter.
- [x] Cover saved-website care-priority wording with unit tests.
- [x] Runtime-check saved-website care-priority calmness locally.
- [x] Browser-check saved-website care-priority calmness after deployment.

### Batch FB: Global Search Problem Title Calmness

Competitive evidence:

- Semrush and Ahrefs search and issue navigation preserve priority signals, but expert severity labels can make quick search results feel alarming.
- A beginner-first command search should keep problem results useful while describing regressions as important changes.
- The product direction is to make Ctrl K feel like a friendly website-care shortcut, not a list of incident labels.

Implementation:

- [x] Centralize the global-search important-change label in the product copy helper.
- [x] Replace the remaining urgent-change problem title in global search.
- [x] Cover global-search problem-title softening with unit tests.
- [x] Runtime-check global-search problem-title calmness locally.
- [x] Runtime-check global-search problem-title calmness after deployment.

### Batch FC: Websites List Quick-Care Calmness

Competitive evidence:

- Semrush and Ahrefs keep error and warning counts visible on website and project lists for fast expert triage.
- A beginner-first Websites list should preserve the same ordering signal while saying quick care and planned work.
- The product direction is to make the first website list feel like choosing who needs care next, not reading a severity table.

Implementation:

- [x] Centralize Websites list quick-care labels in the product copy helper.
- [x] Replace urgent shortlist, table, ready-group, and card labels on the Websites list.
- [x] Cover Websites list quick-care wording with unit tests.
- [x] Browser-check Websites list quick-care calmness locally.
- [x] Browser-check Websites list quick-care calmness after deployment.

### Batch FD: Problems List Quick-Care Calmness

Competitive evidence:

- Semrush and Ahrefs keep issue severity, priority, and regression language visible so expert teams can triage fast.
- A beginner-first Problems list should keep the same ordering power while saying care level, quick-care problems, planned work, and important changes.
- The product direction is to make problem solving feel like one calm next step, not a severity queue.

Implementation:

- [x] Centralize Problems list care-level and quick-care plan wording in the product copy helper.
- [x] Replace urgent filter, plan, count, and regression wording on the Problems list.
- [x] Cover Problems list quick-care wording with unit tests.
- [x] Runtime-check Problems list quick-care calmness locally.
- [x] Browser-check Problems list quick-care calmness after deployment.

### Batch FE: WordPress Connection Retry Calmness

Competitive evidence:

- Semrush and Ahrefs keep integration and site-audit setup states explicit so expert users can troubleshoot quickly.
- A beginner-first connection setup should preserve the same test result while saying needs another try and what to check next.
- The product direction is to make WordPress setup feel like a guided connection checklist, not a failed receiver diagnostic.

Implementation:

- [x] Centralize WordPress connection-test message softening in the WordPress helper.
- [x] Replace visible receiver-test failure wording on the Integrations page with calmer connection wording.
- [x] Cover stored and fallback WordPress connection messages with unit tests.
- [x] Runtime-check WordPress connection retry calmness locally.
- [x] Browser-check WordPress connection retry calmness after deployment.

### Batch FF: Website Check Recap Quick-Care Calmness

Competitive evidence:

- Semrush and Ahrefs keep crawl and site-audit recaps organized by severity and changed-page signals for expert triage.
- A beginner-first recap should keep the same signal while saying needs quick care and nothing needs quick care instead of urgent follow-up.
- The product direction is to make each finished website check feel like a calm recap with an obvious next step.

Implementation:

- [x] Centralize the quiet website-check recap next-step copy in the product copy helper.
- [x] Replace urgent follow-up and urgent change-badge wording in the Website check recap.
- [x] Cover Website check recap quick-care wording with unit tests.
- [x] Runtime-check Website check recap quick-care calmness locally.
- [x] Browser-check Website check recap quick-care calmness after deployment.

### Batch FG: Problem Detail Quick-Care Calmness

Competitive evidence:

- Semrush and Ahrefs keep issue severity visible on detail pages because expert users need triage context.
- A beginner-first problem detail should keep the same importance signal while saying needs quick care and important change.
- The product direction is to make an individual problem feel like one guided fix, not an urgent incident page.

Implementation:

- [x] Reuse the shared quick-care importance formatter on the Problem detail page.
- [x] Replace urgent change and urgent SEO regression wording in Problem detail title and body softening.
- [x] Cover the shared importance and important-change wording with existing product copy tests.
- [x] Runtime-check Problem detail quick-care calmness locally.
- [x] Browser-check Problem detail quick-care calmness after deployment.

### Batch FH: Dashboard Detail Table Website Calmness

Competitive evidence:

- Semrush and Ahrefs keep project and crawl tables available for expert review, but those tables often use domain and URL language.
- A beginner-first dashboard should keep portfolio comparison available while saying website and pages checked before domain or URL phrasing.
- The product direction is to make the optional dashboard detail feel like a website list, not an expert audit table.

Implementation:

- [x] Centralize dashboard detail-table website labels and helper text in the product copy helper.
- [x] Replace the dashboard detail table Domain header and monitored-domain helper with website language.
- [x] Cover dashboard detail-table website wording with unit tests.
- [x] Runtime-check dashboard detail-table website calmness locally.
- [x] Browser-check dashboard detail-table website calmness after deployment.

### Batch FI: Fix Row Link-Label Calmness

Competitive evidence:

- Semrush and Ahrefs keep URL-level evidence in audit and link-fix workflows so expert teams can verify the exact affected page.
- A beginner-first Fixes page should preserve the same link evidence while saying page with the link, link that needs help, better page to use, and link text.
- The product direction is to make each fix row feel like a short editing task, not a broken-URL diagnostic.

Implementation:

- [x] Centralize remaining Fixes row link labels in the product copy helper.
- [x] Replace broken URL, suggested URL, source page, anchor text, and nothing urgent wording on the Fixes page.
- [x] Cover Fixes row link-label wording with unit tests.
- [x] Runtime-check Fixes row link-label calmness locally.
- [ ] Browser-check Fixes row link-label calmness after deployment.
- [x] Browser-check deployed Fix Center empty/check state: Nothing to check is visible and the old Nothing urgent, Broken URL, Suggested URL, and Anchor text labels are absent. The live account has no ready fix rows, so row-specific label rendering still needs a deployed data-backed check.

### Batch FJ: Rank Update Field Calmness

Competitive evidence:

- Semrush and Ahrefs keep rank, competitor, and provider detail available for teams that import search-position data.
- A beginner-first Rank Movement page should keep the same update fields while saying Google spot, other website, and where this came from before position, competitor domain, provider, or vendor examples.
- The product direction is to make adding a search-term update feel like a simple note, not a keyword-rank data import form.

Implementation:

- [x] Centralize Rank Movement update-field labels in the product copy helper.
- [x] Replace Position, Competitor domain, Provider, and vendor placeholder wording in the Rank Movement update forms.
- [x] Cover Rank Movement update-field wording with unit tests.
- [x] Runtime-check Rank Movement update-field calmness locally.
- [x] Browser-check Rank Movement update-field calmness after deployment.

### Batch FK: Page Detail This-Page Calmness

Competitive evidence:

- Semrush and Ahrefs keep URL-level page evidence available for audit review, but beginner users need the detail framed as the page they are improving.
- A beginner-first Page Detail view should say this page and helpful links before URL or internal-link terminology.
- The product direction is to make the page detail feel like a page-care guide, not a raw URL inspection view.

Implementation:

- [x] Centralize Page Detail intro and deeper-detail helper copy in the product copy helper.
- [x] Replace the Page Detail header phrase "on this URL" and internal-link helper wording with softer page language.
- [x] Cover Page Detail this-page wording with unit tests.
- [x] Runtime-check Page Detail this-page calmness locally.
- [x] Browser-check Page Detail this-page calmness after deployment.

### Batch FL: Report Branding Share-Link Calmness

Competitive evidence:

- Semrush and Ahrefs keep branded report delivery and white-label setup available for agencies, but the setup can feel like infrastructure work.
- A beginner-first Reports page should say branded share link, share link address, and setup values before white-label domain, hostname, or DNS verification language.
- The product direction is to make report branding feel like choosing a prettier client link, not configuring a technical domain.

Implementation:

- [x] Centralize Reports branded-link setup labels in the report copy helper.
- [x] Replace visible white-label domain, hostname, and DNS-verification helper wording in the Reports branding panel.
- [x] Cover Reports branded-link wording with unit tests.
- [x] Runtime-check Reports branded-link calmness locally.
- [x] Browser-check Reports branded-link calmness after deployment.

### Batch FM: Connected Fix-Note Calmness

Competitive evidence:

- Semrush and Ahrefs keep link-fix evidence exportable and automation-friendly for trained teams.
- A beginner-first connected handoff should preserve the exact fix payload while saying helpful page link and link that stopped working before broken internal link or internal-link task names.
- The product direction is to make connected fixes feel like calm editing notes, not technical link diagnostics.

Implementation:

- [x] Centralize connected link-fix summary wording in the product copy helper.
- [x] Replace automation payload and platform fix-note titles with softer link task language.
- [x] Cover connected link-fix summaries with unit tests.
- [x] Runtime-check connected link-fix calmness locally.
- [ ] Browser-check connected link-fix calmness after deployment.

### Batch FN: Problems Filter Area Calmness

Competitive evidence:

- Semrush and Ahrefs keep issue type and repeated-template filters available because trained teams need narrow audit triage.
- A beginner-first Problems filter should keep that narrowing power while saying problem area and repeated page patterns before type, broken internal link, or template jargon.
- The product direction is to make filtering feel like choosing the area to review, not classifying a technical audit issue.

Implementation:

- [x] Centralize Problems filter area label, helper, placeholder, and summary copy in the product copy helper.
- [x] Replace visible Problems filter type wording with problem-area language and page-link wording.
- [x] Cover Problems filter area wording with unit tests.
- [x] Runtime-check Problems filter area calmness locally.
- [x] Browser-check Problems filter label calmness after deployment: live Problems filters show "problem area" and "All problem areas" instead of the old type labels.
- [x] Browser-check live problem-area option data after issue-type display labels are softened; the live account now shows "Page link that needs help" and "Preferred page is not loading" instead of stored/generated options such as "Broken Internal Link."

### Batch FO: Websites Link-Health Helper Calmness

Competitive evidence:

- Semrush and Ahrefs keep link-health and crawlability signals visible in project tables for quick triage.
- A beginner-first Websites table should preserve that signal while saying page links and page-list gaps before internal-link problem wording.
- The product direction is to make the optional Websites table read like friendly website care detail, not a technical link audit.

Implementation:

- [x] Centralize the Websites table link-health helper in the product copy helper.
- [x] Replace the visible internal-link helper wording in the Websites table.
- [x] Cover the Websites link-health helper with unit tests.
- [x] Runtime-check Websites link-health helper calmness locally.
- [ ] Browser-check Websites link-health helper calmness after deployment.

### Batch FP: Exported Fix-Note Instruction Calmness

Competitive evidence:

- Semrush and Ahrefs keep fix exports and platform instructions useful for teams that send work to editors or developers.
- A beginner-first exported fix note should keep the exact URLs and snippets while saying note, page with the link, link that stopped working, and new website check before handoff, source page, broken URL, internal link, crawl, or issue status wording.
- The product direction is to make downloaded fix notes feel ready to share with a helper, not like a technical diagnostic brief.

Implementation:

- [x] Replace platform fix-note delivery modes, summaries, steps, and validation labels with softer note language.
- [x] Keep technical snippets available while softening surrounding instructions.
- [x] Cover exported fix-note instruction wording with unit tests.
- [x] Runtime-check exported fix-note instruction calmness locally.
- [ ] Browser-check exported fix-note instruction calmness after deployment.

### Batch FQ: Content Ideas Fallback Note Calmness

Competitive evidence:

- Semrush and Ahrefs keep schema, canonical, crawl, template-fix, and AI-assisted recommendation language useful for trained teams, but generated fallback text should still match the beginner-first tone when AI keys are unavailable.
- A beginner-first Content Ideas fallback should say helper fix note, website editor fix note, repeated-page fix note, page links, Google details, and new website check before developer brief, CMS brief, active issues, recrawl, canonical, robots, or internal-link wording.
- The product direction is to make generated ideas feel shareable and calm even when they come from local rules.

Implementation:

- [x] Soften deterministic page suggestion, issue fix-note, and repeated-page fix-note fallback wording.
- [x] Preserve useful implementation detail while translating labels and next checks into beginner-safe language.
- [x] Cover Content Ideas fallback note wording with unit tests.
- [x] Runtime-check Content Ideas fallback note calmness locally.
- [ ] Browser-check Content Ideas fallback note calmness after deployment.

### Batch FR: Page Detail Link-Words Calmness

Competitive evidence:

- Semrush and Ahrefs keep link text and link-detail evidence visible because trained teams need to inspect how pages connect.
- A beginner-first Page Detail view should preserve the same link evidence while saying visible link words and helpful links before anchor text or raw link-record language.
- The product direction is to make link detail feel like reviewing words a visitor can see, not auditing a technical link graph.

Implementation:

- [x] Centralize Page Detail missing-link-text and no-links empty states in the product copy helper.
- [x] Replace the visible "No anchor text" fallback and generic no-links empty state with softer page-care language.
- [x] Soften Page Detail page-change history from internal-link wording to helpful-link wording.
- [x] Cover Page Detail link-words wording with unit tests.
- [x] Runtime-check Page Detail link-words calmness locally.
- [x] Browser-check Page Detail link-words calmness after deployment.

### Batch FS: Problem Area Label Consistency

Competitive evidence:

- Semrush and Ahrefs keep issue category labels consistent across dashboards, audit lists, and page details so trained teams can move between views without relearning terms.
- A beginner-first product should keep that consistency while saying problem area, page link, page list, preferred page, and Google visibility before issue type, internal link, sitemap, canonical, or robots wording.
- The product direction is to make every problem list feel like the same calm website-care language, whether the user starts from a workspace, the Problems page, or a Page Detail view.

Implementation:

- [x] Centralize beginner-safe problem-area labels in the product copy helper.
- [x] Reuse the shared problem-area labels in the website workspace, Problems list, and Page Detail formatting.
- [x] Cover shared problem-area label wording with unit tests.
- [x] Runtime-check shared problem-area label calmness locally.
- [x] Browser-check shared problem-area label calmness after deployment.

### Batch FT: Search Ideas Content-Gap Link Hint Calmness

Competitive evidence:

- Semrush and Ahrefs keep internal-linking and content-gap workflows visible because trained teams use them to choose the next content improvement.
- A beginner-first Search Ideas workflow should preserve that recommendation while saying helpful page links before internal links or link-building terminology.
- The product direction is to make a content gap feel like an easy writing and page-improvement next step, not a technical SEO assignment.

Implementation:

- [x] Centralize the Search Ideas content-gap detail sentence in the product copy helper.
- [x] Replace the visible "internal links" phrase in the Search Ideas next-step card with "helpful page links."
- [x] Cover Search Ideas content-gap link wording with unit tests.
- [x] Runtime-check Search Ideas content-gap link wording locally.
- [ ] Browser-check Search Ideas content-gap link wording after deployment.

### Batch FU: Issue Solution Link-Note Calmness

Competitive evidence:

- Semrush Site Audit keeps broken-link reports detailed, including the pages where broken links appear and the returned status codes.
- Ahrefs Link Opportunities keeps source page, keyword context, and target page detail visible so trained teams can approve internal-link work.
- A beginner-first issue solution should preserve the same repair workflow while saying link that stopped working, page with the link, page to link to, and visible link words before broken internal link, source page, target page, anchor text, or Fix Center wording.

Implementation:

- [x] Soften broken-link and page-link issue solution titles, action labels, details, steps, and rationale.
- [x] Keep the Fixes workflow and exact repair intent intact while translating the visible handoff language.
- [x] Cover stopped-link and helpful-page-link issue solution wording with unit tests.
- [x] Runtime-check issue solution link-note calmness locally.
- [x] Browser-check issue solution link-note calmness after deployment.

### Batch FV: Report Branding Setup-State Calmness

Competitive evidence:

- Semrush and Ahrefs keep branded report sharing and custom report links available for agencies, but setup status should not lead with DNS or hostname troubleshooting language.
- A beginner-first report branding panel should preserve the exact setup values while saying setup name, setup value, waiting for setup, and needs setup help before TXT, DNS, or hostname wording.
- The product direction is to make branded report links feel like a small sharing setup task, not a domain-management chore.

Implementation:

- [x] Centralize branded-link setup status, setup-value labels, and check helper copy in the report copy helper.
- [x] Replace visible DNS/TXT/hostname status and helper wording in the Reports branded-link panel.
- [x] Cover branded-link setup-state wording with unit tests.
- [x] Runtime-check branded-link setup-state calmness locally.
- [ ] Browser-check branded-link setup-state calmness after deployment.

### Batch FW: Issue Solution Google-Settings Calmness

Competitive evidence:

- Ahrefs Site Audit surfaces structured-data, canonical, and noindex/indexability issues for trained teams that need precise technical diagnosis.
- Semrush Site Audit documents canonical checks and broader technical SEO checks such as robots, noindex, headings, and canonical problems.
- A beginner-first issue solution should preserve those exact repair paths while saying page details for Google, preferred page, and Google visibility before schema, canonical URL, indexability, noindex, or JSON-LD wording.

Implementation:

- [x] Soften issue solution titles, action labels, details, steps, and rationale for Google detail, preferred-page, and Google-visibility problems.
- [x] Soften stored Problems list/detail titles and descriptions for Google detail, preferred-page, and Google-visibility problems.
- [x] Soften local AI fix-note and page-idea wording away from SEO plugin, SEO panel, JSON-LD, and structured-data labels.
- [x] Keep the same website editor/site helper ownership and repair intent intact.
- [x] Cover Google detail, preferred-page, and Google-visibility solution wording with unit tests.
- [x] Runtime-check issue solution Google-settings calmness locally.
- [x] Browser-check Problems list/detail Google-settings calmness locally.
- [x] Browser-check deployed Problems list care-level calmness before opening the softened solution detail.
- [x] Browser-check issue solution Google-settings calmness after deployment.

### Batch FX: Content Ideas Local Recommendation Label Calmness

Competitive evidence:

- Semrush and Ahrefs teach page titles, meta descriptions, headings, and structured data as important content and search-result improvements for expert teams.
- A beginner-first Content Ideas fallback should preserve the same recommendation types while saying page title, page description, main heading, page content idea, website settings, and page details for Google before SEO title, meta description, H1, JSON-LD, structured data, SEO fields, or schema wording.
- The product direction is to make local fallback recommendations feel like simple page-improvement notes instead of technical SEO labels when AI output is unavailable.

Implementation:

- [x] Soften local page recommendation titles, Google-detail instructions, content-gap label, and issue/template CMS fallback instructions.
- [x] Preserve the same recommendation payload shape and technical intent for downstream consumers.
- [x] Cover local recommendation label calmness with unit tests.
- [x] Runtime-check local recommendation label calmness locally.
- [x] Browser-check local recommendation label calmness after deployment.

### Batch FY: Search Ideas Opportunity Reason Calmness

Competitive evidence:

- Ahrefs treats ranking positions just below the top results as practical low-hanging-fruit opportunities for trained teams.
- Semrush keeps internal linking as an expert optimization tactic for improving page performance.
- A beginner-first Search Ideas opportunity should preserve that same growth signal while saying helpful page links before internal links or link-building terminology.

Implementation:

- [x] Replace the Search Ideas opportunity reason phrase "internal links" with "helpful page links."
- [x] Cover the Search Ideas opportunity reason with a unit test.
- [x] Runtime-check Search Ideas opportunity reason calmness locally.
- [ ] Browser-check Search Ideas opportunity reason calmness after deployment.

### Batch FZ: Website Ownership Setup Calmness

Competitive evidence:

- Ahrefs ownership verification asks users to add a TXT record in domain DNS settings, which is precise but technical for first-time users.
- Semrush domain authentication similarly exposes DNS records and recommends forwarding setup instructions to a technical helper when needed.
- A beginner-first ownership screen should preserve the exact setup kind, name, and value while saying setup value, domain settings, and ownership check before DNS record, TXT value, host/name, or DNS troubleshooting language.

Implementation:

- [x] Centralize ownership setup helper, method, empty-state, and record-label wording in the product copy helper.
- [x] Replace visible ownership setup helper text and record labels on the website ownership screen with softer setup language.
- [x] Cover ownership setup wording with unit tests.
- [x] Runtime-check ownership setup wording locally.
- [x] Browser-check ownership setup wording after deployment.

### Batch GA: Link Update Handoff Calmness

Competitive evidence:

- Semrush Site Audit guidance keeps broken links, internal links, and technical on-page issues visible so trained teams can identify and replace problem URLs.
- Ahrefs Site Audit similarly lists pages that link to broken pages and treats internal links as an SEO structure/discovery lever.
- A beginner-first link update handoff should preserve exact source and destination URLs while saying link that stopped working, helpful page link, visible link words, and website check before broken internal link, anchor text, source page, recrawl, or link graph wording.

Implementation:

- [x] Soften link-update manual instructions for replacement and add-link workflows.
- [x] Soften link-fix lifecycle and verification messages away from crawl/source-page/link-graph language.
- [x] Preserve exact URL fields and automation payload structure for delivery workflows.
- [x] Cover link-update handoff wording with unit tests.
- [x] Runtime-check link-update handoff calmness locally.
- [ ] Browser-check link-update handoff calmness after deployment.

### Batch GB: Alert Message-Link Calmness

Competitive evidence:

- Semrush and Ahrefs-style monitoring tools keep alert destinations flexible for Slack, Teams, and webhook workflows used by trained teams.
- A beginner-first alert setup should preserve the same delivery power while saying message link and backup message link before webhook URL, incoming webhook, or raw Slack hook examples.
- The product direction is to make notifications feel like choosing where messages should arrive, not configuring an integration endpoint.

Implementation:

- [x] Centralize alert message-link labels and placeholders in the product copy helper.
- [x] Replace visible alert destination and backup URL labels with message-link wording.
- [x] Cover alert message-link wording with unit tests.
- [x] Runtime-check alert message-link calmness locally.
- [x] Browser-check alert message-link calmness locally.
- [x] Browser-check alert message-link calmness after deployment.

### Batch GC: Page Detail Google-Basics Calmness

Competitive evidence:

- Semrush Site Audit keeps page-level checks for title, meta description, headings, canonical status, robots/noindex rules, and crawlability visible for trained SEO teams.
- Ahrefs Site Audit similarly exposes canonical, indexability, headings, and page-link detail because technical users need exact diagnostics.
- A beginner-first page detail screen should preserve the same page evidence while saying Google result basics, Google description, Google visibility, preferred page, and website check before meta description, H1, robots, noindex, canonical, crawlability, or indexability wording.

Implementation:

- [x] Centralize Page Detail Google-basics labels and visibility states in the product copy helper.
- [x] Replace visible Page Detail basics and care-plan labels with softer Google-result wording.
- [x] Preserve the underlying page title, description, heading, preferred-page, and visibility values.
- [x] Cover Page Detail Google-basics wording with unit tests.
- [x] Runtime-check Page Detail Google-basics calmness locally.
- [x] Browser-check Page Detail Google-basics calmness locally.
- [x] Browser-check Page Detail Google-basics calmness after deployment.

### Batch GD: WordPress Update-Link Calmness

Competitive evidence:

- Semrush and Ahrefs-style integration flows commonly expose connector, API key, webhook, and technical setup language for trained teams.
- WordPress plugin setup still needs exact URLs and keys, but a beginner-first workflow should describe them as an update link, connection key, return link, and connection test before receiver endpoint, API key, callback URL, or Fix Center wording.
- The product direction is to make WordPress setup feel like copying a few safe connection values, not configuring a developer receiver.

Implementation:

- [x] Soften WordPress onboarding checklist labels and details away from receiver endpoint/API wording.
- [x] Soften WordPress install-value labels and helper text to update link, connection key, and return link.
- [x] Soften WordPress readiness messages to point users to Connections with connection language.
- [x] Preserve the exact update-link and key values needed by the plugin.
- [x] Cover WordPress update-link wording with unit tests.
- [x] Runtime-check WordPress update-link calmness locally.
- [x] Browser-check WordPress update-link calmness locally.
- [x] Browser-check WordPress update-link calmness after deployment.

### Batch GE: Workspace Stored Problem Title Calmness

Competitive evidence:

- Semrush and Ahrefs preserve raw audit issue names for trained users, including canonical and broken-link wording.
- A beginner-first website workspace should keep the same stored problem evidence while translating the first visible care-priority titles into page links, preferred pages, and Google visibility language.
- The product direction is to make the website workspace feel like a clear care list, not a technical audit export.

Implementation:

- [x] Add a shared stored-problem title softener for beginner-facing workspace lists.
- [x] Replace raw workspace care-priority titles with the softened display helper.
- [x] Cover broken-link, preferred-page, and Google-visibility stored titles with unit tests.
- [x] Runtime-check workspace stored problem title calmness locally.
- [x] Browser-check workspace stored problem title calmness after deployment.

### Batch GF: Ideas Fix-Note Stored Title Calmness

Competitive evidence:

- Semrush and Ahrefs recommendation areas keep raw audit issue names visible because trained users expect direct technical diagnostics.
- A beginner-first Ideas and Fixes page should keep the same problem links while translating stored fix-note titles into page-link, preferred-page, and Google-visibility language.
- The product direction is to make fix-note creation feel like choosing a clear next writing or repair task, not selecting from raw audit issue names.

Implementation:

- [x] Reuse the shared stored-problem title softener in the Ideas and Fixes fix-note list.
- [x] Runtime-check Ideas fix-note stored title calmness locally.
- [x] Browser-check Ideas fix-note stored title calmness after deployment.

### Batch GG: Saved Ideas Output Calmness

Competitive evidence:

- Semrush and Ahrefs keep saved recommendations in expert vocabulary such as schema, SEO title, CMS, sitemap, and internal-link graph.
- A beginner-first Ideas page should preserve old saved output while translating the displayed title, type, and summary into page title, Google details, website editor, page list, and helpful page links.
- The product direction is to make saved ideas feel reusable and readable, not like archived technical output.

Implementation:

- [x] Add a saved-recommendation display helper for title, summary, and type labels.
- [x] Use the helper in the Ideas and Fixes saved ideas list.
- [x] Cover old saved-output phrases with unit tests.
- [x] Runtime-check saved ideas output calmness locally.
- [x] Browser-check saved ideas output calmness after deployment.

### Batch GH: Page and Problem Detail Saved-Idea Calmness

Competitive evidence:

- Semrush and Ahrefs keep page and issue detail screens dense with audit labels, recommendation types, and stored technical output.
- A beginner-first detail workflow should preserve the same evidence while showing page titles, Google details, website editor notes, page lists, and helpful page links before raw stored wording.
- The product direction is to make detail pages feel like a guided care note for one page or problem, not a technical archive.

Implementation:

- [x] Reuse the shared stored-problem title softener on Page Detail problem rows and the focus plan.
- [x] Reuse the saved-recommendation display helper on Page Detail saved suggestions.
- [x] Reuse the saved-recommendation display helper on Problem Detail saved fix ideas.
- [x] Runtime-check Page and Problem Detail saved-idea calmness locally.
- [x] Browser-check Page Detail stored problem-title calmness after deployment.
- [x] Browser-check Problem Detail stored problem-title calmness after deployment.
- [ ] Browser-check Page and Problem Detail saved-idea calmness after deployment.

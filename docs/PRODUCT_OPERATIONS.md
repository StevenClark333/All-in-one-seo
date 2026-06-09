# Product Operations Source Of Truth

## Product Name And Public Copy

Working product name: **All In One Website Care**.

Verification TXT namespace: `allinone-seo-verification`.

Primary public positioning:

> Calm website care for businesses and agencies that need clear search-health guidance.

Short description:

> Connect your website, verify ownership, install one lightweight script, and follow search health, fixable problems, content ideas, reports, and important changes from one calm dashboard.

Agency offer:

> Manage every client website from one white-label website care dashboard with continuous checks, alerts, fix notes, and client-ready reporting.

## Final Pricing Tiers And Usage Limits

Pricing source of truth:

| Plan       |   Price | Domains |   Pages | Crawl frequency | AI recommendations | Seats | Reports | White-label |
| ---------- | ------: | ------: | ------: | --------------- | -----------------: | ----: | ------: | ----------- |
| Starter    |  $29/mo |       1 |     500 | Weekly          |             100/mo |     2 |    4/mo | No          |
| Growth     |  $99/mo |       5 |   5,000 | Daily           |             750/mo |     8 |   20/mo | No          |
| Agency     | $249/mo |      25 |  50,000 | Daily           |           3,000/mo |    20 |  100/mo | Yes         |
| Agency Pro | $599/mo |     100 | 250,000 | Daily           |          10,000/mo |    50 |  500/mo | Yes         |

Billing provider: Stripe.

Trial: 14 days on all plans.

## Private Beta Launch Criteria

- Signup, login, workspace, clients, domains, verification, crawls, issues, reports, alerts, billing, and integrations compile in production.
- `npm run check` passes.
- `npm run validate:production-env` passes in the production environment.
- `npm run security:audit` reports zero moderate-or-higher vulnerabilities.
- Database migrations are current.
- At least one seeded demo workspace is available.
- Health endpoint is monitored.
- Support contact path is live.
- Known beta limitations are listed in onboarding.

## Public Launch Criteria

- Private beta checklist is complete.
- Security and privacy reviews are complete.
- Billing test is complete in Stripe test mode and production mode.
- Onboarding, agency workflow, crawler reliability, reporting, and alerting tests are complete.
- Terms, Privacy Policy, DPA, and subprocessors pages are published.
- Backups and rollback process are documented.
- Production observability has uptime checks and error routing.

## Customer Onboarding Checklist

1. Create workspace.
2. Choose Business or Agency workspace type.
3. Invite teammates.
4. Add first client if agency.
5. Add domain.
6. Verify domain ownership by DNS TXT.
7. Install monitoring script.
8. Run first crawl.
9. Review critical issues.
10. Configure alert rules.
11. Connect Search Console or Analytics if available.
12. Generate first report.
13. Schedule recurring report.

## Support And Escalation Process

Support channels:

- In-app support link.
- Email support for all paid accounts.
- Priority support for Agency and Agency Pro.

Severity levels:

- P0: app unavailable, data exposure, billing outage.
- P1: crawl/report/alert pipeline outage affecting multiple customers.
- P2: single-customer workflow degradation.
- P3: usability question, feature request, or documentation gap.

Escalation targets:

- P0: immediate engineering owner and product owner notification.
- P1: same business day engineering triage.
- P2: next business day triage.
- P3: backlog or support response.

## Data Retention Policy

Default retention:

- HTML snapshot object storage: 90 days, configurable with `HTML_SNAPSHOT_RETENTION_DAYS`.
- Crawl metadata, issues, score history, and change events: retained while workspace is active.
- Script events: retain compact SEO payloads only; do not collect form, password, payment, or personal data.
- Audit logs: retain for the life of the workspace unless a legal/privacy deletion request applies.
- Deleted workspaces: queue hard deletion after account closure grace period.

Export and deletion:

- Workspace owners can request data export.
- Workspace owners can request deletion.
- Legal hold overrides deletion where required.

## Legal Pages Requirements

The launch site must include the following pages before public launch:

- Terms of Service.
- Privacy Policy.
- Data Processing Addendum.
- Subprocessors list.

Required legal coverage:

- Account ownership and acceptable use.
- Billing, renewal, cancellation, and refund terms.
- Data collected by crawler and website script.
- Data processing roles for customer website data.
- Security practices and incident notification.
- Third-party providers including hosting, database, email, AI, analytics, billing, and object storage.
- Customer deletion/export rights.

Legal language must be reviewed by qualified counsel before public launch.

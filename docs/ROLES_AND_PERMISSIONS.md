# Roles And Permissions

All In One SEO uses workspace roles for production access control. The seeded agency workspace uses human-readable role names so the team can understand who should have which level of access.

## Production Role Names

| Product Name  | System Role | Intended User                                | Permissions                                                                                                                                                  |
| ------------- | ----------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Product Owner | `OWNER`     | Founder or final account owner               | Full access to workspace, billing, team, clients, domains, crawls, issues, reports, alerts, and integrations. Cannot be removed or downgraded from Settings. |
| Agency Admin  | `ADMIN`     | Senior agency operator or operations manager | Can manage team access except the owner, plus clients, domains, crawls, issues, reports, alerts, and integrations.                                           |
| SEO Operator  | `MEMBER`    | SEO specialist or implementation teammate    | Can run SEO workflows, update issues, generate recommendations, and review reports. Cannot manage billing, seats, or workspace access.                       |
| Client Viewer | `VIEWER`    | Client, executive, or stakeholder            | Read-only access to dashboards, reports, issues, and site health. Cannot create, edit, delete, invite, crawl, or change workflow state.                      |

## Seeded Local Accounts

| Role          | Email                             | Password       |
| ------------- | --------------------------------- | -------------- |
| Product Owner | `keccc@gmail.com`                 | `KEman321!`    |
| Agency Admin  | `agency-admin@allinoneseo.local`  | `DemoPass123!` |
| SEO Operator  | `seo-operator@allinoneseo.local`  | `DemoPass123!` |
| Client Viewer | `client-viewer@allinoneseo.local` | `DemoPass123!` |

## Authorization Rules

- `OWNER` and `ADMIN` can manage workspace team access.
- `OWNER`, `ADMIN`, and `MEMBER` can perform SEO workflow actions.
- `VIEWER` can read workspace data but cannot mutate workflows.
- `OWNER` is intentionally protected from role changes and removal in Settings.

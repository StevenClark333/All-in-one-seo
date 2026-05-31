# Testing Strategy

This document defines the production testing strategy for All In One SEO Ops.
It maps directly to `PRODUCTION_TASK_LIST.md` and should be updated whenever a
new product surface is added.

## Component Tests

- Use focused React component tests for reusable dashboard surfaces: sidebar,
  tables, cards, empty states, forms, and status badges.
- Keep component tests data-driven. They should verify rendering, accessible
  names, disabled states, and important conditional branches.
- Do not duplicate full page integration tests at the component level.
- Prioritize components used in clients, domains, pages, issues, reports,
  alerts, integrations, and billing.

## Integration Tests

- Keep service tests under `tests/*.test.ts` using Node's built-in test runner.
- Cover database-backed workflows through isolated helper services where
  possible, and pure helpers where database setup would make the test brittle.
- Required workflow coverage:
  - workspace creation and workspace switching
  - client CRUD helpers and bulk import parsing
  - domain CRUD helpers, normalization, and bulk import parsing
  - domain verification attempts and retry policy
  - crawler parsing, security, rate/depth policy, robots, sitemap, and worker queue
  - SEO analyzer rules, change detection, scoring, reports, alerts, billing,
    integrations, and AI recommendation fallbacks

## End-To-End Tests

- Use Playwright for browser flows once the app is deployed to preview or run
  locally against a seeded database.
- First required flows:
  - sign up, create workspace, switch workspace
  - add client, edit client, archive client
  - add domain, edit settings, verify instructions, archive domain
  - run crawl for verified domain and review generated issues
  - generate AI recommendations and report
- E2E tests should run against a preview database, not production.

## Visual Regression

- Capture key dashboard screens at desktop and mobile widths:
  - overview
  - clients
  - domains
  - domain detail
  - pages
  - page detail
  - issues
  - recommendations
  - reports
  - settings
- Store approved screenshots in CI artifacts or the visual testing provider.
- Fail builds on meaningful layout regressions, broken responsive tables,
  missing navigation, overlapping controls, or unreadable text.

## Current Coverage

The current suite covers unit and service behavior for auth, workspaces,
clients, domains, verification, crawler policy, parser behavior, SEO analysis,
change detection, AI, reports, alerts, integrations, billing, security, and
performance policy. Browser E2E and visual regression should run against
preview deployments with seeded synthetic data after preview database
provisioning is connected.

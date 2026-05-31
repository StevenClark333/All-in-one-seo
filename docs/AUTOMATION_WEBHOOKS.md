# Zapier And Make Integration

Zapier and Make integrations let agencies send All In One SEO events into no-code workflows. The production slice stores validated catch-hook URLs for Zapier and Make, plus a standard event payload that can be used by issue, deployment, report, and client notification workflows.

## Zapier Setup

1. Create a Zap with **Webhooks by Zapier**.
2. Select **Catch Hook** or **Catch Raw Hook** as the trigger.
3. Copy the generated webhook URL.
4. Paste it into **Integrations > Zapier and Make** with provider `Zapier`.

## Make Setup

1. Create a Make scenario.
2. Add the **Webhooks > Custom webhook** module.
3. Copy the generated webhook URL.
4. Paste it into **Integrations > Zapier and Make** with provider `Make`.

## Validation

- Zapier URLs must use `hooks.zapier.com` or `zapier.com`.
- Make URLs must use `make.com` or a `*.make.com` host.
- All URLs must use HTTPS and pass the same private-network safety checks used by crawler and alert webhooks.

## Current Scope

- Store Zapier Catch Hook URLs.
- Store Make custom webhook URLs.
- Validate provider-specific hosts.
- Provide a standard All In One SEO event payload shape.

## Next Automation Work

- Add event subscription settings per workflow.
- Dispatch events for new issues, fixed issues, report publication, and deployment-triggered crawls.
- Add test-send action from the dashboard.

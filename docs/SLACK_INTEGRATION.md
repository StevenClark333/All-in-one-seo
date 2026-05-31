# Slack Integration

The Slack integration stores a workspace-level incoming webhook URL so alert rules can send SEO monitoring notifications to Slack without repeating the webhook on every rule.

## Setup

1. Create or open a Slack app.
2. Enable incoming webhooks.
3. Add a webhook to the workspace and choose the target channel.
4. Copy the webhook URL.
5. Paste it into **Integrations > Slack integration**.

## Behavior

- Slack webhook URLs must use `https://hooks.slack.com/services/...` or `https://hooks.slack-gov.com/services/...`.
- The stored webhook is used as a fallback when a Slack alert rule does not have its own target URL.
- Alert delivery still validates destination safety before posting.
- Payloads use Slack incoming webhook JSON with a `text` body.

## Current Scope

- Workspace-level Slack webhook storage.
- Slack integration dashboard form.
- Default Slack alert destination fallback.
- URL validation and config parsing tests.

## Next Slack Work

- OAuth install with the `incoming-webhook` scope.
- Channel picker through Slack OAuth.
- Test-message action from the integrations dashboard.
- Per-client Slack destinations.

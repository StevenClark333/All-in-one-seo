# Secret Operations

Use provider secret stores for production values. Do not commit generated
secrets, copied provider keys, or webhook signing secrets.

## Generate Internal Secrets

Generate an integration encryption key:

```bash
npm run secret:generate -- encryption hex
```

This produces a 64-character hex value compatible with
`INTEGRATION_ENCRYPTION_KEY`.

Generate a cron bearer token:

```bash
npm run secret:generate -- cron base64
```

Use the generated value for `CRON_SECRET` in hosting and GitHub Actions.

## Rotation Rules

- Rotate `CRON_SECRET` by updating hosting and GitHub Actions together, then
  confirming scheduled routes still accept authenticated calls.
- Rotate `STRIPE_WEBHOOK_SECRET` from the Stripe dashboard and update hosting
  before sending live traffic to the new webhook endpoint.
- Rotate OAuth client secrets from the provider dashboard and immediately test
  the provider reconnect flow.
- Rotate `INTEGRATION_ENCRYPTION_KEY` only with a planned migration that
  decrypts existing integration configs using the old key and re-encrypts them
  with the new key.
- Rotate `OPENAI_API_KEY`, `RESEND_API_KEY`, and object storage tokens from
  provider dashboards, then run the production preflight workflow.

## Validation

- `npm run validate:production-env` confirms required names are present.
- `npm run release:readiness` confirms launch docs and scripts stay wired.
- `SMOKE_TEST_TARGET_URL=<deployment-url> npm run smoke:test` confirms runtime
  reachability after deployment.

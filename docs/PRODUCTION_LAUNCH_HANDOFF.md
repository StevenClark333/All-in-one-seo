# Production Launch Handoff

Generate the latest launch handoff from the current codebase with:

```bash
npm run launch:handoff
```

Set `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SCRIPT_URL` first to render real
production URLs:

```bash
NEXT_PUBLIC_APP_URL=https://app.example.com NEXT_PUBLIC_SCRIPT_URL=https://cdn.example.com/seo.js npm run launch:handoff
```

The generated output includes:

- production-required environment variable names
- optional production environment variable names
- GitHub Actions secrets
- GitHub Actions variables
- OAuth callback URLs
- billing and deployment webhook URLs
- internal secret-generation commands

Use it as the copy-safe setup sheet while configuring Vercel, GitHub Actions,
Stripe, Google, Shopify, Webflow, object storage, and email providers. Do not
paste real secret values back into this repository.

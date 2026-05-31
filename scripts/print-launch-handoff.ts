import {
  optionalProductionEnvVars,
  productionRequiredEnvVars,
} from "@/lib/env";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://app.example.com";
const scriptUrl =
  process.env.NEXT_PUBLIC_SCRIPT_URL ?? `${appUrl.replace(/\/$/, "")}/seo.js`;

const githubSecrets = [
  "PRODUCTION_DATABASE_URL",
  "CRON_SECRET",
  "BLOB_READ_WRITE_TOKEN",
  "INTEGRATION_ENCRYPTION_KEY",
  "OPENAI_API_KEY",
  "ERROR_REPORTING_WEBHOOK_URL",
  "RESEND_API_KEY",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "WEBFLOW_CLIENT_ID",
  "WEBFLOW_CLIENT_SECRET",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
];

const githubVariables = [
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SCRIPT_URL",
  "AI_MODEL",
  "AI_MONTHLY_QUOTA",
  "ALERT_FROM_EMAIL",
  "SHOPIFY_SCOPES",
  "WEBFLOW_SCOPES",
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_GROWTH",
  "STRIPE_PRICE_AGENCY",
  "STRIPE_PRICE_AGENCY_PRO",
  "HTML_SNAPSHOT_RETENTION_DAYS",
  "SLOW_QUERY_THRESHOLD_MS",
  "SMOKE_TEST_TARGET_URL",
];

const oauthCallbacks = [
  "/api/integrations/google-search-console/callback",
  "/api/integrations/google-analytics/callback",
  "/api/integrations/shopify/callback",
  "/api/integrations/webflow/callback",
];

const webhookUrls = [
  "/api/billing/stripe/webhook",
  "/api/integrations/vercel/webhook",
  "/api/integrations/netlify/webhook",
];

const productionRequired = new Set<string>(productionRequiredEnvVars);
const optionalOnlyProductionEnvVars = optionalProductionEnvVars.filter(
  (key) => !productionRequired.has(key),
);

function absoluteUrl(path: string) {
  return new URL(path, appUrl).toString();
}

function renderList(values: readonly string[]) {
  return values.map((value) => `- \`${value}\``).join("\n");
}

const output = `# Production Launch Handoff

Generated from the current codebase. Replace example domains with provider
dashboard values during launch.

## App URLs

- App URL: \`${appUrl}\`
- Script URL: \`${scriptUrl}\`

## Production Required Environment Variables

${renderList(productionRequiredEnvVars)}

## Optional Production Environment Variables

${renderList(optionalOnlyProductionEnvVars)}

## GitHub Actions Secrets

${renderList(githubSecrets)}

## GitHub Actions Variables

${renderList(githubVariables)}

## OAuth Callback URLs

${oauthCallbacks.map((callback) => `- \`${absoluteUrl(callback)}\``).join("\n")}

## Webhook URLs

${webhookUrls.map((webhook) => `- \`${absoluteUrl(webhook)}\``).join("\n")}

## Secret Commands

\`\`\`bash
npm run secret:generate -- encryption hex
npm run secret:generate -- cron base64
\`\`\`
`;

console.log(output);

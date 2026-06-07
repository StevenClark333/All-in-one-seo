export const requiredEnvVars = ["DATABASE_URL"] as const;

export const productionRequiredEnvVars = [
  "DATABASE_URL",
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET",
  "BLOB_READ_WRITE_TOKEN",
  "INTEGRATION_ENCRYPTION_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_GROWTH",
  "STRIPE_PRICE_AGENCY",
  "STRIPE_PRICE_AGENCY_PRO",
] as const;

export const optionalProductionEnvVars = [
  "OPENAI_API_KEY",
  "AI_MODEL",
  "BLOB_READ_WRITE_TOKEN",
  "ERROR_REPORTING_WEBHOOK_URL",
  "RESEND_API_KEY",
  "ALERT_FROM_EMAIL",
  "CRON_SECRET",
  "INTEGRATION_ENCRYPTION_KEY",
  "NEXT_PUBLIC_SCRIPT_URL",
  "GOOGLE_CLIENT_ID",
  "GOOGLE_CLIENT_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "SHOPIFY_API_KEY",
  "SHOPIFY_API_SECRET",
  "SHOPIFY_SCOPES",
  "HTML_SNAPSHOT_RETENTION_DAYS",
  "SLOW_QUERY_THRESHOLD_MS",
  "WEBFLOW_CLIENT_ID",
  "WEBFLOW_CLIENT_SECRET",
  "WEBFLOW_SCOPES",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_STARTER",
  "STRIPE_PRICE_GROWTH",
  "STRIPE_PRICE_AGENCY",
  "STRIPE_PRICE_AGENCY_PRO",
  "LOAD_TEST_TARGET_URL",
  "LOAD_TEST_TARGET",
  "LOAD_TEST_REQUESTS",
  "LOAD_TEST_CONCURRENCY",
  "LOAD_TEST_SITE_ID",
  "SMOKE_TEST_TARGET_URL",
  "KEYWORD_PROVIDER_NAME",
  "KEYWORD_PROVIDER_WEBHOOK_SECRET",
  "KEYWORD_IMPORT_DEMO_MODE",
] as const;

export function validateEnv(
  env: Record<string, string | undefined> = process.env,
) {
  const missing = requiredEnvVars.filter((key) => !env[key]);

  if (missing.length) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    required: requiredEnvVars,
    optionalProduction: optionalProductionEnvVars,
  };
}

export function validateProductionEnv(
  env: Record<string, string | undefined> = process.env,
) {
  const missing = productionRequiredEnvVars.filter((key) => !env[key]);
  const productionRequired = new Set<string>(productionRequiredEnvVars);

  if (missing.length) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(", ")}`,
    );
  }

  return {
    optionalProduction: optionalProductionEnvVars.filter(
      (key) => !productionRequired.has(key),
    ),
    required: productionRequiredEnvVars,
  };
}

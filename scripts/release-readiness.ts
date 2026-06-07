import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import {
  optionalProductionEnvVars,
  productionRequiredEnvVars,
} from "@/lib/env";

type Check = {
  details?: string;
  name: string;
  passed: boolean;
};

const root = process.cwd();

function readText(relativePath: string) {
  return readFileSync(path.join(root, relativePath), "utf8");
}

function fileExists(relativePath: string) {
  return existsSync(path.join(root, relativePath));
}

function includesAll(source: string, values: string[]) {
  const missing = values.filter((value) => !source.includes(value));

  return {
    missing,
    passed: missing.length === 0,
  };
}

function checkPackageScripts(): Check {
  const packageJson = JSON.parse(readText("package.json")) as {
    scripts?: Record<string, string>;
  };
  const requiredScripts = [
    "check",
    "db:migrate:deploy",
    "launch:handoff",
    "security:audit",
    "secret:generate",
    "smoke:test",
    "validate:production-env",
    "verify:e2e:ready",
  ];
  const missing = requiredScripts.filter(
    (script) => !packageJson.scripts?.[script],
  );

  return {
    details: missing.length
      ? `Missing scripts: ${missing.join(", ")}`
      : undefined,
    name: "package release scripts",
    passed: missing.length === 0,
  };
}

function checkCronRoutes(): Check {
  const vercelConfig = JSON.parse(readText("vercel.json")) as {
    crons?: Array<{ path?: string; schedule?: string }>;
  };
  const missingRoutes = (vercelConfig.crons ?? [])
    .filter((cron) => cron.path)
    .filter((cron) => {
      const routePath = path.join(
        "src",
        "app",
        cron.path!.replace(/^\//, ""),
        "route.ts",
      );

      return !fileExists(routePath);
    })
    .map((cron) => cron.path);

  return {
    details: missingRoutes.length
      ? `Missing cron route files: ${missingRoutes.join(", ")}`
      : undefined,
    name: "vercel cron routes",
    passed: missingRoutes.length === 0,
  };
}

function checkProductionWorkflow(): Check {
  const workflow = readText(".github/workflows/production-preflight.yml");
  const requiredSteps = [
    "Validate production environment",
    "Check migration status",
    "Build",
    "Smoke test configured app URL",
    "Security audit",
  ];
  const { missing, passed } = includesAll(workflow, requiredSteps);

  return {
    details: missing.length
      ? `Missing workflow steps: ${missing.join(", ")}`
      : undefined,
    name: "production preflight workflow",
    passed,
  };
}

function checkReleaseDocs(): Check {
  const docs = [
    "docs/DEPLOYMENT.md",
    "docs/ENVIRONMENT_MATRIX.md",
    "docs/LAUNCH_READINESS.md",
    "docs/PROVIDER_LAUNCH_CHECKLIST.md",
    "docs/PRODUCTION_LAUNCH_HANDOFF.md",
    "docs/SECRET_OPERATIONS.md",
  ]
    .map(readText)
    .join("\n");
  const requiredPhrases = [
    "npm run validate:production-env",
    "npm run smoke:test",
    "npm run db:migrate:deploy",
    "Production Preflight",
    "PRODUCTION_DATABASE_URL",
    "npm run secret:generate",
    "npm run launch:handoff",
    "CRON_SECRET",
    "STRIPE_WEBHOOK_SECRET",
    "KEYWORD_PROVIDER_WEBHOOK_SECRET",
  ];
  const { missing, passed } = includesAll(docs, requiredPhrases);

  return {
    details: missing.length
      ? `Missing release doc phrases: ${missing.join(", ")}`
      : undefined,
    name: "release documentation",
    passed,
  };
}

function checkEnvExample(): Check {
  const envExample = readText(".env.example");
  const requiredVars = [
    ...productionRequiredEnvVars,
    ...optionalProductionEnvVars,
  ];
  const missing = requiredVars.filter((key) => !envExample.includes(`${key}=`));

  return {
    details: missing.length
      ? `Missing .env.example variables: ${missing.join(", ")}`
      : undefined,
    name: "environment example coverage",
    passed: missing.length === 0,
  };
}

function checkTaskList(): Check {
  const taskList = readText("PRODUCTION_TASK_LIST.md");
  const openItems = taskList
    .split(/\r?\n/)
    .filter((line) => /^- \[ \]/.test(line));

  return {
    details: openItems.length
      ? `Open tasks: ${openItems.join(" | ")}`
      : undefined,
    name: "source-of-truth checklist",
    passed: openItems.length === 0,
  };
}

const checks: Check[] = [
  checkPackageScripts(),
  checkCronRoutes(),
  checkProductionWorkflow(),
  checkReleaseDocs(),
  checkEnvExample(),
  checkTaskList(),
];

console.log(JSON.stringify({ checks }, null, 2));

const failed = checks.filter((check) => !check.passed);

if (failed.length) {
  console.error(
    `Release readiness failed: ${failed.map((check) => check.name).join(", ")}`,
  );
  process.exitCode = 1;
}

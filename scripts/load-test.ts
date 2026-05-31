import {
  calculatePercentile,
  isWithinBudget,
  performanceBudgets,
} from "../src/lib/performance-budgets";

type LoadTarget = "health" | "ingestion";

const targetUrl = process.env.LOAD_TEST_TARGET_URL ?? "http://127.0.0.1:3002";
const target = (process.env.LOAD_TEST_TARGET ?? "health") as LoadTarget;
const requests = readPositiveInteger("LOAD_TEST_REQUESTS", 25);
const concurrency = readPositiveInteger("LOAD_TEST_CONCURRENCY", 5);

async function main() {
  const durations: number[] = [];
  let failures = 0;
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < requests) {
      nextIndex += 1;
      const startedAt = performance.now();
      const ok = await runRequest(target);
      durations.push(Math.round(performance.now() - startedAt));

      if (!ok) {
        failures += 1;
      }
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, requests) }, () => worker()),
  );

  const p95 = calculatePercentile(durations, 95);
  const budget =
    target === "ingestion"
      ? performanceBudgets.ingestionP95Ms
      : performanceBudgets.apiHealthP95Ms;
  const passed = failures === 0 && isWithinBudget(p95, budget);

  console.log(
    JSON.stringify(
      {
        budgetMs: budget,
        failures,
        passed,
        p95Ms: p95,
        requests,
        target,
      },
      null,
      2,
    ),
  );

  if (!passed) {
    process.exitCode = 1;
  }
}

async function runRequest(targetName: LoadTarget) {
  if (targetName === "ingestion") {
    return runIngestionRequest();
  }

  const response = await fetch(new URL("/api/health", targetUrl));
  return response.ok;
}

async function runIngestionRequest() {
  const siteId = process.env.LOAD_TEST_SITE_ID;

  if (!siteId) {
    throw new Error("LOAD_TEST_SITE_ID is required for ingestion load tests.");
  }

  const response = await fetch(new URL("/api/ingest/script-event", targetUrl), {
    body: JSON.stringify({
      eventType: "page_view",
      pageUrl: `${targetUrl}/load-test`,
      payload: {
        observedAt: new Date().toISOString(),
        title: "Load test page",
        url: `${targetUrl}/load-test`,
      },
      siteId,
    }),
    headers: {
      "Content-Type": "application/json",
      Origin: targetUrl,
    },
    method: "POST",
  });

  return response.ok;
}

function readPositiveInteger(name: string, fallback: number) {
  const value = Number(process.env[name]);

  if (Number.isInteger(value) && value > 0) {
    return value;
  }

  return fallback;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

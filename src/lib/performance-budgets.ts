export const performanceBudgets = {
  apiHealthP95Ms: 300,
  crawlerHomepageTimeoutMs: 15_000,
  dashboardP95Ms: 1_000,
  ingestionP95Ms: 250,
  maxScriptPayloadBytes: 16_384,
  slowQueryMs: 500,
} as const;

export function isWithinBudget(value: number, budget: number) {
  return Number.isFinite(value) && value <= budget;
}

export function calculatePercentile(values: number[], percentile: number) {
  if (!values.length) {
    return 0;
  }

  const sorted = [...values].sort((left, right) => left - right);
  const index = Math.min(
    sorted.length - 1,
    Math.ceil((percentile / 100) * sorted.length) - 1,
  );

  return sorted[index];
}

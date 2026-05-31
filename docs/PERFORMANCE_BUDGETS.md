# Performance Budgets

Production budgets live in `src/lib/performance-budgets.ts`.

## Current Budgets

- Dashboard routes p95: `1000ms`
- Health endpoint p95: `300ms`
- Script ingestion p95: `250ms`
- Slow database query warning: `500ms`
- Homepage crawler timeout: `15000ms`
- Script ingestion payload limit: `16384` bytes

## Load Testing

Run health endpoint load checks:

```bash
npm run perf:load
```

Run script ingestion load checks against a verified site/domain ID:

```bash
LOAD_TEST_TARGET=ingestion LOAD_TEST_SITE_ID=<domain-id> npm run perf:load
```

Optional controls:

- `LOAD_TEST_TARGET_URL`, default `http://127.0.0.1:3002`
- `LOAD_TEST_REQUESTS`, default `25`
- `LOAD_TEST_CONCURRENCY`, default `5`

Crawler load testing should use production-like queued crawl runs and monitor worker throughput against the homepage timeout and worker concurrency settings.

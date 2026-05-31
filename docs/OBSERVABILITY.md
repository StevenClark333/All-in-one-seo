# Observability

## Uptime Checks

Monitor `GET /api/health` from the production region and at least one external region.

Healthy response:

```json
{
  "ok": true,
  "database": "ok",
  "latencyMs": 12
}
```

Alert when:

- response status is not `200`
- `ok` is not `true`
- latency exceeds the agreed production budget

## Error Tracking

Set `ERROR_REPORTING_WEBHOOK_URL` to forward normalized error events to an external incident or error tracking provider.

The first reporting sources are:

- health check database failures
- scheduled alert evaluation failures
- scheduled report generation failures
- snapshot cleanup failures

All errors are also written to structured production logs.

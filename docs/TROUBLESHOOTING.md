# Troubleshooting

## Prisma Client Is Locked On Windows

If `prisma generate` fails with an `EPERM` rename error, stop the local Next.js production server and rerun:

```powershell
Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*next*start*--hostname*127.0.0.1*--port*3002*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
npx prisma generate
```

## Protected Routes Redirect To Login

This is expected when no `aio_seo_session` cookie is present. Use `/signup` or `/login`.

## Domain Verification Fails

- Confirm the TXT value exactly matches `allinone-seo-verification=<token>`.
- DNS propagation can take time.
- Confirm the TXT record is on the root domain unless the UI later supports subdomain-specific verification.

## Crawl Fails Immediately

- Domain must be verified.
- `robots.txt` may block the homepage.
- The crawler blocks private/internal IP addresses by design.
- Some sites block unknown bots or require additional user-agent handling.

## Alerts Are Marked Failed

Email alerts require:

- `RESEND_API_KEY`
- `ALERT_FROM_EMAIL`
- At least one workspace member email

Without those values, the alert delivery is recorded as failed so the dashboard stays honest.

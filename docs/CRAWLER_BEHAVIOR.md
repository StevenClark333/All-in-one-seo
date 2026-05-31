# Crawler Behavior

The crawler runs through manual actions, scheduled crawl enqueue jobs, and the crawl worker queue. It currently processes verified domain homepages and records discovered internal links for graph analysis.

## Safety Rules

- Only HTTP and HTTPS URLs are allowed.
- URLs with credentials are rejected.
- DNS is resolved before fetching.
- Private and internal IP ranges are blocked.
- Redirect destinations are validated after fetch.
- A crawler user agent is sent with requests.

## Crawl Flow

1. Verify the domain is marked `VERIFIED`.
2. Fetch and store `robots.txt`.
3. Respect homepage robots blocking.
4. Fetch and store discovered sitemaps plus `/sitemap.xml`.
5. Fetch homepage HTML.
6. Extract title, meta description, H1, canonical, robots directive, headings, image alt coverage, schema count, word count, and internal links.
7. Store raw HTML in object storage and persist the snapshot object key.
8. Store a page snapshot.
9. Run analyzer rules.
10. Detect changes against the previous snapshot.
11. Persist internal links and broken internal link issues.
12. Recalculate site score.

## Current Limits

- Homepage crawl only.
- Up to 50 internal links are status-checked from the homepage.
- Up to 5 sitemaps are fetched.
- Up to 250 internal links are extracted from the rendered HTML.
- Crawl runs are queued in `worker_jobs` for scheduled processing.
- Domains are rate-limited between crawl runs.
- Discovered link persistence is depth-limited by crawler policy.
- Raw HTML snapshots are stored in Vercel Blob when `BLOB_READ_WRITE_TOKEN` is set, with a local `.storage/html-snapshots` fallback for development.
- `/api/jobs/cleanup-snapshots` clears snapshot object references older than `HTML_SNAPSHOT_RETENTION_DAYS`, defaulting to 90 days.

## Worker Boundary

The queue-backed worker boundary is implemented through:

- `/api/jobs/enqueue-scheduled-crawls`
- `/api/jobs/process-crawl-queue`
- `src/lib/worker-queue.ts`
- `src/lib/crawler-scheduling.ts`

Manual crawls still create the crawl run from the dashboard action, while scheduled crawls enqueue work for the worker endpoint.

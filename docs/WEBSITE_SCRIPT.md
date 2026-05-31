# Website Script

The website script captures rendered SEO observations from verified customer sites. It is optional for crawler-first monitoring, but it enables SPA route monitoring, Core Web Vitals, and client-rendered SEO checks.

## Install

Add this tag before the closing `head` tag:

```html
<script
  async
  src="https://app.example.com/seo.js"
  data-site-id="DOMAIN_ID"
></script>
```

For production, set `NEXT_PUBLIC_SCRIPT_URL` to the CDN URL that serves `/seo.js`.

## Captured Data

The script sends:

- Page URL with query string and hash removed.
- Document title.
- Meta description.
- Canonical URL.
- Robots meta tag.
- H1 and H2 text snippets.
- JSON-LD schema count.
- Link count.
- Core Web Vitals observations when available.
- SPA route changes through `history.pushState`, `history.replaceState`, and `popstate`.

## Privacy Controls

The script does not read form fields, password fields, payment inputs, cookies, local storage, full DOM HTML, or session recordings.

The ingestion API stores only allowlisted SEO fields. It strips query strings and hash fragments from observed URLs, limits payload size, validates the site ID, checks the request origin against the configured domain, and applies an in-memory per-site rate limit.

## Ingestion Endpoint

`POST /api/ingest/script-event`

Expected payload:

```json
{
  "siteId": "DOMAIN_ID",
  "eventType": "page_view",
  "pageUrl": "https://example.com/pricing",
  "payload": {
    "url": "https://example.com/pricing",
    "title": "Pricing",
    "metaDescription": "Plans for every team.",
    "canonical": "https://example.com/pricing",
    "robots": "index,follow",
    "headings": { "h1": ["Pricing"], "h2": ["Starter", "Growth"] },
    "schemaCount": 1,
    "linkCount": 42,
    "webVitals": { "lcp": 1200, "cls": 0.02 },
    "observedAt": "2026-05-29T00:00:00.000Z"
  }
}
```

Allowed event types:

- `page_view`
- `route_change`
- `web_vital`

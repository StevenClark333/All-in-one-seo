# All In One SEO WordPress Plugin

This plugin installs the All In One SEO browser monitoring script on public WordPress pages and receives approved link-fix tasks from the All In One SEO portal. It is intended for agencies and site owners who want WordPress domains to report rendered SEO observations and review fixes without editing theme files.

## Install

1. Copy the `all-in-one-seo` folder into `wp-content/plugins/`.
2. Activate **All In One SEO** in WordPress admin.
3. Open **Settings > All In One SEO**.
4. Enter the All In One SEO app URL that serves `/seo.js`.
5. Enter the domain Site ID from the All In One SEO domain install panel.
6. Enter a long Receiver API key.
7. Save settings.

## Fix Receiver

The plugin displays a receiver endpoint in **Settings > All In One SEO**:

```txt
/wp-json/all-in-one-seo/v1/link-fixes
```

Copy that endpoint and the Receiver API key into the matching WordPress domain in the All In One SEO Integrations page. Approved Fix Center tasks can then be sent to WordPress and reviewed under **Received fix tasks**.

## Behavior

- Uses the WordPress Settings API for configuration.
- Enqueues the script on public pages with `wp_enqueue_scripts`.
- Adds the required `data-site-id` attribute through `script_loader_tag`.
- Registers a REST endpoint for approved link-fix payloads.
- Requires the `X-All-In-One-SEO-Key` header for fix receiver requests.
- Stores received fixes for admin review instead of automatically editing content.
- Skips WordPress admin pages.
- Does not read form fields, cookies, local storage, or full page HTML.

## Required Values

- App URL: for example `https://app.example.com`
- Site ID: the domain ID shown in All In One SEO

The rendered tag is:

```html
<script
  async
  src="https://app.example.com/seo.js"
  data-site-id="DOMAIN_ID"
></script>
```

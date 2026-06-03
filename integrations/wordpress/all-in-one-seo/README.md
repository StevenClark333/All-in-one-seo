# All In One SEO WordPress Plugin

This plugin installs the All In One SEO browser monitoring script on public WordPress pages and receives approved link-fix tasks from the All In One SEO portal. It is intended for agencies and site owners who want WordPress domains to report rendered SEO observations and review fixes without editing theme files.

## Install

1. Download `all-in-one-seo-wordpress.zip` from **Integrations > WordPress plugin** in All In One SEO.
2. In WordPress admin, open **Plugins > Add Plugin > Upload Plugin**.
3. Upload the ZIP and activate **All In One SEO**.
4. Open **Settings > All In One SEO**.
5. Enter the All In One SEO app URL that serves `/seo.js`.
6. Enter the domain Site ID from the All In One SEO domain install panel.
7. In All In One SEO, save the receiver endpoint for this WordPress domain. Leave the Receiver API key blank to let the portal generate one.
8. Copy the generated Receiver API key from All In One SEO into this plugin.
9. Click **Test receiver** in All In One SEO to confirm the endpoint and key are accepted.
10. Save settings.

Manual install is also supported by copying the `all-in-one-seo` folder into `wp-content/plugins/`.

## Fix Receiver

The plugin displays a receiver endpoint in **Settings > All In One SEO**:

```txt
/wp-json/all-in-one-seo/v1/link-fixes
```

Copy that endpoint into the matching WordPress domain in the All In One SEO Integrations page. The portal can generate the Receiver API key for you; paste the generated value back into this plugin. Approved Fix Center tasks can then be sent to WordPress and reviewed under **Received fix tasks**.

The receiver accepts signed test events from the All In One SEO portal. Test events validate the endpoint and Receiver API key without creating a fix task.

The All In One SEO Integrations page also shows a setup checklist for each WordPress domain. Fix delivery is ready when the script is detected, the endpoint is saved, the key is generated, and the receiver test passes. Fix Center only lists WordPress receivers after the receiver test passes; if a receiver exists but is not ready, Fix Center explains why WordPress is missing and links back to Integrations.

Broken internal-link replacements can be applied from the WordPress settings screen when the source URL maps to an editable post and the exact broken URL exists in post content.

Contextual internal-link opportunities can also be applied from the settings screen. The plugin finds the first matching anchor text outside existing links and HTML tags, then wraps it with the suggested internal link. If the suggested URL already exists in the post, the task is treated as applied.

When a fix is applied, WordPress reports the status back to All In One SEO so the portal can mark the fix applied and queue a verification crawl.

## Behavior

- Uses the WordPress Settings API for configuration.
- Enqueues the script on public pages with `wp_enqueue_scripts`.
- Adds the required `data-site-id` attribute through `script_loader_tag`.
- Registers a REST endpoint for approved link-fix payloads.
- Requires the `X-All-In-One-SEO-Key` header for fix receiver requests.
- Stores received fixes for admin review instead of automatically editing content.
- Applies exact broken-link replacements only after an administrator clicks **Apply replacement**.
- Applies contextual internal-link insertions only after an administrator clicks **Add internal link**.
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

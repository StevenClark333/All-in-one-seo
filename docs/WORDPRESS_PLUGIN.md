# WordPress Plugin

The WordPress plugin is the first CMS integration package for All In One SEO. It gives agencies a repeatable install path for WordPress client sites without requiring theme edits, and it can receive approved link-fix tasks from the portal for admin review.

## Location

Plugin source:

```txt
integrations/wordpress/all-in-one-seo/
```

## Installation

1. Copy `integrations/wordpress/all-in-one-seo` to `wp-content/plugins/all-in-one-seo`.
2. Activate **All In One SEO** in WordPress admin.
3. Open **Settings > All In One SEO**.
4. Set the All In One SEO app URL, for example `https://app.example.com`.
5. Set the domain Site ID from the All In One SEO domain install panel.
6. Add a long Receiver API key.
7. Save settings and visit a public page.

## Fix Receiver

The plugin exposes a WordPress REST endpoint:

```txt
/wp-json/all-in-one-seo/v1/link-fixes
```

In **All In One SEO > Integrations > WordPress plugin**, save this endpoint and the same Receiver API key for the matching domain. Fix Center can then send approved link fixes directly into WordPress.

Incoming requests must:

- Use `POST`.
- Send JSON with a `linkFix` object.
- Include the API key in the `X-All-In-One-SEO-Key` header.

Received fixes are stored in the WordPress option `all_in_one_seo_fix_queue` and displayed under **Settings > All In One SEO > Received fix tasks**. Administrators can mark each task reviewed.

For broken internal-link replacements, administrators can click **Apply replacement**. The plugin resolves the source URL to a WordPress post with `url_to_postid`, checks edit permissions, and replaces the exact broken URL in `post_content` with the suggested URL.

For contextual internal-link opportunities, administrators can click **Add internal link**. The plugin resolves the source URL to an editable post, finds the first matching anchor-text occurrence outside existing links and HTML tags, and wraps it with the suggested internal link. If the suggested URL is already present, the task is treated as applied so the portal can verify it on the next crawl.

After a successful apply, the plugin posts status back to All In One SEO with the same `X-All-In-One-SEO-Key`. The portal marks the fix `APPLIED` and queues a system crawl so the next crawl can confirm the broken-link issue is gone or the suggested internal link is present.

## Production Packaging

Before distribution, package the folder as `all-in-one-seo.zip` and publish it through the customer dashboard or agency onboarding flow. The plugin is intentionally small so agencies can install it manually, via SFTP, or through WordPress admin upload.

## Security And Privacy

- Settings are restricted to administrators with `manage_options`.
- Settings values are sanitized before storage and escaped before output.
- Fix receiver requests require the configured `X-All-In-One-SEO-Key` header.
- Received fix task fields are sanitized before storage and escaped before admin output.
- Applying a fix requires `edit_posts`, then `edit_post` permission for the matched source post.
- Automatic replacement only performs exact URL replacement in `post_content`.
- Automatic contextual insertion only links the first matching anchor text outside existing links and HTML tags.
- The script is not loaded in WordPress admin.
- The browser script only sends the allowlisted SEO fields documented in `docs/WEBSITE_SCRIPT.md`.
- No cookies, form values, local storage, payment fields, or full DOM HTML are collected.

## Operational Checklist

- Confirm the domain is verified in All In One SEO.
- Confirm the Site ID matches the domain ID.
- Confirm the app URL serves `/seo.js`.
- Confirm the receiver endpoint and API key are saved in the portal.
- Send a test Fix Center payload and confirm it appears in **Received fix tasks**.
- Apply a replacement or contextual-link task and confirm Fix Center moves it to verification pending.
- Visit a public page and check that the domain script status changes to `DETECTED`.

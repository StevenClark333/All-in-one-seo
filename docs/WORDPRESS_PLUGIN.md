# WordPress Plugin

The WordPress plugin is the first CMS integration package for All In One SEO. It gives agencies a repeatable install path for WordPress client sites without requiring theme edits.

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
6. Save settings and visit a public page.

## Production Packaging

Before distribution, package the folder as `all-in-one-seo.zip` and publish it through the customer dashboard or agency onboarding flow. The plugin is intentionally small so agencies can install it manually, via SFTP, or through WordPress admin upload.

## Security And Privacy

- Settings are restricted to administrators with `manage_options`.
- Settings values are sanitized before storage and escaped before output.
- The script is not loaded in WordPress admin.
- The browser script only sends the allowlisted SEO fields documented in `docs/WEBSITE_SCRIPT.md`.
- No cookies, form values, local storage, payment fields, or full DOM HTML are collected.

## Operational Checklist

- Confirm the domain is verified in All In One SEO.
- Confirm the Site ID matches the domain ID.
- Confirm the app URL serves `/seo.js`.
- Visit a public page and check that the domain script status changes to `DETECTED`.

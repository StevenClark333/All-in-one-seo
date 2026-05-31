# Domain Verification

Domains are verified with DNS TXT records.

## TXT Record

Record name:

```txt
@
```

Record value:

```txt
allinone-seo-verification=<token>
```

The token is generated per domain verification request and expires after 14 days.

## Verification Flow

1. User adds a domain.
2. The app creates a pending DNS TXT verification token.
3. User adds the TXT record at their DNS provider.
4. User runs verification from the domain verification screen.
5. The backend resolves TXT records for the domain.
6. If the expected value is found, the verification and domain are marked `VERIFIED`.
7. If the value is missing, the verification and domain are marked `FAILED`.

## Future Methods

- HTML file upload.
- Meta tag verification.
- Google Search Console OAuth.

# Authentication

## Email Verification

Signup creates an `EMAIL_VERIFICATION` token in `auth_tokens`.

Verification URL pattern:

```txt
/verify-email?token=<token>
```

Completing verification sets `users.emailVerifiedAt`.

## Password Reset

Users request reset from `/password-reset`.

Reset URL pattern:

```txt
/password-reset/confirm?token=<token>
```

Completing reset consumes the token, updates the password hash, clears failed login counters, and clears lockout state.

## Abuse Protection

- Signup, login, and password reset requests use per-email in-memory rate limits.
- Failed password attempts increment `users.failedLoginCount`.
- Five failed attempts locks the account for 15 minutes.
- Successful login clears failed count and lockout state.

## Local Seeded Accounts

Running `npm run db:seed` creates the production-style demo accounts listed in `docs/ROLES_AND_PERMISSIONS.md`, including the Product Owner account `keccc@gmail.com`.

## Future SSO Path

The product should add SSO at the workspace level after public launch readiness:

- SAML/OIDC provider configuration per workspace.
- Required SSO toggle for Agency Pro or Enterprise workspaces.
- Domain-based discovery by email domain.
- SCIM user provisioning later if enterprise demand requires it.

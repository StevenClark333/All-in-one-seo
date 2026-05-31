# All In One SEO

Agency-ready continuous SEO monitoring SaaS.

## Source Of Truth

`PRODUCT_REQUIREMENTS.md` is the product source of truth. Implementation maps back to the MVP boundary and complete SaaS roadmap defined there.

`PRODUCTION_TASK_LIST.md` is the execution source of truth. The production checklist is complete; use it for verification, release review, and future scope changes.

## Current State

The project is a Next.js App Router application with:

- TypeScript
- Tailwind CSS
- ESLint
- Geist font setup
- Agency and business dashboard flows
- Product requirements route at `/product-requirements`
- Production task list route at `/production-task-list`
- Prisma/PostgreSQL schema for the production SaaS model
- Database-backed dashboard reads with empty, loading, and error states
- Domain verification, crawler queue, rendered crawl foundations, SEO analyzer rules, AI recommendations, reporting, alerts, billing, integrations, and launch-readiness documentation

## Run Locally

Copy the example environment file and set `DATABASE_URL`:

```bash
cp .env.example .env
```

Start Postgres with Docker:

```bash
docker compose up -d
```

Create the database schema and seed the first agency workspace:

```bash
npm run db:migrate
npm run db:seed
```

Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Seeded Access

The local seed creates one production-style agency workspace:

- Workspace: `All In One SEO Agency`
- Product Owner: `keccc@gmail.com` / `KEman321!`
- Agency Admin: `agency-admin@allinoneseo.local` / `DemoPass123!`
- SEO Operator: `seo-operator@allinoneseo.local` / `DemoPass123!`
- Client Viewer: `client-viewer@allinoneseo.local` / `DemoPass123!`

Role meanings are documented in [docs/ROLES_AND_PERMISSIONS.md](docs/ROLES_AND_PERMISSIONS.md).

## Useful Commands

```bash
npm run check
npm run validate:env
npm run lint
npm run typecheck
npm run test
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

Install local pre-commit checks:

```powershell
./scripts/install-git-hooks.ps1
```

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) and [docs/PRODUCTION_ARCHITECTURE.md](docs/PRODUCTION_ARCHITECTURE.md).

## Production Readiness

The production task list is fully checked and the project currently passes:

```bash
npm run check
npm run launch:handoff
npm run release:readiness
npm run secret:generate -- encryption hex
npm run security:audit
npx prisma migrate status
```

Before launch, configure production secrets, connect managed services, provision preview and production databases, seed a demo workspace, run the manual `Production Preflight` GitHub workflow, and complete the provider, secret, and launch-readiness checklists in [docs/PROVIDER_LAUNCH_CHECKLIST.md](docs/PROVIDER_LAUNCH_CHECKLIST.md), [docs/SECRET_OPERATIONS.md](docs/SECRET_OPERATIONS.md), and [docs/LAUNCH_READINESS.md](docs/LAUNCH_READINESS.md).

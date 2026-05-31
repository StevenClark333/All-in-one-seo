# Local Development

## Prerequisites

- Node.js 22 or newer.
- Docker Desktop.
- npm.

## Setup

```bash
npm install
cp .env.example .env
docker compose up -d
npm run db:migrate
npm run db:seed
npm run dev
```

Open `http://localhost:3000`.

## Production-Mode Local Run

```bash
npm run build
npm run start -- --hostname 127.0.0.1 --port 3002
```

Open `http://127.0.0.1:3002/login`.

## Quality Gates

```bash
npm run check
```

This runs environment validation, Prettier check, ESLint, TypeScript, unit tests, and production build.

## Git Hooks

```powershell
./scripts/install-git-hooks.ps1
```

The pre-commit hook runs formatting checks, linting, typechecking, and tests.

## Database Utilities

```bash
npm run db:migrate
npm run db:seed
npm run db:studio
npx prisma migrate status
```

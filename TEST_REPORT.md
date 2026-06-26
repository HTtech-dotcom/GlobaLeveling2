# Test Report - v2.8

## Test 1 - Static/source audit: PASSED

Checked:

- `/api/bootstrap` calls `buildBootstrapState`.
- `CompletionToast` contains `live-avatar-asset`.
- CSS references all six promotion assets.
- `public/effects` contains six promotion assets.
- Overall/fire rank pseudo-element removal overrides are present.
- Fire frame alignment override is present.

## Test 2 - TypeScript strict compile: PASSED

Command:

```bash
npx tsc --noEmit
```

Result: exit code `0`.

## Test 3 - Next.js production build: PASSED

Command:

```bash
CI=1 NEXT_TELEMETRY_DISABLED=1 DATABASE_URL='postgresql://user:pass@localhost:5432/db' DIRECT_URL='postgresql://user:pass@localhost:5432/db' timeout 120s npx next build
```

Result:

- Compiled successfully.
- TypeScript completed successfully.
- Static pages generated successfully.
- Exit code `0`.

## Prisma note

The sandbox cannot download Prisma engines from `binaries.prisma.sh`, so `prisma generate` itself cannot complete here. For compile/build verification, a temporary Prisma type stub was used inside `node_modules`. `node_modules` and `.next` are excluded from the release zip. On a normal machine with internet and `.env`, run:

```powershell
npm.cmd install
npx.cmd prisma generate
npx.cmd prisma db push
npm.cmd run build
npm.cmd run dev
```

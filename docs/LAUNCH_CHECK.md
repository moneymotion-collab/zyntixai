# Launch check (CI / pre-deploy gate)

Use this gate before production deploys to verify TypeScript, required environment variables, production build, and two-coach tenant isolation.

## Required environment variables

Set these in Vercel (or your host) **and** in CI secrets for `npm run launch:check`:

| Variable | Purpose |
|----------|---------|
| `STRIPE_SECRET_KEY` | Stripe API (billing) |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signature verification |
| `STRIPE_PRICE_BASIC` | Basic plan price ID |
| `STRIPE_PRICE_PRO` | Pro plan price ID |
| `STRIPE_PRICE_BUSINESS` | Business plan price ID |
| `NEXT_PUBLIC_URL` | Canonical app URL (checkout redirects) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side Supabase admin / security tests |
| `CRON_SECRET` | Bearer token for scheduled cron routes |

**Also required for `security:test`:**

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (RLS tests) |

Source of truth in code: `lib/billing/production-env.ts` (`checkBillingProductionEnv`).

## Commands

```bash
# Individual steps
npm run typecheck      # TypeScript (tsc --noEmit)
npm run env:check      # Required production env vars
npm run build          # Next.js production build
npm run security:test  # Two-coach RLS isolation (15 checks)

# Full pre-deploy gate
npm run launch:check
```

`launch:check` runs `prelaunch:check` (`env:check`) automatically, then:

1. `typecheck`
2. `build`
3. `security:test`

## Expected result

When all secrets are configured and RLS is correct:

```
Production environment validation OK — All 8 required production environment variables are set.
...
=== Summary: 15/15 security PASS ===
Expected launch gate: 15/15 security PASS
```

Exit code `0` = safe to deploy. Any failure exits non-zero.

## When validation runs

| Context | Env validation |
|---------|----------------|
| `npm run dev` | **Skipped** — local development is not blocked |
| `npm run build` (local, no flags) | **Skipped** — optional local prod builds |
| `npm run env:check` / `launch:check` | **Required** — fails with a clear list of missing vars |
| Vercel `VERCEL_ENV=production` build | **Required** — `next.config.ts` calls `checkBillingProductionEnv` |
| CI with `ENFORCE_PRODUCTION_ENV=1` | **Required** during `next build` |

Escape hatch for emergency local debugging only:

```bash
SKIP_PRODUCTION_ENV_CHECK=1 npm run build
```

## CI example (GitHub Actions)

See `.github/workflows/launch-check.yml`. Configure repository secrets matching the table above, then:

```yaml
env:
  ENFORCE_PRODUCTION_ENV: "1"
  LAUNCH_CHECK: "1"
```

## Missing env behavior

`env:check` and production builds print each missing variable by name and exit `1`, for example:

```
Production environment validation FAILED

Missing 3 required production environment variable(s):
  - STRIPE_WEBHOOK_SECRET
  - CRON_SECRET
  - NEXT_PUBLIC_URL

Set these in your hosting provider or .env.local before deploy.
See docs/LAUNCH_CHECK.md for the full list and CI setup.
```

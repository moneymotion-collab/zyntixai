/**
 * Required environment variables for production deploy (billing, cron, Supabase admin).
 * Keep in sync with scripts/check-production-env.mjs
 */
export const CORE_PRODUCTION_ENV_VARS = [
  "NEXT_PUBLIC_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
] as const

export const STRIPE_PRODUCTION_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_BASIC",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_BUSINESS",
] as const

/** @deprecated Use getRequiredProductionEnvVars() — Stripe vars are optional unless BILLING_ENABLED=1 */
export const BILLING_PRODUCTION_ENV_VARS = [
  ...STRIPE_PRODUCTION_ENV_VARS,
  ...CORE_PRODUCTION_ENV_VARS,
] as const

export type BillingProductionEnvVar =
  (typeof BILLING_PRODUCTION_ENV_VARS)[number]

export type BillingProductionEnvCheck = {
  ok: boolean
  missing: BillingProductionEnvVar[]
  billingEnabled: boolean
}

export function isBillingEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const value = env.BILLING_ENABLED?.trim().toLowerCase()
  return value === "1" || value === "true" || value === "yes"
}

export function getRequiredProductionEnvVars(
  env: NodeJS.ProcessEnv = process.env,
): readonly BillingProductionEnvVar[] {
  if (isBillingEnabled(env)) {
    return BILLING_PRODUCTION_ENV_VARS
  }
  return CORE_PRODUCTION_ENV_VARS
}

export function checkBillingProductionEnv(
  env: NodeJS.ProcessEnv = process.env,
): BillingProductionEnvCheck {
  const required = getRequiredProductionEnvVars(env)
  const missing = required.filter((key) => !env[key]?.trim()) as BillingProductionEnvVar[]

  return {
    ok: missing.length === 0,
    missing,
    billingEnabled: isBillingEnabled(env),
  }
}

export function formatBillingProductionEnvReport(
  result: BillingProductionEnvCheck = checkBillingProductionEnv(),
): string {
  const required = getRequiredProductionEnvVars()
  if (result.ok) {
    const billingNote = result.billingEnabled
      ? " (billing enabled)"
      : " (billing disabled — set BILLING_ENABLED=1 when Stripe is ready)"
    return `All ${required.length} required production environment variables are set${billingNote}.`
  }

  const lines = [
    `Missing ${result.missing.length} required production environment variable(s):`,
    ...result.missing.map((key) => `  - ${key}`),
    "",
    result.billingEnabled
      ? "Set these in your hosting provider (e.g. Vercel) or .env.local before running launch:check."
      : "Stripe vars are skipped while BILLING_ENABLED is off. Set BILLING_ENABLED=1 when you add Stripe.",
  ]

  return lines.join("\n")
}

/**
 * When true, production env validation runs (deploy gate).
 * Local `npm run dev` and optional local `npm run build` are not gated unless LAUNCH_CHECK=1.
 */
export function shouldEnforceProductionEnv(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.SKIP_PRODUCTION_ENV_CHECK === "1") {
    return false
  }

  if (env.LAUNCH_CHECK === "1") {
    return true
  }

  if (env.VERCEL_ENV === "production") {
    return true
  }

  if (env.CI === "true" && env.ENFORCE_PRODUCTION_ENV === "1") {
    return true
  }

  return false
}

export function assertProductionEnvForDeploy(
  env: NodeJS.ProcessEnv = process.env,
): void {
  const result = checkBillingProductionEnv(env)

  if (!result.ok) {
    throw new Error(
      `Production environment validation failed.\n\n${formatBillingProductionEnvReport(result)}\n\nSee docs/LAUNCH_CHECK.md`,
    )
  }
}

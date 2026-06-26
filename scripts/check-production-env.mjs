/**
 * CLI check for required production environment variables.
 * Run: npm run env:check
 *
 * Keep PRODUCTION_ENV_VARS in sync with lib/billing/production-env.ts
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const CORE_PRODUCTION_ENV_VARS = [
  "NEXT_PUBLIC_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
]

const STRIPE_PRODUCTION_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_BASIC",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_BUSINESS",
]

function isBillingEnabled(env = process.env) {
  const value = env.BILLING_ENABLED?.trim().toLowerCase()
  return value === "1" || value === "true" || value === "yes"
}

function getRequiredProductionEnvVars(env = process.env) {
  if (isBillingEnabled(env)) {
    return [...STRIPE_PRODUCTION_ENV_VARS, ...CORE_PRODUCTION_ENV_VARS]
  }
  return CORE_PRODUCTION_ENV_VARS
}

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8")
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // optional — CI should inject env via secrets
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"))
loadEnvFile(resolve(process.cwd(), ".env"))

function checkProductionEnv(env = process.env) {
  const required = getRequiredProductionEnvVars(env)
  const missing = required.filter((key) => !env[key]?.trim())
  return {
    ok: missing.length === 0,
    missing,
    billingEnabled: isBillingEnabled(env),
  }
}

function formatReport(result) {
  const required = getRequiredProductionEnvVars()
  if (result.ok) {
    const billingNote = result.billingEnabled
      ? " (billing enabled)"
      : " (billing disabled — set BILLING_ENABLED=1 when Stripe is ready)"
    return `All ${required.length} required production environment variables are set${billingNote}.`
  }

  return [
    `Missing ${result.missing.length} required production environment variable(s):`,
    ...result.missing.map((key) => `  - ${key}`),
    "",
    result.billingEnabled
      ? "Set these in your hosting provider or .env.local before deploy."
      : "Stripe vars are skipped while BILLING_ENABLED is off. Set BILLING_ENABLED=1 when you add Stripe.",
    "See docs/LAUNCH_CHECK.md for the full list and CI setup.",
  ].join("\n")
}

const result = checkProductionEnv()

if (!result.ok) {
  console.error("Production environment validation FAILED\n")
  console.error(formatReport(result))
  process.exit(1)
}

console.log(`Production environment validation OK — ${formatReport(result)}`)

/**
 * CLI check for required production environment variables.
 * Run: npm run env:check
 *
 * Keep PRODUCTION_ENV_VARS in sync with lib/billing/production-env.ts
 */
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

const PRODUCTION_ENV_VARS = [
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_BASIC",
  "STRIPE_PRICE_PRO",
  "STRIPE_PRICE_BUSINESS",
  "NEXT_PUBLIC_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
  "CRON_SECRET",
]

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
  const missing = PRODUCTION_ENV_VARS.filter((key) => !env[key]?.trim())
  return { ok: missing.length === 0, missing }
}

function formatReport(result) {
  if (result.ok) {
    return `All ${PRODUCTION_ENV_VARS.length} required production environment variables are set.`
  }

  return [
    `Missing ${result.missing.length} required production environment variable(s):`,
    ...result.missing.map((key) => `  - ${key}`),
    "",
    "Set these in your hosting provider or .env.local before deploy.",
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

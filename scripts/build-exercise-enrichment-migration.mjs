/**
 * Generates SQL migration to enrich top exercises in the database.
 * Run: node scripts/build-exercise-enrichment-migration.mjs
 */

import { readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, "..")

const enrichment = JSON.parse(
  readFileSync(join(root, "lib", "exercise-seed-enrichment.json"), "utf8"),
)

function sqlString(value) {
  return `'${value.replace(/'/g, "''")}'`
}

function sqlJson(value) {
  return sqlString(JSON.stringify(value))
}

const updates = Object.entries(enrichment)
  .map(([name, content]) => {
    return `update public.exercises
set
  form_steps = ${sqlJson(content.form_steps)}::jsonb,
  common_mistakes = ${sqlJson(content.common_mistakes)}::jsonb,
  coach_tips = ${sqlJson(content.coach_tips)}::jsonb
where lower(name) = lower(${sqlString(name)})
  and is_custom = false;`
  })
  .join("\n\n")

const migration = `-- Enrich top ${Object.keys(enrichment).length} standard exercises with coaching content.

${updates}
`

const outPath = join(
  root,
  "supabase",
  "migrations",
  "20260623140000_enrich_top_exercises_coaching.sql",
)
writeFileSync(outPath, migration, "utf8")
console.log(`Wrote migration with ${Object.keys(enrichment).length} updates to ${outPath}`)

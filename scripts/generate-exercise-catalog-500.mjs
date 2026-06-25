import fs from "node:fs"
import path from "node:path"
import { ADDITIONS_BY_MUSCLE } from "./exercise-catalog-additions.mjs"

const ROOT = process.cwd()
const EXISTING_PATH = path.join(ROOT, "lib/exercise-seed-catalog.json")
const JSON_OUT = path.join(ROOT, "lib/exercise-seed-catalog.json")
const SQL_MIGRATION = path.join(
  ROOT,
  "supabase/migrations/20260619140000_seed_exercise_library_120.sql",
)
const SQL_SCRIPT = path.join(ROOT, "supabase/scripts/seed-exercise-library-500.sql")
const EXPAND_MIGRATION = path.join(
  ROOT,
  "supabase/migrations/20260619200000_seed_exercise_library_500_expand.sql",
)

const TARGET_COUNT = 500

const MUSCLE_QUOTAS = {
  Chest: 40,
  Back: 50,
  Shoulders: 40,
  Biceps: 35,
  Triceps: 35,
  Legs: 60,
  Glutes: 35,
  Core: 42,
  Cardio: 25,
  Mobility: 28,
  "Olympic Lifts": 22,
  Calisthenics: 43,
  "Rehab/Prehab": 45,
}

const EQUIPMENT_NORMALIZE = {
  dumbbells: "Dumbbell",
  "cable machine": "Cable",
  "ez-bar": "Barbell",
  "smith machine": "Machine",
  "pull-up bar": "Bodyweight",
  "dip bars": "Bodyweight",
  bench: "Bodyweight",
  "t-bar row machine": "Machine",
  "mini band": "Resistance Band",
  "weight plate": "Plate",
  "belt squat machine": "Machine",
  "hyperextension bench": "Machine",
  "glute-ham developer": "Machine",
  "ab wheel": "Bodyweight",
  "medicine ball": "Ball",
  "foam roller": "Foam Roller",
  treadmill: "Machine",
  "exercise bike": "Machine",
  "rowing machine": "Machine",
  elliptical: "Machine",
  "assault bike": "Machine",
  "stair climber": "Machine",
  "battle ropes": "Bodyweight",
  "jump rope": "Bodyweight",
  "pro sled": "Machine",
  "plyo box": "Bodyweight",
}

const CATEGORY_BY_MUSCLE = {
  Chest: "Strength",
  Back: "Strength",
  Shoulders: "Strength",
  Biceps: "Strength",
  Triceps: "Strength",
  Legs: "Strength",
  Glutes: "Strength",
  Core: "Strength",
  Cardio: "Cardio",
  Mobility: "Mobility",
  "Olympic Lifts": "Olympic",
  Calisthenics: "Calisthenics",
  "Rehab/Prehab": "Rehab",
}

function normalizeEquipment(raw) {
  const key = raw.trim().toLowerCase()
  return EQUIPMENT_NORMALIZE[key] ?? raw.trim()
}

function sqlEscape(value) {
  return value.replace(/'/g, "''")
}

function sqlArray(values) {
  if (!values.length) return "array[]::text[]"
  return `array[${values.map((v) => `'${sqlEscape(v)}'`).join(", ")}]::text[]`
}

function defaultInstructions(name, muscle, equipment) {
  return `Perform ${name} with controlled tempo, full range of motion, and stable ${muscle.toLowerCase()} engagement using ${equipment.toLowerCase()}.`
}

function defaultTips(muscle, difficulty) {
  if (difficulty === "Advanced") {
    return `Prioritize technique over load and scale ${muscle.toLowerCase()} volume as needed.`
  }
  if (difficulty === "Beginner") {
    return `Start light, master form, and progress gradually on ${muscle.toLowerCase()} training.`
  }
  return `Brace the core, use consistent reps, and stop before form breaks down.`
}

function toRow(entry, primaryMuscle) {
  const equipment = normalizeEquipment(entry.equipment)
  const difficulty = entry.difficulty
  const secondary = entry.secondary_muscles ?? entry.secondary ?? []
  const category =
    entry.category ?? CATEGORY_BY_MUSCLE[primaryMuscle] ?? "Strength"

  return {
    name: entry.name.trim(),
    category,
    primary_muscle: primaryMuscle,
    secondary_muscles: secondary,
    equipment,
    difficulty,
    instructions:
      entry.instructions ??
      defaultInstructions(entry.name, primaryMuscle, equipment),
    tips: entry.tips ?? defaultTips(primaryMuscle, difficulty),
    image_url: null,
    video_url: null,
  }
}

function loadExisting() {
  const raw = JSON.parse(fs.readFileSync(EXISTING_PATH, "utf8"))
  return raw.map((row) => ({
    ...row,
    equipment: normalizeEquipment(row.equipment),
    secondary_muscles: row.secondary_muscles ?? [],
  }))
}

function loadAdditions() {
  const rows = []
  for (const [muscle, items] of Object.entries(ADDITIONS_BY_MUSCLE)) {
    for (const item of items) {
      rows.push(toRow(item, muscle))
    }
  }
  return rows
}

function dedupeByName(rows) {
  const map = new Map()
  for (const row of rows) {
    if (!map.has(row.name)) {
      map.set(row.name, row)
    }
  }
  return [...map.values()]
}

function sortRows(rows) {
  const muscleOrder = [
    "Chest",
    "Back",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Legs",
    "Glutes",
    "Core",
    "Cardio",
    "Mobility",
    "Olympic Lifts",
    "Calisthenics",
    "Rehab/Prehab",
  ]
  return rows.sort((a, b) => {
    const ma = muscleOrder.indexOf(a.primary_muscle)
    const mb = muscleOrder.indexOf(b.primary_muscle)
    if (ma !== mb) return ma - mb
    return a.name.localeCompare(b.name)
  })
}

function selectWithQuotas(rows) {
  const byMuscle = new Map()
  for (const row of rows) {
    if (!byMuscle.has(row.primary_muscle)) {
      byMuscle.set(row.primary_muscle, [])
    }
    byMuscle.get(row.primary_muscle).push(row)
  }

  const selected = []
  for (const [muscle, quota] of Object.entries(MUSCLE_QUOTAS)) {
    const pool = byMuscle.get(muscle) ?? []
    if (pool.length < quota) {
      throw new Error(
        `${muscle} has ${pool.length} exercises but quota is ${quota}. Add more to exercise-catalog-additions.mjs`,
      )
    }
    selected.push(...pool.slice(0, quota))
  }

  return sortRows(selected)
}

function buildCatalog() {
  const merged = dedupeByName([...loadExisting(), ...loadAdditions()])
  const sorted = sortRows(merged)
  const selected = selectWithQuotas(sorted)

  if (selected.length !== TARGET_COUNT) {
    throw new Error(`Expected ${TARGET_COUNT} exercises, got ${selected.length}`)
  }

  return selected
}

function renderSqlValues(rows) {
  return rows
    .map(
      (row) => `    (
      '${sqlEscape(row.name)}',
      '${sqlEscape(row.category)}',
      '${sqlEscape(row.primary_muscle)}',
      ${sqlArray(row.secondary_muscles)},
      '${sqlEscape(row.equipment)}',
      '${sqlEscape(row.difficulty)}',
      '${sqlEscape(row.instructions)}',
      '${sqlEscape(row.tips)}'
    )`,
    )
    .join(",\n")
}

function renderSeedSql(rows, headerComment) {
  return `-- ${headerComment}
-- Idempotent: ON CONFLICT (name) DO NOTHING.

create unique index if not exists exercises_name_key on public.exercises (name);

insert into public.exercises (
  name,
  category,
  primary_muscle,
  secondary_muscles,
  equipment,
  difficulty,
  instructions,
  tips,
  image_url,
  video_url
)
select
  v.name,
  v.category,
  v.primary_muscle,
  v.secondary_muscles,
  v.equipment,
  v.difficulty,
  v.instructions,
  v.tips,
  null::text,
  null::text
from (
  values
${renderSqlValues(rows)}
) as v(
  name,
  category,
  primary_muscle,
  secondary_muscles,
  equipment,
  difficulty,
  instructions,
  tips
)
on conflict (name) do nothing;
`
}

function renderFullMigrationSql(rows) {
  const dedupeBlock = `-- Remove legacy duplicate names before enforcing uniqueness.
with ranked as (
  select
    id,
    name,
    row_number() over (
      partition by name
      order by created_at nulls last, id::text
    ) as rn
  from public.exercises
),
dupes as (
  select
    r.id as dup_id,
    k.id as keep_id
  from ranked r
  join ranked k
    on k.name = r.name
   and k.rn = 1
  where r.rn > 1
)
update public.workout_plan_exercises wpe
set exercise_id = d.keep_id
from dupes d
where wpe.exercise_id = d.dup_id;

with ranked as (
  select
    id,
    name,
    row_number() over (
      partition by name
      order by created_at nulls last, id::text
    ) as rn
  from public.exercises
)
delete from public.exercises e
using ranked r
where e.id = r.id
  and r.rn > 1;

`

  return `-- Seed ${TARGET_COUNT} professional gym exercises across major movement categories.
-- Idempotent: ON CONFLICT (name) DO NOTHING.

${dedupeBlock}${renderSeedSql(rows, `Seed ${TARGET_COUNT} exercises`).replace(/^--[^\n]*\n-- Idempotent[^\n]*\n\n/, "")}`
}

function printStats(rows) {
  const byMuscle = {}
  const byEquipment = {}
  for (const row of rows) {
    byMuscle[row.primary_muscle] = (byMuscle[row.primary_muscle] ?? 0) + 1
    byEquipment[row.equipment] = (byEquipment[row.equipment] ?? 0) + 1
  }
  console.log(`Generated ${rows.length} exercises`)
  console.log("By muscle:", byMuscle)
  console.log("By equipment:", byEquipment)
}

const catalog = buildCatalog()
printStats(catalog)

fs.writeFileSync(JSON_OUT, JSON.stringify(catalog, null, 2))
fs.writeFileSync(SQL_MIGRATION, renderFullMigrationSql(catalog))
fs.writeFileSync(
  SQL_SCRIPT,
  renderSeedSql(catalog, `Standalone seed: ${TARGET_COUNT} exercises for SQL Editor`),
)
fs.writeFileSync(
  EXPAND_MIGRATION,
  renderSeedSql(
    catalog,
    `Expand exercise library to ${TARGET_COUNT} exercises (safe on databases that already have earlier seeds)`,
  ),
)

console.log("Wrote:", JSON_OUT)
console.log("Wrote:", SQL_MIGRATION)
console.log("Wrote:", SQL_SCRIPT)
console.log("Wrote:", EXPAND_MIGRATION)

import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")

const PROTECTED = [
  "app/api/client-profile/route.ts",
  "app/api/workout-builder/route.ts",
  "app/api/workout-templates/route.ts",
  "app/api/workout-templates/[id]/use/route.ts",
  "app/api/exercises/route.ts",
  "app/api/exercises/seed/route.ts",
  "app/api/ai-coach/route.ts",
  "app/api/ai-coach/save-note/route.ts",
  "app/api/ai-coach/save-workout/route.ts",
  "app/api/ai-coach/save-nutrition/route.ts",
  "app/api/check-ins/route.ts",
  "app/api/workspace/enter-live/route.ts",
  "app/api/workspace/enter-demo/route.ts",
  "app/api/gym-settings/route.ts",
  "app/api/onboarding/initialize/route.ts",
  "app/api/demo/clear/route.ts",
  "app/api/demo/load/route.ts",
  "app/api/demo/generate/route.ts",
  "app/api/demo/reset/route.ts",
  "app/api/marketing-strategy/route.ts",
  "app/api/marketing-coach/route.ts",
  "app/api/analytics/insights/route.ts",
  "app/api/ai-growth-autopilot/route.ts",
  "app/api/instagram/connection/route.ts",
  "app/api/instagram/publish/route.ts",
  "app/api/viral-score/route.ts",
  "app/api/viral-score/optimize/route.ts",
  "app/api/strategy/improve-from-insights/route.ts",
  "app/api/strategy-to-posts/route.ts",
  "app/api/schedule-post/route.ts",
  "app/api/video-script-generator/route.ts",
  "app/api/subtitles/generate/route.ts",
  "app/api/video/generate/route.ts",
  "app/api/video/render-final/route.ts",
  "app/api/video/generate-images/route.ts",
  "app/api/video/[videoProjectId]/route.ts",
  "app/api/video/render/route.ts",
  "app/api/video/generate-voiceover/route.ts",
]

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(full))
    } else if (entry.name === "route.ts") {
      files.push(full)
    }
  }
  return files
}

const marketingRoutes = walk(path.join(root, "app/api/marketing")).map((f) =>
  path.relative(root, f).replaceAll("\\", "/"),
)
const contentRoutes = walk(path.join(root, "app/api/content"))
  .map((f) => path.relative(root, f).replaceAll("\\", "/"))
  .filter((f) => !f.includes("content/posts/route.ts"))
const brandRoutes = walk(path.join(root, "app/api/brands")).map((f) =>
  path.relative(root, f).replaceAll("\\", "/"),
)

const allTargets = [...new Set([...PROTECTED, ...marketingRoutes, ...contentRoutes, ...brandRoutes])]

const IMPORT_LINE = 'import { requireAppAccess } from "@/lib/auth/requireAppAccess"'
const GUARD = `  const access = await requireAppAccess()
  if (!access.ok) return access.response
`

function addGuardToHandlers(source) {
  const handlerRegex =
    /export async function (GET|POST|PUT|PATCH|DELETE)\([^)]*\)\s*\{/g
  let result = source
  let offset = 0
  let match

  while ((match = handlerRegex.exec(source)) !== null) {
    const braceIndex = match.index + match[0].length
    const afterBrace = source.slice(braceIndex, braceIndex + 200)
    if (afterBrace.includes("requireAppAccess()")) {
      continue
    }

    const insertAt = braceIndex + offset
    result = result.slice(0, insertAt) + "\n" + GUARD + result.slice(insertAt)
    offset += GUARD.length + 1
  }

  return result
}

function ensureImport(source) {
  if (source.includes("requireAppAccess")) {
    return source
  }

  const lines = source.split("\n")
  let lastImport = -1
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith("import ")) {
      lastImport = i
    }
  }

  if (lastImport >= 0) {
    lines.splice(lastImport + 1, 0, IMPORT_LINE)
  } else {
    lines.unshift(IMPORT_LINE)
  }

  return lines.join("\n")
}

let updated = 0
let skipped = 0

for (const rel of allTargets.sort()) {
  const file = path.join(root, rel)
  if (!fs.existsSync(file)) {
    console.log("MISSING", rel)
    continue
  }

  const original = fs.readFileSync(file, "utf8")
  if (original.includes("requireAppAccess")) {
    skipped++
    continue
  }

  if (original.includes("export {") && original.includes("from ")) {
    console.log("SKIP re-export", rel)
    skipped++
    continue
  }

  let next = ensureImport(original)
  next = addGuardToHandlers(next)

  if (next !== original) {
    fs.writeFileSync(file, next)
    updated++
    console.log("UPDATED", rel)
  } else {
    console.log("NO HANDLERS", rel)
  }
}

console.log(`Done. Updated ${updated}, skipped ${skipped}.`)

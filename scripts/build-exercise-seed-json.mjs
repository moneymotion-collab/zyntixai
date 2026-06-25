import { spawnSync } from "node:child_process"
import path from "node:path"

const script = path.join("scripts", "generate-exercise-catalog-500.mjs")
const result = spawnSync(process.execPath, [script], {
  stdio: "inherit",
  cwd: process.cwd(),
})

if (result.status !== 0) {
  process.exit(result.status ?? 1)
}

console.log("Exercise seed catalog regenerated (500 exercises).")

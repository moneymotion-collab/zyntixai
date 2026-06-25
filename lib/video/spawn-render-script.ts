import { spawn } from "node:child_process"
import path from "node:path"

export type RenderScriptResult = {
  ok?: boolean
  videoUrl?: string
  error?: string
}

export async function spawnRenderScript(
  scriptName: string,
  args: string[],
  env?: Record<string, string>,
): Promise<RenderScriptResult> {
  const scriptPath = path.join(process.cwd(), "scripts", scriptName)

  const child = spawn(process.execPath, [scriptPath, ...args], {
    cwd: process.cwd(),
    env: { ...process.env, ...env },
    stdio: ["ignore", "pipe", "pipe"],
  })

  let stdout = ""
  let stderr = ""

  child.stdout?.on("data", (chunk) => {
    const text = String(chunk)
    stdout += text
    for (const line of text.split("\n")) {
      const trimmed = line.trim()
      if (trimmed) console.log(trimmed)
    }
  })
  child.stderr?.on("data", (chunk) => {
    const text = String(chunk)
    stderr += text
    for (const line of text.split("\n")) {
      const trimmed = line.trim()
      if (trimmed) console.error(trimmed)
    }
  })

  const exitCode: number = await new Promise((resolve, reject) => {
    child.on("error", reject)
    child.on("close", (code) => resolve(code ?? 1))
  })

  const combined = `${stdout}\n${stderr}`.trim()
  const jsonStart = stdout.lastIndexOf("{")
  const jsonEnd = stdout.lastIndexOf("}")
  const maybeJson =
    jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart
      ? stdout.slice(jsonStart, jsonEnd + 1)
      : null

  if (maybeJson) {
    const parsed = JSON.parse(maybeJson) as RenderScriptResult
    if (parsed.ok === false) {
      throw new Error(parsed.error || combined || "Render failed")
    }
    if (parsed.videoUrl) {
      return parsed
    }
  }

  if (exitCode !== 0) {
    throw new Error(combined || `Render failed (exit code ${exitCode})`)
  }

  throw new Error(combined || "Render did not return a video URL")
}

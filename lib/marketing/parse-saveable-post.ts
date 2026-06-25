import { clampViralScore } from "@/lib/marketing/viral-score"

export type SaveablePost = {
  platform: string
  content: string
  hook: string
  post_type: string
  scheduled_date: string
  viral_score?: number
}

const FIELD_PATTERN =
  /^(?:-\s*)?(platform|content|hook|post_type|scheduled_date|suggested_date|viral_score):\s*(.+)$/i

export function parseSaveablePost(text: string): SaveablePost | null {
  const block = text.split(/SAVEABLE POST:/i)[1]
  if (!block) return null

  const fields: SaveablePost = {
    platform: "",
    content: "",
    hook: "",
    post_type: "",
    scheduled_date: "",
  }

  for (const line of block.split("\n")) {
    const match = line.trim().match(FIELD_PATTERN)
    if (!match) continue

    const key = match[1].toLowerCase()
    const value = match[2].trim()

    if (key === "platform") fields.platform = value
    else if (key === "content") fields.content = value
    else if (key === "hook") fields.hook = value
    else if (key === "post_type") fields.post_type = value
    else if (key === "scheduled_date" || key === "suggested_date") {
      fields.scheduled_date = value
    } else if (key === "viral_score") {
      const score = clampViralScore(value)
      if (score != null) fields.viral_score = score
    }
  }

  if (!fields.platform && !fields.content && !fields.hook) return null
  return fields
}

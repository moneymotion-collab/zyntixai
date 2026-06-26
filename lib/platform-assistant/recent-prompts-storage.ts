const STORAGE_KEY = "zyntix-ai-recent-prompts"
const MAX_PROMPTS = 6

export function readRecentPrompts(): string[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .slice(0, MAX_PROMPTS)
  } catch {
    return []
  }
}

export function appendRecentPrompt(prompt: string): string[] {
  const trimmed = prompt.trim()
  if (!trimmed || typeof window === "undefined") {
    return readRecentPrompts()
  }

  const next = [trimmed, ...readRecentPrompts().filter((item) => item !== trimmed)].slice(
    0,
    MAX_PROMPTS,
  )

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

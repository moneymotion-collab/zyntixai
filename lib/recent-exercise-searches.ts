const STORAGE_KEY = "fitai:exercise-library:recent-searches"
const MAX_RECENT = 5

export function getRecentExerciseSearches(): string[] {
  if (typeof window === "undefined") return []

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []

    return parsed
      .filter((item): item is string => typeof item === "string")
      .map((item) => item.trim())
      .filter(Boolean)
      .slice(0, MAX_RECENT)
  } catch {
    return []
  }
}

export function addRecentExerciseSearch(query: string): string[] {
  if (typeof window === "undefined") return []

  const trimmed = query.trim()
  if (trimmed.length < 2) return getRecentExerciseSearches()

  const next = [
    trimmed,
    ...getRecentExerciseSearches().filter(
      (item) => item.toLowerCase() !== trimmed.toLowerCase(),
    ),
  ].slice(0, MAX_RECENT)

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  } catch {
    // Ignore quota or privacy mode errors.
  }

  return next
}

export function clearRecentExerciseSearches(): void {
  if (typeof window === "undefined") return

  try {
    window.localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Ignore storage errors.
  }
}

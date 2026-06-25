/** Split workout description into displayable exercise lines. */
export function parseWorkoutExercises(description: string | null | undefined): string[] {
  if (!description?.trim()) return []

  const lines = description
    .split(/\r?\n/)
    .map((line) => line.replace(/^[\s\-•*]+/, "").replace(/^\d+[.)]\s*/, "").trim())
    .filter(Boolean)

  if (lines.length > 1) return lines

  const single = lines[0] ?? description.trim()
  if (single.includes(";")) {
    return single
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean)
  }

  return [single]
}

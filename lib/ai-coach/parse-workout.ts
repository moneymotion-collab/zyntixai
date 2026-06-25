export type ParsedExercise = {
  name: string
  sets: number
  reps: number
}

export type ParsedWorkout = {
  title: string
  goal: string | null
  weeks: number
  exercises: ParsedExercise[]
}

export function parseWorkoutFromText(text: string): ParsedWorkout | null {
  const lines = text.split("\n")
  const exercises: ParsedExercise[] = []

  let title = "AI Workout Plan"
  const heading = text.match(/^#+\s*(.+)/m)
  if (heading?.[1]) title = heading[1].trim().slice(0, 120)

  const goalLine = text.match(/goal[:\s]+(.+)/i)
  const goal = goalLine?.[1]?.trim().slice(0, 200) ?? null

  for (const line of lines) {
    const patterns = [
      /^[\s\-\*•]*(?:\d+\.\s*)?(.+?)[:\s–—-]+(\d+)\s*[xX×]\s*(\d+)/,
      /^[\s\-\*•]*(?:\d+\.\s*)?(.+?)\s+(\d+)\s*sets?\s*(?:of|×|x)\s*(\d+)\s*reps?/i,
    ]

    for (const pattern of patterns) {
      const match = line.match(pattern)
      if (match) {
        const name = match[1].replace(/\*\*/g, "").trim()
        if (name.length > 1) {
          exercises.push({
            name,
            sets: Number(match[2]),
            reps: Number(match[3]),
          })
        }
        break
      }
    }
  }

  if (exercises.length === 0) return null

  return { title, goal, weeks: 4, exercises }
}

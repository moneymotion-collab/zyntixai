export type ParsedNutrition = {
  title: string
  calories: number | null
  protein: number | null
  carbs: number | null
  fats: number | null
  description: string | null
  goal: string | null
}

function parseMacro(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match?.[1]) return Number(match[1])
  }
  return null
}

export function parseNutritionFromText(text: string): ParsedNutrition {
  const titleMatch = text.match(/^#+\s*(.+)/m)
  const firstLine = text.trim().split(/\r?\n/)[0]?.trim()
  const title =
    titleMatch?.[1]?.trim().slice(0, 120) ??
    (firstLine && !/^\d/.test(firstLine) && firstLine.length <= 120
      ? firstLine
      : "AI Nutrition Plan")

  const calories = parseMacro(text, [
    /(\d{3,4})\s*kcal/i,
    /calories?[:\s]+(\d+)/i,
    /calorieën[:\s]+(\d+)/i,
  ])

  const protein = parseMacro(text, [
    /(\d+)\s*g\s*protein/i,
    /protein[:\s]+(\d+)\s*g/i,
    /(\d+)\s*g\s*eiwit/i,
    /eiwit[:\s]+(\d+)\s*g/i,
  ])

  const carbs = parseMacro(text, [
    /(\d+)\s*g\s*carbs?/i,
    /carbs?[:\s]+(\d+)\s*g/i,
    /(\d+)\s*g\s*koolhydraten/i,
    /koolhydraten[:\s]+(\d+)\s*g/i,
  ])

  const fats = parseMacro(text, [
    /(\d+)\s*g\s*fats?/i,
    /fats?[:\s]+(\d+)\s*g/i,
    /(\d+)\s*g\s*vetten/i,
    /vetten[:\s]+(\d+)\s*g/i,
  ])

  const goalLine = text.match(/goal[:\s]+(.+)/i)

  return {
    title,
    calories,
    protein,
    carbs,
    fats,
    description: text.trim().slice(0, 2000) || null,
    goal: goalLine?.[1]?.trim().slice(0, 200) ?? null,
  }
}

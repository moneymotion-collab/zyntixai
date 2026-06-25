export function safeParse(jsonString: string): unknown | null {
  try {
    return JSON.parse(jsonString)
  } catch {
    console.error("AI JSON parse failed:", jsonString)
    return null
  }
}

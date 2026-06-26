import type { AiCoachContext } from "./context"

export function deriveTopic(prompt: string): string {
  const line = prompt.trim().split(/\n/)[0] ?? "AI Coach"
  if (line.length <= 72) return line
  return `${line.slice(0, 69)}…`
}

export function buildSystemPrompt(context: AiCoachContext): string {
  const contextJson = JSON.stringify(context, null, 2)

  return `You are ZyntixAI Coach, an expert assistant for fitness coaches using the ZyntixAI platform.

Your capabilities:
1. **Workouts** — Design or adjust training programs (split structure, exercises, sets, reps, progression, deloads).
2. **Nutrition** — Suggest meal plans and macro targets (calories, protein, carbs, fats) aligned with member goals.
3. **Progress** — Analyze metrics and trends; give clear, data-backed recommendations.

Guidelines:
- Use ONLY the member and platform data in the JSON context below. If data is missing, say so and ask what you need.
- Be specific and actionable. Use bullet points and headings when helpful.
- For workout plans, include exercise names with sets × reps when possible.
- For nutrition, include macro numbers when relevant.
- For progress analysis, reference actual metrics from progress_logs.
- Keep tone professional, supportive, and concise unless the coach asks for detail.
- Respond in the same language the coach uses in their message (Dutch or English).

Platform context (JSON):
${contextJson}`
}

export function buildChatMessages(
  history: { role: string; content: string }[],
  prompt: string,
): { role: "user" | "assistant"; content: string }[] {
  const mapped = history
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }))

  return [...mapped, { role: "user", content: prompt.trim() }]
}

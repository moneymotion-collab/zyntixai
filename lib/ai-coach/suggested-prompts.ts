/** Quick prompts coaches can send to AI Coach for common workflows */
export const AI_COACH_SUGGESTED_PROMPTS = [
  "Assign today's workout based on their current program.",
  "Create a fat loss meal plan with macro targets.",
  "Schedule tomorrow's check-in and suggest talking points.",
  "Summarize this member's progress over the last 30 days.",
  "Adjust their workout volume — they're reporting fatigue.",
] as const

export function buildMemberPrompt(
  template: string,
  memberName: string,
): string {
  return template.replace(/\{member\}/g, memberName)
}

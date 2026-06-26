import { hasAiApiKey } from "@/lib/ai-coach/provider"
import type { AiCoachContext } from "./context"
import { detectContentType } from "./detect-content-type"

export function isAiMockMode(): boolean {
  if (process.env.AI_MOCK_MODE === "true") return true
  if (hasAiApiKey()) return false
  return true
}

function memberLabel(context?: AiCoachContext): string {
  if (context?.scope === "member") {
    return context.member.full_name
  }
  return "this member"
}

export function generateMockResponse(
  prompt: string,
  context?: AiCoachContext,
): string {
  const intent = detectContentType(prompt)
  const member = memberLabel(context)

  switch (intent) {
    case "workout":
      return buildWorkoutMock(prompt, member, context)
    case "nutrition":
      return buildNutritionMock(prompt, member, context)
    case "progress":
      return buildProgressMock(prompt, member, context)
    default:
      return buildGeneralMock(prompt, member)
  }
}

function buildWorkoutMock(
  prompt: string,
  member: string,
  context?: AiCoachContext,
): string {
  const goal =
    context?.scope === "member" ? context.member.goal : "Hypertrophy / muscle gain"

  return `[Development mode — sample workout, no OpenAI cost]

# 4-Week Hypertrophy Workout for ${member}

Goal: ${goal ?? "Muscle building with progressive overload"}

## Week 1–4 structure
Train 4× per week (upper/lower split). Increase weight or reps when all sets fall within the rep range.

### Day A — Lower + Push
- Barbell Squat: 4x8
- Romanian Deadlift: 3x10
- Leg Press: 3x12
- Bench Press: 4x8
- Overhead Press: 3x10

### Day B — Pull + Accessories
- Conventional Deadlift: 3x6
- Lat Pulldown: 4x10
- Seated Cable Row: 3x12
- Dumbbell Curl: 3x12
- Tricep Pushdown: 3x12

## Progression
- Week 1–2: learn the movements, RPE 7–8
- Week 3: +2.5 kg on compound lifts where possible
- Week 4: optional deload (−30% volume) if fatigued

## Coach notes
Based on your question: "${prompt.trim().slice(0, 120)}"
Adjust exercises for injuries or equipment limits.`
}

function buildNutritionMock(
  prompt: string,
  member: string,
  context?: AiCoachContext,
): string {
  const goal =
    context?.scope === "member" ? context.member.goal : "Maintenance / recomposition"

  return `[Development mode — sample nutrition plan, no OpenAI cost]

# Sample Nutrition Plan for ${member}

Calories: 2200 kcal
Protein: 160g
Carbs: 220g
Fats: 70g

Goal: ${goal ?? "Balanced macro split"}

## Daily layout

**Breakfast**
- Oats 80g + whey 30g + banana
- ~520 kcal · 35g protein

**Lunch**
- Chicken breast 150g, rice 120g (cooked), vegetables
- ~580 kcal · 45g protein

**Dinner**
- Salmon 150g, potato 250g, salad with olive oil
- ~650 kcal · 40g protein

**Snack**
- Greek yogurt 200g + nuts 20g
- ~450 kcal · 40g protein

## Tips
- Drink at least 2.5 L water per day
- Weigh weekly under the same conditions
- Add carbs on training days (+30–50g)

Based on your question: "${prompt.trim().slice(0, 120)}"`
}

function buildProgressMock(
  prompt: string,
  member: string,
  context?: AiCoachContext,
): string {
  const logs =
    context?.scope === "member" ? context.progressLogs.slice(0, 5) : []

  const metricsBlock =
    logs.length > 0
      ? logs
          .map(
            (log) =>
              `- **${log.metric}**: ${log.start_value} → ${log.current_value} (last update: ${log.updated_at ? new Date(log.updated_at).toLocaleDateString("en-US") : "unknown"})`,
          )
          .join("\n")
      : `- **Weight**: 82.4 kg → 80.1 kg (−2.3 kg, 6 weeks)
- **Body fat**: 18.2% → 16.8% (−1.4%)
- **Squat 1RM (estimated)**: 100 kg → 112.5 kg (+12.5 kg)
- **Training adherence**: 14/16 sessions (88%)`

  return `[Development mode — sample analysis, no OpenAI cost]

# Progress Analysis for ${member}

## Summary
${member} shows a positive trend: consistent training, stable nutrition, and measurable gains in strength and body composition metrics.

## Metrics & trends
${metricsBlock}

## Analysis
1. **Weight & composition** — The downward weight trend combined with maintained or improved strength suggests fat loss while preserving muscle mass.
2. **Training** — Adherence above 85% is strong; focus on missed sessions (often weekends) for extra progress.
3. **Nutrition** — Estimated macro adherence ~80%; protein targets are usually met.

## Recommendations
- Keep protein at min. 1.8 g/kg; increase carbs on heavy lower-body days
- Add weekly progress photos for visual tracking
- Consider a deload in week 7 if RPE stays above 8
- Schedule a check-in in 2 weeks to adjust goals

Based on your question: "${prompt.trim().slice(0, 120)}"`
}

function buildGeneralMock(prompt: string, member: string): string {
  return `[Development mode — sample response, no OpenAI cost]

Hi! I'm the AI Coach in development mode. Ask about **workouts**, **nutrition**, or **progress** for ${member} to get a full sample plan you can save in ZyntixAI.

Your question was: "${prompt.trim().slice(0, 200)}"

**Examples:**
- "Generate a 4-week hypertrophy workout"
- "Create a 2200 kcal nutrition plan"
- "Analyze progress over the past few weeks"`
}

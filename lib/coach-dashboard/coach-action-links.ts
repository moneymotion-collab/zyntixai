export function buildProgressMemberUrl(memberId: string): string {
  return `/progress?member=${encodeURIComponent(memberId)}`
}

export function buildProgressReportUrl(memberId: string): string {
  return `/progress?member=${encodeURIComponent(memberId)}&section=report`
}

export function buildScheduleSessionUrl(memberId: string): string {
  return `/sessions?member=${encodeURIComponent(memberId)}&new=1`
}

export function buildAddMemberUrl(): string {
  return "/members#add-member"
}

export function buildCreateWorkoutUrl(): string {
  return "/workouts/new"
}

export function buildAssignWorkoutUrl(memberId?: string): string {
  if (!memberId) return "/workouts"
  return `/workouts?assignMember=${encodeURIComponent(memberId)}`
}

export function buildNutritionUrl(memberId?: string): string {
  if (!memberId) return "/nutrition"
  return `/nutrition?member=${encodeURIComponent(memberId)}#nutrition-form`
}

export function buildAiCoachUrl(memberId?: string): string {
  if (!memberId) return "/ai-coach"
  return `/ai-coach?member=${encodeURIComponent(memberId)}`
}

export function buildMarketingContentUrl(): string {
  return "/marketing/content-ideas"
}

export function buildMemberProfileUrl(memberId: string): string {
  return `/members/${encodeURIComponent(memberId)}`
}

export function buildSessionsNewUrl(): string {
  return "/sessions?new=1"
}

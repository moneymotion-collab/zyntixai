import type { PlatformPageContext, SessionEntityRef } from "./types"

const FOLLOW_UP_PATTERNS = [
  /^(make|change|update)\s+it\b/i,
  /^instead\b/i,
  /^(four|4|three|3|five|5)\s+days?\b/i,
  /^assign\s+it\b/i,
  /^schedule\s+it\b/i,
]

export function isFollowUpCommand(command: string): boolean {
  return FOLLOW_UP_PATTERNS.some((pattern) => pattern.test(command.trim()))
}

export function expandFollowUpCommand(
  command: string,
  lastEntity?: SessionEntityRef,
): string {
  if (!lastEntity || !isFollowUpCommand(command)) {
    return command
  }

  const trimmed = command.trim()

  if (/days?/i.test(trimmed) && lastEntity.type === "workout") {
    return `Update the workout "${lastEntity.label}" to ${trimmed}`
  }

  if (/^assign\s+it/i.test(trimmed) && lastEntity.type === "workout") {
    return `Assign workout "${lastEntity.label}" to the current member`
  }

  if (lastEntity.type === "member") {
    return `${trimmed} for ${lastEntity.label}`
  }

  return `${trimmed} (referring to ${lastEntity.label})`
}

export type ParsedIntent =
  | { intent: "create_workout" }
  | { intent: "assign_workout"; memberQuery?: string }
  | { intent: "create_nutrition"; goal?: string }
  | { intent: "schedule_session"; memberQuery?: string; when?: string }
  | { intent: "at_risk_members" }
  | { intent: "inactive_members" }
  | { intent: "generate_marketing"; count?: number; format?: string }
  | { intent: "analyze_business" }
  | { intent: "summarize_dashboard" }
  | { intent: "navigate"; target: string }
  | { intent: "member_workout"; when?: string }
  | { intent: "conversational" }

export function parseIntent(
  command: string,
  pageContext: PlatformPageContext,
): ParsedIntent {
  const text = command.trim().toLowerCase()

  if (
    /create.*(workout|training)\s*(plan)?|new workout/i.test(command) ||
    /build.*program/i.test(command)
  ) {
    return { intent: "create_workout" }
  }

  if (/assign.*workout|assign today'?s workout/i.test(command)) {
    const memberQuery = extractMemberName(command)
    return { intent: "assign_workout", memberQuery }
  }

  if (/nutrition|meal plan|fat loss|macro/i.test(command)) {
    const goal = /fat loss|weight loss/i.test(command)
      ? "fat loss"
      : /muscle|hypertrophy/i.test(command)
        ? "muscle gain"
        : undefined
    return { intent: "create_nutrition", goal }
  }

  if (/schedule.*session|book.*session/i.test(command)) {
    return {
      intent: "schedule_session",
      memberQuery: extractMemberName(command),
      when: extractWhenPhrase(command),
    }
  }

  if (/at[- ]risk|needs attention|high risk/i.test(command)) {
    return { intent: "at_risk_members" }
  }

  if (/inactive|haven'?t trained|no workout/i.test(command)) {
    return { intent: "inactive_members" }
  }

  if (
    /instagram|reels?|posts?|content ideas|generate.*(post|reel|content)/i.test(
      command,
    )
  ) {
    const countMatch = command.match(/(\d+)\s*(posts?|reels?|ideas?)/i)
    return {
      intent: "generate_marketing",
      count: countMatch ? Number(countMatch[1]) : undefined,
      format: /reel/i.test(command) ? "reel" : "post",
    }
  }

  if (/analyze.*(business|coaching)|business overview/i.test(command)) {
    return { intent: "analyze_business" }
  }

  if (/summarize.*(dashboard|today)|today'?s dashboard/i.test(command)) {
    return { intent: "summarize_dashboard" }
  }

  if (
    pageContext.kind === "member_profile" &&
    /(create|build|next week'?s?).*workout/i.test(command)
  ) {
    return { intent: "member_workout", when: extractWhenPhrase(command) }
  }

  if (pageContext.kind === "marketing_content" && /generate/i.test(command)) {
    const countMatch = command.match(/(\d+)/)
    return {
      intent: "generate_marketing",
      count: countMatch ? Number(countMatch[1]) : 5,
      format: /reel/i.test(command) ? "reel" : "post",
    }
  }

  if (/^go to |^open |^show /i.test(command)) {
    return { intent: "navigate", target: text.replace(/^(go to|open|show)\s+/i, "") }
  }

  return { intent: "conversational" }
}

function extractMemberName(command: string): string | undefined {
  const patterns = [
    /(?:to|for)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/,
    /member\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
  ]

  for (const pattern of patterns) {
    const match = command.match(pattern)
    if (match?.[1]) return match[1].trim()
  }

  const lower = command.toLowerCase()
  const toFor = lower.match(/(?:to|for)\s+([a-z]+(?:\s+[a-z]+)?)/)
  if (toFor?.[1] && !["today", "tomorrow", "the", "a", "my"].includes(toFor[1])) {
    return toFor[1]
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ")
  }

  return undefined
}

function extractWhenPhrase(command: string): string | undefined {
  const match = command.match(
    /(tomorrow|today|next week|monday|tuesday|wednesday|thursday|friday|saturday|sunday)(?:\s+at\s+[\d:.]+\s*(?:am|pm)?)?/i,
  )
  return match?.[0]
}

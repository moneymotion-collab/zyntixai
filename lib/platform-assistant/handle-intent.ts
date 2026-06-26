import type {
  ParsedIntent,
} from "./intent-router"
import type {
  ActivityLogEntry,
  PendingConfirmation,
  PlatformCommandResponse,
  PlatformPageContext,
  SessionEntityRef,
  SuggestedAction,
} from "./types"
import type { MemberRow } from "./server-actions"
import { parseScheduleDateTime, resolveMemberByQuery } from "./server-actions"
import { contextLabel } from "./resolve-page-context"

type HandleContext = {
  intent: ParsedIntent
  command: string
  pageContext: PlatformPageContext
  members: MemberRow[]
  role: "admin" | "coach" | "member"
}

function id(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function activity(
  type: string,
  label: string,
  detail?: string,
  href?: string,
): ActivityLogEntry {
  return {
    id: id(),
    type,
    label,
    detail,
    href,
    timestamp: new Date().toISOString(),
  }
}

export function handlePlatformIntent(input: HandleContext): PlatformCommandResponse {
  const { intent, command, pageContext, members, role } = input

  if (role === "member") {
    return handleMemberIntent(command, pageContext)
  }

  switch (intent.intent) {
    case "create_workout":
      return {
        reply:
          "I'll open the workout builder so you can create a new plan. You can assign it to a member when you're done.",
        suggestedActions: [
          { id: id(), label: "Create workout now", href: "/workouts/new", variant: "primary" },
          { id: id(), label: "Browse workout library", href: "/workouts", variant: "secondary" },
        ],
        navigateTo: "/workouts/new",
        updatedEntity: { type: "workout", label: "New workout plan" },
        activityEntry: activity("workout", "Opened workout builder"),
      }

    case "assign_workout": {
      const member =
        resolveMemberByQuery(members, intent.memberQuery, pageContext.memberId) ??
        null
      if (!member) {
        return {
          reply:
            "I couldn't find that member. Try using their full name, or open Members to pick from your roster.",
          suggestedActions: [
            { id: id(), label: "Open members", href: "/members", variant: "primary" },
            { id: id(), label: "Workout library", href: "/workouts", variant: "secondary" },
          ],
        }
      }

      const href = `/workouts?assignMember=${member.id}`
      return {
        reply: `I'll help you assign a workout to ${member.full_name}. Choose a plan from your library — ${member.full_name} will be pre-selected.`,
        suggestedActions: [
          { id: id(), label: `Assign to ${member.full_name}`, href, variant: "primary" },
          { id: id(), label: "Create new workout", href: "/workouts/new", variant: "secondary" },
        ],
        navigateTo: href,
        updatedEntity: { type: "member", id: member.id, label: member.full_name ?? "Member" },
        activityEntry: activity(
          "workout",
          "Started workout assignment",
          member.full_name ?? undefined,
          href,
        ),
      }
    }

    case "create_nutrition": {
      const goalNote = intent.goal ? ` for ${intent.goal}` : ""
      const memberId = pageContext.memberId
      const href = memberId
        ? `/nutrition?member=${memberId}#nutrition-form`
        : "/nutrition#nutrition-form"
      return {
        reply: `I'll open Nutrition so you can create a meal plan${goalNote}. Assign it to a member from the same page.`,
        suggestedActions: [
          { id: id(), label: "Create nutrition plan", href, variant: "primary" },
          { id: id(), label: "View assigned plans", href: "/nutrition", variant: "secondary" },
        ],
        navigateTo: href,
        updatedEntity: { type: "nutrition", label: `Nutrition plan${goalNote}` },
        activityEntry: activity("nutrition", "Opened nutrition planner", intent.goal),
      }
    }

    case "schedule_session": {
      const member =
        resolveMemberByQuery(members, intent.memberQuery, pageContext.memberId) ??
        null
      if (!member) {
        return {
          reply:
            "Which member should I schedule? Mention their name, e.g. “Schedule a session tomorrow at 3 PM for Sarah.”",
          suggestedActions: [
            { id: id(), label: "Open sessions", href: "/sessions?new=1", variant: "primary" },
          ],
        }
      }

      const { scheduledAt, label } = parseScheduleDateTime(intent.when)
      const summary = `Schedule a 60-minute coaching session for ${member.full_name} on ${label}.`

      const pending: PendingConfirmation = {
        id: id(),
        summary,
        kind: "schedule_session",
        payload: { memberId: member.id, scheduledAt, memberName: member.full_name },
      }

      return {
        reply: `${summary}\n\nConfirm to add it to your calendar.`,
        pendingConfirmation: pending,
        suggestedActions: [
          {
            id: pending.id,
            label: "Confirm & schedule",
            variant: "primary",
            executeKind: "schedule_session",
            executePayload: pending.payload,
          },
          {
            id: id(),
            label: "Edit in sessions",
            href: `/sessions?member=${member.id}&new=1`,
            variant: "secondary",
          },
        ],
        speakableSummary: summary,
        updatedEntity: { type: "member", id: member.id, label: member.full_name ?? "Member" },
      }
    }

    case "at_risk_members":
      return {
        reply:
          "Opening your dashboard — check the At-Risk Members section for clients who need attention.",
        suggestedActions: [
          { id: id(), label: "View at-risk members", href: "/dashboard", variant: "primary" },
          { id: id(), label: "Coach workspace", href: "/coach-workspace", variant: "secondary" },
          { id: id(), label: "Progress overview", href: "/progress", variant: "ghost" },
        ],
        navigateTo: "/dashboard",
        activityEntry: activity("insight", "Viewed at-risk members", undefined, "/dashboard"),
      }

    case "inactive_members":
      return {
        reply:
          "I'll take you to Members — look for clients with “Needs attention” or no recent workouts.",
        suggestedActions: [
          { id: id(), label: "Open members", href: "/members", variant: "primary" },
          { id: id(), label: "Coach workspace", href: "/coach-workspace", variant: "secondary" },
        ],
        navigateTo: "/members",
        activityEntry: activity("insight", "Reviewing inactive members", undefined, "/members"),
      }

    case "generate_marketing": {
      const count = intent.count ?? 5
      const href = "/marketing/content-ideas"
      return {
        reply: `I'll open Content Ideas so you can generate ${count} ${intent.format ?? "post"}${count === 1 ? "" : "s"} for this week. Your current page context (${contextLabel(pageContext.kind)}) is applied.`,
        suggestedActions: [
          { id: id(), label: "Generate content", href, variant: "primary" },
          { id: id(), label: "Open calendar", href: "/marketing/calendar", variant: "secondary" },
          { id: id(), label: "Campaign generator", href: "/marketing/campaign-generator", variant: "ghost" },
        ],
        navigateTo: href,
        updatedEntity: { type: "marketing", label: `${count} content ideas` },
        activityEntry: activity("marketing", "Started content generation", `${count} items`, href),
      }
    }

    case "analyze_business":
      return {
        reply:
          "Your business KPIs, revenue trends, and member health scores are on the dashboard. I can also open Analytics for deeper charts.",
        suggestedActions: [
          { id: id(), label: "Open dashboard", href: "/dashboard", variant: "primary" },
          { id: id(), label: "Analytics", href: "/analytics", variant: "secondary" },
        ],
        navigateTo: "/dashboard",
      }

    case "summarize_dashboard":
      return {
        reply:
          "Here's your command center — today's sessions, at-risk alerts, KPIs, and quick actions are all on the dashboard.",
        suggestedActions: [
          { id: id(), label: "Go to dashboard", href: "/dashboard", variant: "primary" },
          { id: id(), label: "Today's sessions", href: "/sessions", variant: "secondary" },
        ],
        navigateTo: "/dashboard",
      }

    case "member_workout": {
      const memberId = pageContext.memberId
      if (!memberId) {
        return handlePlatformIntent({
          ...input,
          intent: { intent: "create_workout" },
        })
      }
      const member = members.find((m) => m.id === memberId)
      const name = member?.full_name ?? pageContext.memberName ?? "this member"
      return {
        reply: `I'll open AI Coach for ${name} with workout context — or you can build a plan manually.`,
        suggestedActions: [
          {
            id: id(),
            label: "Ask AI Coach",
            href: `/ai-coach?member=${memberId}`,
            variant: "primary",
          },
          { id: id(), label: "Create workout", href: "/workouts/new", variant: "secondary" },
          {
            id: id(),
            label: "Assign existing plan",
            href: `/workouts?assignMember=${memberId}`,
            variant: "ghost",
          },
        ],
        updatedEntity: { type: "member", id: memberId, label: name },
      }
    }

    case "navigate": {
      const routes: Record<string, string> = {
        dashboard: "/dashboard",
        members: "/members",
        workouts: "/workouts",
        nutrition: "/nutrition",
        sessions: "/sessions",
        progress: "/progress",
        marketing: "/marketing",
        analytics: "/analytics",
        settings: "/settings",
        "ai coach": "/ai-coach",
      }
      const key = intent.target.replace(/[^a-z ]/gi, "").trim()
      const href = routes[key] ?? `/dashboard`
      return {
        reply: `Opening ${key || "that page"}.`,
        navigateTo: href,
        suggestedActions: [{ id: id(), label: "Go now", href, variant: "primary" }],
      }
    }

    case "conversational":
    default:
      return {
        reply: `I'm your ZyntixAI operating assistant. You're on ${contextLabel(pageContext.kind)}. Try:\n• “Create a new workout plan”\n• “Assign today's workout to Sarah”\n• “Schedule a session tomorrow at 3 PM”\n• “Show members at risk”\n• “Generate five Instagram posts”`,
        suggestedActions: [
          { id: id(), label: "Dashboard", href: "/dashboard", variant: "secondary" },
          { id: id(), label: "AI Coach", href: "/ai-coach", variant: "secondary" },
          { id: id(), label: "Marketing", href: "/marketing/content-ideas", variant: "secondary" },
        ],
      }
  }
}

function handleMemberIntent(
  command: string,
  pageContext: PlatformPageContext,
): PlatformCommandResponse {
  if (/workout/i.test(command)) {
    return {
      reply: "Opening your workouts.",
      navigateTo: "/my-workouts",
      suggestedActions: [
        { id: id(), label: "My workouts", href: "/my-workouts", variant: "primary" },
      ],
    }
  }
  if (/nutrition|meal/i.test(command)) {
    return {
      reply: "Opening your nutrition plan.",
      navigateTo: "/my-nutrition",
      suggestedActions: [
        { id: id(), label: "My nutrition", href: "/my-nutrition", variant: "primary" },
      ],
    }
  }
  return {
    reply:
      "As a member, you can ask about your workouts, nutrition, check-ins, or progress.",
    suggestedActions: [
      { id: id(), label: "My workouts", href: "/my-workouts", variant: "primary" },
      { id: id(), label: "Log check-in", href: "/my-check-ins", variant: "secondary" },
      { id: id(), label: "My progress", href: "/progress", variant: "ghost" },
    ],
  }
}

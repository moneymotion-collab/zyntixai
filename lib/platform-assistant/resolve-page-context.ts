import type { PageContextKind, PlatformPageContext } from "./types"

export function resolvePageContext(pathname: string): PlatformPageContext {
  const base: PlatformPageContext = { pathname, kind: "generic" }

  if (pathname === "/dashboard") return { ...base, kind: "dashboard" }
  if (pathname === "/members") return { ...base, kind: "members" }
  if (pathname === "/coach-workspace") return { ...base, kind: "coach_workspace" }
  if (pathname === "/analytics") return { ...base, kind: "analytics" }
  if (pathname === "/ai-coach") return { ...base, kind: "ai_coach" }
  if (pathname === "/nutrition") return { ...base, kind: "nutrition" }
  if (pathname === "/sessions") return { ...base, kind: "sessions" }
  if (pathname.startsWith("/progress")) return { ...base, kind: "progress" }
  if (pathname === "/workouts" || pathname === "/workouts/new") {
    return { ...base, kind: "workouts" }
  }

  const memberMatch = pathname.match(/^\/members\/([^/]+)$/)
  if (memberMatch) {
    return {
      ...base,
      kind: "member_profile",
      memberId: memberMatch[1],
    }
  }

  const workoutMatch = pathname.match(/^\/workouts\/([^/]+)$/)
  if (workoutMatch && workoutMatch[1] !== "new") {
    return {
      ...base,
      kind: "workout_detail",
      workoutPlanId: workoutMatch[1],
    }
  }

  if (pathname === "/marketing" || pathname.startsWith("/marketing/")) {
    const module = pathname.replace("/marketing/", "").split("/")[0] || "dashboard"
    return {
      ...base,
      kind: pathname === "/marketing" ? "marketing" : "marketing_content",
      marketingModule: module,
    }
  }

  if (pathname.startsWith("/marketing-ai")) {
    return { ...base, kind: "marketing", marketingModule: "coach" }
  }

  if (pathname.startsWith("/settings")) {
    return { ...base, kind: "settings" }
  }

  return base
}

export function contextLabel(kind: PageContextKind): string {
  const labels: Record<PageContextKind, string> = {
    dashboard: "Dashboard",
    member_profile: "Member profile",
    workouts: "Workouts",
    workout_detail: "Workout plan",
    nutrition: "Nutrition",
    sessions: "Sessions",
    progress: "Progress",
    marketing: "Marketing",
    marketing_content: "Marketing content",
    ai_coach: "AI Coach",
    analytics: "Analytics",
    members: "Members",
    coach_workspace: "Coach workspace",
    settings: "Settings",
    generic: "ZyntixAI",
  }
  return labels[kind]
}

import type { PlatformAssistantRole, PlatformPageContext } from "./types"

export type PermissionCheck = {
  allowed: boolean
  reason?: string
}

export function canUsePlatformAssistant(role: PlatformAssistantRole): PermissionCheck {
  if (!role) {
    return { allowed: false, reason: "Sign in to use the AI assistant." }
  }
  return { allowed: true }
}

export function canAccessMemberData(
  role: PlatformAssistantRole,
  memberCoachId: string | null,
  userId: string,
): PermissionCheck {
  if (role === "admin") return { allowed: true }
  if (role === "coach") {
    if (memberCoachId === userId) return { allowed: true }
    return { allowed: false, reason: "You can only manage your own clients." }
  }
  return { allowed: false, reason: "Coaches and admins only." }
}

export function filterIntentsForRole(
  role: PlatformAssistantRole,
  context: PlatformPageContext,
): string {
  if (role === "member") {
    return "Member portal: only personal workouts, nutrition, check-ins, and progress."
  }
  if (role === "coach") {
    return "Coach: manage own roster, workouts, nutrition, sessions, marketing."
  }
  return "Admin: full platform access."
}

import { canAccessApp, type AppAccessProfile } from "@/lib/app-access"
import { normalizeRole } from "@/lib/auth/roles"
import {
  resolveSubscription,
  type SubscriptionStatus,
} from "@/lib/subscription"

export type SubscriptionProfile = AppAccessProfile

export function hasSubscriptionAccess(profile: SubscriptionProfile | null): boolean {
  return canAccessApp(profile)
}

export function isTrialExpired(profile: SubscriptionProfile | null): boolean {
  if (!profile) return false

  const role = normalizeRole(profile.role)
  if (role !== "coach" && role !== "member") return false

  return resolveSubscription(profile).status === "expired"
}

export function getDisplaySubscriptionStatus(
  profile: Pick<SubscriptionProfile, "subscription_status" | "trial_ends_at" | "role" | "coach_status"> | null,
): SubscriptionStatus | null {
  if (!profile) return null
  return resolveSubscription(profile).status
}

export function needsSubscriptionUpgrade(
  profile: Pick<SubscriptionProfile, "subscription_status" | "trial_ends_at" | "role" | "coach_status"> | null,
): boolean {
  return resolveSubscription(profile).needsUpgrade
}

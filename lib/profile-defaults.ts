import { COACH_STATUS } from "@/lib/coach-status"
import { getTrialEndsAt } from "@/lib/coach-trial"
import type { Database } from "@/lib/database.types"
import { SUBSCRIPTION_STATUS } from "@/lib/subscription"

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"]

/** Member and coach: 7-day trial on signup. Coaches are auto-approved (only rejected is blocked). */
export function buildNewProfileFields(
  role: "member" | "coach",
): Pick<
  ProfileInsert,
  "role" | "subscription_status" | "trial_ends_at" | "coach_status"
> {
  if (role === "member") {
    return {
      role: "member",
      subscription_status: SUBSCRIPTION_STATUS.trial,
      trial_ends_at: getTrialEndsAt(),
      coach_status: null,
    }
  }

  return {
    role: "coach",
    subscription_status: SUBSCRIPTION_STATUS.trial,
    trial_ends_at: getTrialEndsAt(),
    coach_status: COACH_STATUS.approved,
  }
}

/** @deprecated Use buildNewProfileFields("coach") */
export function buildCoachProfileWithTrial(): Pick<
  ProfileInsert,
  "role" | "subscription_status" | "trial_ends_at" | "coach_status"
> {
  return buildNewProfileFields("coach")
}

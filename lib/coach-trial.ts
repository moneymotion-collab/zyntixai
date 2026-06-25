export const COACH_TRIAL_DAYS = 7

const MS_PER_DAY = 24 * 60 * 60 * 1000

export type TrialCheckProfile = {
  subscription_status: string | null
  trial_ends_at: string | null
}

/** Trial is active when `trial_ends_at` is set and in the future. */
export function isProfileTrialActive(
  profile: TrialCheckProfile | null | undefined,
): boolean {
  const hasActiveTrial =
    profile?.trial_ends_at &&
    new Date(profile.trial_ends_at).getTime() > Date.now()
  return Boolean(hasActiveTrial)
}

/** ISO timestamp for coach trial end (now + 7 days). */
export function getTrialEndsAt(): string {
  return new Date(Date.now() + COACH_TRIAL_DAYS * MS_PER_DAY).toISOString()
}

export function isTrialEnded(
  trial_ends_at: Date | string | null | undefined,
): boolean {
  if (!trial_ends_at) return false
  return new Date(trial_ends_at).getTime() <= Date.now()
}

export function getTrialStatusMessage(
  trial_ends_at: Date | string | null | undefined,
): "trial ended" | "trial not started" | null {
  if (!trial_ends_at) {
    return "trial not started"
  }

  if (isTrialEnded(trial_ends_at)) {
    return "trial ended"
  }

  return null
}

/** Date-only check on a single timestamp. */
export function isTrialActive(
  trial_end_date: Date | string | null | undefined,
): boolean {
  if (!trial_end_date) return false
  return new Date(trial_end_date).getTime() > Date.now()
}

export function getTrialDaysRemaining(
  trial_end_date: Date | string | null | undefined,
): number | null {
  if (!trial_end_date) return null

  const end = new Date(trial_end_date)
  const diffMs = end.getTime() - Date.now()

  if (diffMs <= 0) return 0

  return Math.ceil(diffMs / MS_PER_DAY)
}

export function formatTrialEndsAt(
  trial_end_date: Date | string | null | undefined,
): string | null {
  if (!trial_end_date) return null

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(trial_end_date))
}

export function getCoachTrialDates() {
  const trial_start_date = new Date()
  const trial_ends_at = getTrialEndsAt()

  return {
    trial_start_date,
    trial_end_date: new Date(trial_ends_at),
    trial_ends_at,
  }
}

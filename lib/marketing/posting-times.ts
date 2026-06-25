import { normalizeScheduledDate } from "@/lib/marketing/normalize-scheduled-date"
import { normalizePlatformName } from "@/lib/marketing/social-publish/match-platform"

const BEST_POSTING_TIMES: Record<string, string[]> = {
  instagram: ["09:00", "12:00", "18:00"],
  tiktok: ["11:00", "15:00", "20:00"],
  linkedin: ["08:00", "13:00", "17:00"],
}

const DEFAULT_POST_SLOT_TIMES = ["09:00", "12:00", "15:00", "18:00", "20:00"]

export function getBestPostingTimes(platform: string): string[] {
  const key = normalizePlatformName(platform)
  return BEST_POSTING_TIMES[key] ?? ["12:00"]
}

export function scoreTime(hour: number): number {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) return 0.3
  if (hour >= 18 && hour <= 21) return 1.0
  if (hour >= 11 && hour <= 14) return 0.8
  if (hour >= 6 && hour <= 9) return 0.6
  return 0.3
}

export function scorePostingTime(time: string): number {
  const hour = Number.parseInt(time.split(":")[0] ?? "", 10)
  return scoreTime(hour)
}

export function getBestPostingTime(platform: string): string {
  const times = getBestPostingTimes(platform)
  return times.reduce((best, time) =>
    scorePostingTime(time) > scorePostingTime(best) ? time : best,
  )
}

export function getBestPostTime(index: number): Date {
  const times = DEFAULT_POST_SLOT_TIMES
  const baseDate = new Date()
  const selectedTime = times[index % times.length]
  const [hours, minutes] = selectedTime.split(":")

  baseDate.setHours(Number(hours))
  baseDate.setMinutes(Number(minutes))
  baseDate.setSeconds(0)
  baseDate.setMilliseconds(0)

  baseDate.setDate(baseDate.getDate() + Math.floor(index / times.length))

  return baseDate
}

export function getBestPostTimeIso(index: number): string {
  return getBestPostTime(index).toISOString()
}

export function getNextBestPostTimeIso(startIndex = 0): {
  scheduledAt: string
  nextIndex: number
} {
  let index = Math.max(0, startIndex)
  const now = Date.now()

  while (getBestPostTime(index).getTime() <= now) {
    index++
  }

  return {
    scheduledAt: getBestPostTimeIso(index),
    nextIndex: index + 1,
  }
}

export function buildScheduledAtForPlanDay(
  platform: string,
  planDay: number,
): string {
  const baseDate = new Date()
  baseDate.setDate(baseDate.getDate() + (planDay - 1))
  return buildAiSuggestedScheduledFor(platform, baseDate)
}

export function buildAiSuggestedScheduledFor(
  platform: string,
  baseDate: Date = new Date(),
): string {
  const time = getBestPostingTime(platform)
  const [hours, minutes] = time.split(":").map((part) => Number.parseInt(part, 10))
  const date = new Date(baseDate)
  date.setHours(hours, Number.isFinite(minutes) ? minutes : 0, 0, 0)

  if (date.getTime() <= baseDate.getTime()) {
    date.setDate(date.getDate() + 1)
  }

  return date.toISOString()
}

export function resolveScheduledFor(
  aiSuggestedTime: string | null | undefined,
  userSelectedTime: string | null | undefined,
): string | null {
  return (
    normalizeScheduledDate(aiSuggestedTime ?? null) ??
    normalizeScheduledDate(userSelectedTime ?? null)
  )
}

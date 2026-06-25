import type { ClientGoalViewModel } from "@/lib/progress/client-goals"
import type { ClientCheckInRow } from "@/lib/progress/client-checkins"
import { filterCheckInsByMember } from "@/lib/progress/client-checkin-member-view"
import { computeClientCheckInInsights } from "@/lib/progress/compute-client-checkin-insights"
import {
  computeWeeklyProgressReport,
  getWeeklyReportPeriod,
} from "@/lib/progress/compute-weekly-progress-report"
import type { ProgressAlert } from "@/lib/progress/compute-progress-alerts"

/** Local rule-based coaching copy only — no OpenAI or other paid AI APIs. */

export type AiProgressCoachInsight = {
  scopeLabel: string
  isPersonalized: boolean
  memberSummary: string
  progressTrend: string
  biggestRisk: string
  bestPositiveSignal: string
  recommendedCoachAction: string
  suggestedMemberMessage: string
  hasData: boolean
}

type MemberOption = {
  id: string
  full_name: string | null
}

function average(values: (number | null | undefined)[]): number | null {
  const valid = values.filter(
    (value): value is number =>
      value != null && !Number.isNaN(Number(value)),
  )
  if (valid.length === 0) return null
  return valid.reduce((sum, value) => sum + value, 0) / valid.length
}

function compareCheckInsDesc(a: ClientCheckInRow, b: ClientCheckInRow): number {
  const dateCompare = b.checkin_date.localeCompare(a.checkin_date)
  if (dateCompare !== 0) return dateCompare
  return b.created_at.localeCompare(a.created_at)
}

function wellnessAverage(row: ClientCheckInRow): number | null {
  return average([row.energy, row.sleep, row.motivation])
}

function describeWellnessTrend(
  recentAvg: number | null,
  priorAvg: number | null,
): string {
  if (recentAvg == null && priorAvg == null) {
    return "Not enough wellness scores yet to establish a trend."
  }

  if (priorAvg == null) {
    return `Recent wellness average is ${recentAvg!.toFixed(1)}/10 across latest check-ins.`
  }

  if (recentAvg == null) {
    return "Earlier check-ins exist, but recent wellness scores are missing."
  }

  const delta = recentAvg - priorAvg
  if (Math.abs(delta) < 0.4) {
    return `Wellness is holding steady around ${recentAvg.toFixed(1)}/10 compared with earlier check-ins.`
  }

  if (delta > 0) {
    return `Wellness is improving — recent average ${recentAvg.toFixed(1)}/10, up from ${priorAvg.toFixed(1)}/10.`
  }

  return `Wellness is dipping — recent average ${recentAvg.toFixed(1)}/10, down from ${priorAvg.toFixed(1)}/10.`
}

function splitRecentPriorCheckIns(memberCheckIns: ClientCheckInRow[]): {
  recent: ClientCheckInRow[]
  prior: ClientCheckInRow[]
} {
  const sorted = [...memberCheckIns].sort(compareCheckInsDesc)
  return {
    recent: sorted.slice(0, 3),
    prior: sorted.slice(3, 6),
  }
}

function pickTopAlert(alerts: ProgressAlert[]): ProgressAlert | null {
  const severityOrder = { high: 0, medium: 1, low: 2 }
  return [...alerts].sort(
    (left, right) => severityOrder[left.severity] - severityOrder[right.severity],
  )[0] ?? null
}

function buildMemberMessage(
  memberName: string,
  positive: string,
  action: string,
): string {
  const firstName = memberName.split(" ")[0] ?? memberName
  return `Hi ${firstName}, I reviewed your recent check-ins. ${positive} ${action} Let me know how you're feeling and if anything feels off this week.`
}

function computeSingleMemberCoachInsight(
  memberId: string,
  memberName: string,
  checkIns: ClientCheckInRow[],
  goals: ClientGoalViewModel[],
  alerts: ProgressAlert[],
): AiProgressCoachInsight {
  const memberCheckIns = checkIns
  const { recent, prior } = splitRecentPriorCheckIns(memberCheckIns)
  const weeklyReport = computeWeeklyProgressReport(
    checkIns,
    memberId,
    memberName,
  )
  const period = getWeeklyReportPeriod()

  const weekCheckIns = memberCheckIns.filter(
    (row) => row.checkin_date >= period.start && row.checkin_date <= period.end,
  )
  const activeGoals = goals.filter((goal) => goal.status !== "completed")
  const completedGoals = goals.filter((goal) => goal.status === "completed")
  const memberAlerts = alerts.filter((alert) => alert.memberId === memberId)

  const recentWellness = average(recent.map(wellnessAverage))
  const priorWellness = average(prior.map(wellnessAverage))
  const latest = recent[0] ?? null

  const hasData =
    memberCheckIns.length > 0 || goals.length > 0 || memberAlerts.length > 0

  const memberSummary = hasData
    ? `${memberName} has ${weekCheckIns.length} check-in${weekCheckIns.length === 1 ? "" : "s"} this week, ${activeGoals.length} active goal${activeGoals.length === 1 ? "" : "s"}, and ${memberAlerts.length} open alert${memberAlerts.length === 1 ? "" : "s"}.`
    : `${memberName} has no check-ins, goals, or alerts logged yet.`

  let progressTrend = describeWellnessTrend(recentWellness, priorWellness)

  if (weeklyReport?.weightChange != null) {
    const direction =
      weeklyReport.weightChange > 0
        ? "up"
        : weeklyReport.weightChange < 0
          ? "down"
          : "flat"
    progressTrend += ` Weight is ${direction} ${Math.abs(weeklyReport.weightChange).toFixed(1)} kg this week.`
  }

  const topAlert = pickTopAlert(memberAlerts)
  let biggestRisk = "No major risks detected from current check-in and goal data."

  if (topAlert) {
    biggestRisk = `${topAlert.alertTypeLabel}: ${topAlert.reason}`
  } else if (weeklyReport?.biggestConcern) {
    biggestRisk = `Lowest wellness area this week: ${weeklyReport.biggestConcern}.`
  } else if (activeGoals.some((goal) => goal.status === "behind_schedule")) {
    const behind = activeGoals.find((goal) => goal.status === "behind_schedule")
    biggestRisk = `Goal "${behind?.title}" is behind schedule at ${behind?.progressPercent}%.`
  }

  let bestPositiveSignal =
    "Consistent logging will unlock stronger positive signals — encourage the next check-in."

  if (latest) {
    const scores = [
      { label: "energy", value: latest.energy },
      { label: "sleep", value: latest.sleep },
      { label: "motivation", value: latest.motivation },
    ].filter((item) => item.value != null) as { label: string; value: number }[]

    if (scores.length > 0) {
      const best = scores.reduce((max, item) => (item.value > max.value ? item : max))
      if (best.value >= 7) {
        bestPositiveSignal = `Strong ${best.label} at ${best.value}/10 on the latest check-in.`
      }
    }
  }

  if (completedGoals.length > 0) {
    bestPositiveSignal = `Completed goal "${completedGoals[0].title}" — strong momentum to build on.`
  } else if (
    activeGoals.some((goal) => goal.status === "on_track" && goal.progressPercent >= 50)
  ) {
    const onTrack = activeGoals.find(
      (goal) => goal.status === "on_track" && goal.progressPercent >= 50,
    )
    bestPositiveSignal = `"${onTrack?.title}" is ${onTrack?.progressPercent}% complete and on track.`
  }

  let recommendedCoachAction =
    weeklyReport?.suggestedCoachFocus ??
    "Schedule a quick check-in to review progress and set one clear focus for the week."

  if (topAlert) {
    recommendedCoachAction = topAlert.suggestedAction
  }

  const positiveSnippet =
    bestPositiveSignal.includes("Strong") || bestPositiveSignal.includes("Completed")
      ? bestPositiveSignal.replace(/\.$/, "") + "."
      : "Thanks for staying engaged with your check-ins."

  const actionSnippet =
    topAlert?.alertType === "low_motivation"
      ? "I'd love to reset your goals together and pick one win for this week."
      : topAlert?.alertType === "poor_sleep"
        ? "Let's tighten your recovery routine and sleep habits."
        : topAlert?.alertType === "low_energy"
          ? "Let's review training load and fueling to bring energy back up."
          : "Let's keep building on what's working."

  const suggestedMemberMessage = buildMemberMessage(
    memberName,
    positiveSnippet,
    actionSnippet,
  )

  return {
    scopeLabel: memberName,
    isPersonalized: true,
    memberSummary,
    progressTrend,
    biggestRisk,
    bestPositiveSignal,
    recommendedCoachAction,
    suggestedMemberMessage,
    hasData,
  }
}

function computeRosterCoachInsight(
  members: MemberOption[],
  checkIns: ClientCheckInRow[],
  goals: ClientGoalViewModel[],
  alerts: ProgressAlert[],
): AiProgressCoachInsight {
  const rosterInsights = computeClientCheckInInsights(checkIns)
  const period = getWeeklyReportPeriod()
  const weekCheckIns = checkIns.filter(
    (row) => row.checkin_date >= period.start && row.checkin_date <= period.end,
  )
  const highAlerts = alerts.filter((alert) => alert.severity === "high")
  const behindGoals = goals.filter((goal) => goal.status === "behind_schedule")
  const onTrackGoals = goals.filter((goal) => goal.status === "on_track")
  const completedGoals = goals.filter((goal) => goal.status === "completed")

  const hasData =
    checkIns.length > 0 || goals.length > 0 || alerts.length > 0 || members.length > 0

  const memberSummary = hasData
    ? `Coaching ${members.length} member${members.length === 1 ? "" : "s"} with ${weekCheckIns.length} check-in${weekCheckIns.length === 1 ? "" : "s"} this week, ${goals.length} goal${goals.length === 1 ? "" : "s"}, and ${alerts.length} active alert${alerts.length === 1 ? "" : "s"}.`
    : "No member check-in or goal data available yet."

  let progressTrend = "Roster trend data will appear once members begin logging check-ins."

  if (rosterInsights.averageEnergy != null) {
    progressTrend = `Roster wellness averages: energy ${rosterInsights.averageEnergy.toFixed(1)}/10, sleep ${rosterInsights.averageSleep?.toFixed(1) ?? "—"}/10, motivation ${rosterInsights.averageMotivation?.toFixed(1) ?? "—"}/10.`
  }

  if (rosterInsights.averageWeightChange != null) {
    progressTrend += ` Average weight change across members is ${rosterInsights.averageWeightChange > 0 ? "+" : ""}${rosterInsights.averageWeightChange.toFixed(1)} kg.`
  }

  let biggestRisk = "No urgent roster risks detected right now."

  if (highAlerts.length > 0) {
    const top = highAlerts[0]
    biggestRisk = `${top.memberName} — ${top.alertTypeLabel}: ${top.reason}`
  } else if (alerts.length > 0) {
    const top = pickTopAlert(alerts)!
    biggestRisk = `${top.memberName} — ${top.alertTypeLabel}: ${top.reason}`
  } else if (behindGoals.length > 0) {
    biggestRisk = `${behindGoals[0].memberName}'s goal "${behindGoals[0].title}" is behind schedule.`
  } else if (rosterInsights.membersNeedingAttention > 0) {
    biggestRisk = `${rosterInsights.membersNeedingAttention} member${rosterInsights.membersNeedingAttention === 1 ? "" : "s"} flagged for low wellness scores.`
  }

  let bestPositiveSignal =
    "Your roster is stable — keep reinforcing consistent weekly check-ins."

  if (completedGoals.length > 0) {
    bestPositiveSignal = `${completedGoals[0].memberName} completed "${completedGoals[0].title}".`
  } else if (onTrackGoals.length > 0) {
    const best = [...onTrackGoals].sort(
      (left, right) => right.progressPercent - left.progressPercent,
    )[0]
    bestPositiveSignal = `${best.memberName} is on track with "${best.title}" at ${best.progressPercent}%.`
  } else if (
    rosterInsights.averageEnergy != null &&
    rosterInsights.averageEnergy >= 7 &&
    (rosterInsights.averageSleep ?? 0) >= 7
  ) {
    bestPositiveSignal = "Roster wellness averages are strong at 7+ across energy and sleep."
  }

  let recommendedCoachAction =
    "Prioritize members with high-severity alerts and confirm check-ins are scheduled this week."

  if (highAlerts.length > 0) {
    recommendedCoachAction = highAlerts[0].suggestedAction
  } else if (behindGoals.length > 0) {
    recommendedCoachAction =
      "Review behind-schedule goals and adjust timelines or weekly actions with affected members."
  } else if (rosterInsights.membersNeedingAttention > 0) {
    recommendedCoachAction =
      "Reach out to members with low wellness scores and address recovery, sleep, or motivation gaps."
  }

  const suggestedMemberMessage =
    "Hi team — great work staying on your plans this week. Keep logging your check-ins so we can spot what's working early and adjust quickly together."

  return {
    scopeLabel: "All members",
    isPersonalized: false,
    memberSummary,
    progressTrend,
    biggestRisk,
    bestPositiveSignal,
    recommendedCoachAction,
    suggestedMemberMessage,
    hasData,
  }
}

export function computeAiProgressCoachInsight(input: {
  members: MemberOption[]
  checkIns: ClientCheckInRow[]
  goals: ClientGoalViewModel[]
  alerts: ProgressAlert[]
  memberFilter: string
  memberName?: string
}): AiProgressCoachInsight {
  const scopedCheckIns = filterCheckInsByMember(
    input.checkIns,
    input.memberFilter,
    input.memberName,
  )
  const scopedGoals =
    input.memberFilter === "all"
      ? input.goals
      : input.goals.filter((goal) => goal.memberId === input.memberFilter)
  const scopedAlerts =
    input.memberFilter === "all"
      ? input.alerts
      : input.alerts.filter((alert) => alert.memberId === input.memberFilter)

  if (input.memberFilter !== "all" && input.memberName) {
    return computeSingleMemberCoachInsight(
      input.memberFilter,
      input.memberName,
      scopedCheckIns,
      scopedGoals,
      scopedAlerts,
    )
  }

  return computeRosterCoachInsight(
    input.members,
    scopedCheckIns,
    scopedGoals,
    scopedAlerts,
  )
}

import type { CoachOverviewData } from "@/lib/coach-dashboard/types"

export type CommandCenterStatusVariant = "success" | "warning" | "info" | "neutral"

export type CommandCenterStatus = {
  label: string
  variant: CommandCenterStatusVariant
}

export function resolveCommandCenterStatus(
  data: Pick<
    CoachOverviewData,
    "stats" | "todaySessions" | "atRiskMembers" | "coachPerformance"
  >,
): CommandCenterStatus {
  const { stats, todaySessions, atRiskMembers, coachPerformance } = data

  if (stats.memberCount === 0) {
    return { label: "Getting started", variant: "neutral" }
  }

  if (
    atRiskMembers.summary.highRiskCount > 0 ||
    stats.openProgressAlerts > 0 ||
    stats.membersNeedingAttention > 0
  ) {
    return { label: "Attention required", variant: "warning" }
  }

  if (todaySessions.length > 0) {
    const count = todaySessions.length
    return {
      label: `${count} session${count === 1 ? "" : "s"} today`,
      variant: "info",
    }
  }

  if (
    coachPerformance.overallStatus === "excellent" ||
    coachPerformance.overallStatus === "good"
  ) {
    return { label: "All systems operational", variant: "success" }
  }

  return { label: "Coach command center active", variant: "success" }
}

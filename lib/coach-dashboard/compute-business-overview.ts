import type {
  CoachBusinessOverview,
  CoachBusinessSettings,
  BusinessTrendPoint,
} from "@/lib/coach-dashboard/types"

export const DEFAULT_REVENUE_PER_MEMBER = 150

/** Demo client rate used for projected revenue until Stripe is connected. */
export const DEMO_CLIENT_MONTHLY_PRICE = 90

export function computeProjectedDemoRevenue(activeMembers: number): number {
  return activeMembers * DEMO_CLIENT_MONTHLY_PRICE
}

export function formatProjectedMonthlyRevenue(
  amount: number,
  currency = "USD",
): string {
  return `${formatBusinessCurrency(amount, currency)}/mo`
}

type MemberLike = {
  id: string
  status: string | null
  created_at: string | null
}

export function isActiveMemberStatus(status: string | null | undefined): boolean {
  const normalized = (status ?? "").trim().toLowerCase()
  if (!normalized || normalized === "active") return true
  return !["inactive", "paused", "cancelled", "canceled", "archived"].includes(
    normalized,
  )
}

function monthKeyFromDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}`
}

function monthLabelFromKey(key: string): string {
  const [year, month] = key.split("-").map(Number)
  return new Date(year, month - 1, 1).toLocaleDateString("en-US", {
    month: "short",
    year: "2-digit",
  })
}

export function growthPercent(current: number, previous: number): number | null {
  if (previous <= 0) {
    return current > 0 ? 100 : null
  }
  return Math.round(((current - previous) / previous) * 1000) / 10
}

function buildMonthlyTrends(
  members: MemberLike[],
  revenuePerMember: number,
  months = 6,
): BusinessTrendPoint[] {
  const now = new Date()
  const points: BusinessTrendPoint[] = []

  for (let offset = months - 1; offset >= 0; offset -= 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - offset, 1)
    const key = monthKeyFromDate(monthDate)
    const monthEnd = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    )

    const membersInMonth = members.filter((member) => {
      if (!member.created_at) return false
      return new Date(member.created_at) <= monthEnd
    })

    const activeInMonth = membersInMonth.filter((member) =>
      isActiveMemberStatus(member.status),
    ).length

    const newMembers = members.filter((member) => {
      if (!member.created_at) return false
      const created = new Date(member.created_at)
      return monthKeyFromDate(created) === key
    }).length

    points.push({
      monthKey: key,
      monthLabel: monthLabelFromKey(key),
      memberCount: membersInMonth.length,
      newMembers,
      activeMembers: activeInMonth,
      estimatedRevenue: activeInMonth * revenuePerMember,
    })
  }

  return points
}

export function computeBusinessOverview(input: {
  members: MemberLike[]
  activeWorkoutPlans: number
  activeNutritionPlans: number
  sessionsThisMonth: number
  settings: CoachBusinessSettings
}): CoachBusinessOverview {
  const { members, activeWorkoutPlans, activeNutritionPlans, sessionsThisMonth, settings } =
    input

  const revenuePerMember = settings.revenuePerMember
  const now = new Date()
  const currentMonthKey = monthKeyFromDate(now)
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const previousMonthKey = monthKeyFromDate(previousMonthDate)

  const totalMembers = members.length
  const activeMembers = members.filter((member) =>
    isActiveMemberStatus(member.status),
  ).length

  const newMembersThisMonth = members.filter((member) => {
    if (!member.created_at) return false
    return monthKeyFromDate(new Date(member.created_at)) === currentMonthKey
  }).length

  const membersAtStartOfMonth = members.filter((member) => {
    if (!member.created_at) return false
    const created = new Date(member.created_at)
    return monthKeyFromDate(created) < currentMonthKey
  }).length

  const activeMembersAtStartOfMonth = members.filter((member) => {
    if (!member.created_at) return false
    const created = new Date(member.created_at)
    return (
      monthKeyFromDate(created) < currentMonthKey &&
      isActiveMemberStatus(member.status)
    )
  }).length

  const estimatedMonthlyRevenue = activeMembers * revenuePerMember
  const estimatedAnnualRevenue = estimatedMonthlyRevenue * 12

  const memberGrowthPercent = growthPercent(totalMembers, membersAtStartOfMonth)
  const previousMonthRevenue = activeMembersAtStartOfMonth * revenuePerMember
  const revenueGrowthPercent = growthPercent(
    estimatedMonthlyRevenue,
    previousMonthRevenue,
  )

  const trend = buildMonthlyTrends(members, revenuePerMember)
  const currentTrend = trend.find((point) => point.monthKey === currentMonthKey)
  const previousTrend = trend.find((point) => point.monthKey === previousMonthKey)

  const memberGrowthPercentFromTrend =
    currentTrend && previousTrend
      ? growthPercent(currentTrend.memberCount, previousTrend.memberCount)
      : memberGrowthPercent

  const revenueGrowthPercentFromTrend =
    currentTrend && previousTrend
      ? growthPercent(currentTrend.estimatedRevenue, previousTrend.estimatedRevenue)
      : revenueGrowthPercent

  return {
    kpis: {
      totalMembers,
      activeMembers,
      newMembersThisMonth,
      activeWorkoutPlans,
      activeNutritionPlans,
      sessionsThisMonth,
    },
    revenue: {
      source: settings.stripeConnected ? "stripe" : "estimated",
      revenuePerMember,
      currency: settings.currency,
      estimatedMonthlyRevenue,
      estimatedAnnualRevenue,
      revenueGrowthPercent: revenueGrowthPercentFromTrend,
      memberGrowthPercent: memberGrowthPercentFromTrend,
    },
    memberGrowthTrend: trend.map((point) => ({
      monthKey: point.monthKey,
      monthLabel: point.monthLabel,
      memberCount: point.memberCount,
      newMembers: point.newMembers,
      activeMembers: point.activeMembers,
      estimatedRevenue: point.estimatedRevenue,
    })),
    revenueTrend: trend.map((point) => ({
      monthKey: point.monthKey,
      monthLabel: point.monthLabel,
      memberCount: point.memberCount,
      newMembers: point.newMembers,
      activeMembers: point.activeMembers,
      estimatedRevenue: point.estimatedRevenue,
    })),
    settings,
  }
}

export function formatBusinessCurrency(
  amount: number,
  currency = "USD",
): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatGrowthPercent(value: number | null): string {
  if (value == null) return "—"
  const prefix = value > 0 ? "+" : ""
  return `${prefix}${value}%`
}

export function firstDayOfCurrentMonthString(): string {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, "0")
  return `${y}-${m}-01`
}

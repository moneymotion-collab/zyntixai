import type { ProgressAlert } from "@/lib/progress/compute-progress-alerts"
import type { AttentionMember } from "@/lib/coach-dashboard/types"

export type CoachAction = {
  id: string
  memberId: string
  memberName: string
  title: string
  description: string
  href: string
  priority: "high" | "medium" | "low"
}

export type FocusMember = {
  memberId: string
  memberName: string
  summary: string
  href: string
  priority: "high" | "medium" | "low"
}

const SEVERITY_WEIGHT: Record<ProgressAlert["severity"], number> = {
  high: 3,
  medium: 2,
  low: 1,
}

function memberPriorityScore(
  memberId: string,
  alerts: ProgressAlert[],
  attention: AttentionMember[],
): number {
  let score = 0

  for (const alert of alerts) {
    if (alert.memberId === memberId) {
      score += SEVERITY_WEIGHT[alert.severity] * 2
    }
  }

  const attentionMember = attention.find((item) => item.memberId === memberId)
  if (attentionMember) {
    score += attentionMember.reasons.length
  }

  return score
}

export function computeFocusMembers(
  attentionMembers: AttentionMember[],
  progressAlerts: ProgressAlert[],
  limit = 3,
): FocusMember[] {
  const memberIds = new Set<string>()

  for (const alert of progressAlerts) {
    memberIds.add(alert.memberId)
  }
  for (const member of attentionMembers) {
    memberIds.add(member.memberId)
  }

  const ranked = [...memberIds]
    .map((memberId) => {
      const alert = progressAlerts.find((item) => item.memberId === memberId)
      const attention = attentionMembers.find((item) => item.memberId === memberId)
      const memberName =
        alert?.memberName ??
        attention?.memberName ??
        "Member"

      const summary = alert
        ? alert.alertTypeLabel
        : attention?.reasons.length
          ? `${attention.reasons.length} attention signal${attention.reasons.length === 1 ? "" : "s"}`
          : "Needs follow-up"

      const priority: FocusMember["priority"] = alert?.severity ?? "medium"

      return {
        memberId,
        memberName,
        summary,
        href: `/members/${memberId}`,
        priority,
        score: memberPriorityScore(memberId, progressAlerts, attentionMembers),
      }
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)

  return ranked.map(({ score: _score, ...member }) => member)
}

export function computeCoachActions(
  progressAlerts: ProgressAlert[],
  attentionMembers: AttentionMember[],
  limit = 6,
): CoachAction[] {
  const actions: CoachAction[] = []

  const sortedAlerts = [...progressAlerts].sort(
    (a, b) => SEVERITY_WEIGHT[b.severity] - SEVERITY_WEIGHT[a.severity],
  )

  for (const alert of sortedAlerts) {
    actions.push({
      id: `alert-${alert.id}`,
      memberId: alert.memberId,
      memberName: alert.memberName,
      title: alert.alertTypeLabel,
      description: alert.suggestedAction,
      href: "/progress",
      priority: alert.severity === "high" ? "high" : alert.severity === "medium" ? "medium" : "low",
    })
  }

  for (const member of attentionMembers) {
    if (actions.some((action) => action.memberId === member.memberId)) continue

    actions.push({
      id: `attention-${member.memberId}`,
      memberId: member.memberId,
      memberName: member.memberName,
      title: "Review member progress",
      description: member.reasons.join(" · "),
      href: `/members/${member.memberId}`,
      priority: "medium",
    })
  }

  return actions.slice(0, limit)
}

export function countMembersNeedingAttention(
  attentionMembers: AttentionMember[],
  progressAlerts: ProgressAlert[],
): number {
  const ids = new Set<string>()
  for (const member of attentionMembers) ids.add(member.memberId)
  for (const alert of progressAlerts) ids.add(alert.memberId)
  return ids.size
}

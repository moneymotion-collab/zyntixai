import { DEMO_MEMBER_EMAIL_DOMAIN } from "@/lib/demo/demo-members"
import type { WorkspaceMode } from "@/lib/workspace/workspace-mode"

export function isDemoMemberRecord(member: {
  email?: string | null
  is_demo?: boolean | null
}): boolean {
  if (member.is_demo === true) return true

  const email = member.email?.toLowerCase() ?? ""
  return (
    email.includes(`@${DEMO_MEMBER_EMAIL_DOMAIN}`) ||
    email.endsWith("@demo.local") ||
    email.endsWith("@demo.fitai.local")
  )
}

export function isDemoDataRow(row: { is_demo?: boolean | null }): boolean {
  return row.is_demo === true
}

export function filterMembersForWorkspace<
  T extends { email?: string | null; is_demo?: boolean | null },
>(members: T[], workspaceMode: WorkspaceMode): T[] {
  if (workspaceMode === "demo") return members
  return members.filter((member) => !isDemoMemberRecord(member))
}

export function filterDemoRowsForWorkspace<T>(
  rows: T[],
  workspaceMode: WorkspaceMode,
): T[] {
  if (workspaceMode === "demo") return rows
  return rows.filter(
    (row) => !isDemoDataRow(row as { is_demo?: boolean | null }),
  )
}

export function filterByMemberIds<T extends { member_id?: string | null }>(
  rows: T[],
  memberIds: Set<string>,
): T[] {
  return rows.filter(
    (row) => row.member_id != null && memberIds.has(row.member_id),
  )
}

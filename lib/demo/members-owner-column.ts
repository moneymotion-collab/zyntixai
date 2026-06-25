import type { Database } from "@/lib/database.types"

type MembersRow = Database["public"]["Tables"]["members"]["Row"]

export type MembersOwnerColumn = Extract<
  keyof MembersRow,
  "coach_id" | "user_id"
>

const OWNER_COLUMN_PRIORITY: MembersOwnerColumn[] = ["coach_id", "user_id"]

const MEMBERS_ROW_COLUMN_KEYS = new Set<string>(
  Object.keys({
    coach_id: true,
    user_id: true,
    is_demo: true,
    email: true,
    id: true,
  } satisfies Partial<Record<keyof MembersRow, true>>),
)

export function resolveMembersOwnerColumn(): MembersOwnerColumn {
  for (const column of OWNER_COLUMN_PRIORITY) {
    if (MEMBERS_ROW_COLUMN_KEYS.has(column)) {
      return column
    }
  }

  return "coach_id"
}

export type ClearDemoMembersResult = {
  membersDeleted: number
  filterUsed: string
  error: string | null
}

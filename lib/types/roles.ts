export const USER_ROLES = ["admin", "coach", "member"] as const

export type UserRole = (typeof USER_ROLES)[number]

export type ProfileRow = {
  id: string
  email: string | null
  role: string
  created_at: string
}

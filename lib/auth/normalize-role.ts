import type { UserRole } from "@/lib/types/roles"

const LEGACY_ROLE_MAP: Record<string, UserRole> = {
  admin: "admin",
  coach: "coach",
  member: "member",
  trainer: "coach",
  client: "member",
}

export function normalizeRole(role: string | null | undefined): UserRole | null {
  if (!role) return null
  return LEGACY_ROLE_MAP[role] ?? null
}

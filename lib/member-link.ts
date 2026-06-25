import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { reportSupabaseError } from "@/lib/errors/reportSupabaseError"

export function normalizeMemberEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Resolves the members row for the logged-in user.
 * Tries link RPC first (sets user_id), then user_id, then case-insensitive email.
 */
export async function resolveLinkedMemberId(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: rpcId, error: rpcError } = await supabase.rpc(
    "link_member_account",
  )

  if (rpcError) {
    reportSupabaseError("[member-link] link_member_account RPC failed", rpcError, {
      fallbackMessage: "Failed to link member account.",
    })
  }

  if (!rpcError && typeof rpcId === "string" && rpcId.length > 0) {
    return rpcId
  }

  const { data: byUserId, error: byUserIdError } = await supabase
    .from("members")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle()

  if (byUserIdError) {
    reportSupabaseError("[member-link] user_id lookup failed", byUserIdError, {
      fallbackMessage: "Failed to look up member by user ID.",
    })
  }

  if (byUserId?.id) {
    return byUserId.id
  }

  if (!user.email) {
    return null
  }

  const { data: byEmail, error: byEmailError } = await supabase
    .from("members")
    .select("id")
    .ilike("email", normalizeMemberEmail(user.email))
    .maybeSingle()

  if (byEmailError) {
    reportSupabaseError("[member-link] email lookup failed", byEmailError, {
      fallbackMessage: "Failed to look up member by email.",
    })
  }

  if (byEmail?.id) {
    const { error: linkError } = await supabase
      .from("members")
      .update({
        user_id: user.id,
        email: normalizeMemberEmail(user.email),
      })
      .eq("id", byEmail.id)
      .is("user_id", null)

    if (linkError) {
      reportSupabaseError("[member-link] link user_id update failed", linkError, {
        fallbackMessage: "Failed to link member user ID.",
      })
    }

    return byEmail.id
  }

  return null
}

/** True when the member row is linked to a login account. */
export function isMemberAccountLinked(
  member: { user_id?: string | null },
): boolean {
  return Boolean(member.user_id)
}

/** Coach roster: refresh user_id from existing member profiles. */
export async function refreshCoachMemberLinks(
  supabase: SupabaseClient<Database>,
): Promise<void> {
  const { error } = await supabase.rpc("refresh_coach_member_links")
  if (error) {
    console.warn("refresh_coach_member_links:", error.message)
  }
}

/** @deprecated Use resolveLinkedMemberId */
export async function linkMemberAccount(
  supabase: SupabaseClient<Database>,
): Promise<string | null> {
  return resolveLinkedMemberId(supabase)
}

export async function fetchLinkedMember<
  T extends string = "*",
>(
  supabase: SupabaseClient<Database>,
  columns: T = "*" as T,
): Promise<{ id: string; data: Record<string, unknown> } | null> {
  const memberId = await resolveLinkedMemberId(supabase)
  if (!memberId) {
    return null
  }

  const { data, error } = await supabase
    .from("members")
    .select(columns)
    .eq("id", memberId)
    .maybeSingle()

  if (error) {
    reportSupabaseError("[member-link] fetch linked member failed", error, {
      fallbackMessage: "Failed to fetch linked member.",
    })
    return null
  }

  if (!data) {
    return null
  }

  return { id: memberId, data: data as Record<string, unknown> }
}

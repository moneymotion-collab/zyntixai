import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { resolveLinkedMemberId } from "@/lib/member-link"
import { createClient } from "@/lib/supabase/server"

type CoachRequest = Database["public"]["Tables"]["coach_requests"]["Row"]
type MemberRow = Database["public"]["Tables"]["members"]["Row"]

export type CoachRequestWithMember = CoachRequest & {
  members: Pick<MemberRow, "id" | "full_name" | "email"> | null
}

const PENDING_REQUESTS_SELECT = "*, members ( id, full_name, email )"

export async function fetchPendingCoachRequests(
  supabase: SupabaseClient<Database>,
  coachId: string,
) {
  const { data, error } = await supabase
    .from("coach_requests")
    .select(PENDING_REQUESTS_SELECT)
    .eq("coach_id", coachId)
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  return {
    data: (data ?? []) as CoachRequestWithMember[],
    error,
  }
}

export async function fetchPendingCoachRequestsForCoach(coachId: string) {
  const supabase = await createClient()
  return fetchPendingCoachRequests(supabase, coachId)
}

export async function fetchCoachRequestForMember(
  supabase: SupabaseClient<Database>,
  memberId: string,
  coachId: string,
) {
  const { data, error } = await supabase
    .from("coach_requests")
    .select("id, status, coach_id, member_id, created_at, updated_at")
    .eq("member_id", memberId)
    .eq("coach_id", coachId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  return { data, error }
}

export async function requestCoachAccess(
  memberId: string,
  coachId: string,
): Promise<CoachRequest> {
  const supabase = await createClient()

  const { data: userData, error: authError } = await supabase.auth.getUser()
  if (authError) throw authError
  if (!userData.user?.email) {
    throw new Error("Not authenticated.")
  }

  const linkedMemberId = await resolveLinkedMemberId(supabase)
  if (!linkedMemberId || linkedMemberId !== memberId) {
    throw new Error("Member profile not found or access denied.")
  }

  const { data: member, error: memberError } = await supabase
    .from("members")
    .select("id")
    .eq("id", memberId)
    .maybeSingle()

  if (memberError) throw memberError
  if (!member) {
    throw new Error("Member profile not found or access denied.")
  }

  const { data, error } = await supabase
    .from("coach_requests")
    .insert({
      member_id: memberId,
      coach_id: coachId,
      status: "pending",
    })
    .select()
    .single()

  if (error) throw error

  return data
}

export async function approveCoachRequest(
  supabase: SupabaseClient<Database>,
  requestId: string,
): Promise<CoachRequest> {
  const { data, error } = await supabase.rpc("approve_coach_request", {
    p_request_id: requestId,
  })

  if (error) throw error
  if (!data) {
    throw new Error("Request not found.")
  }

  return data
}

export async function approveRequest(requestId: string): Promise<CoachRequest> {
  const supabase = await createClient()
  return approveCoachRequest(supabase, requestId)
}

export async function rejectCoachRequest(
  supabase: SupabaseClient<Database>,
  requestId: string,
): Promise<CoachRequest> {
  const { data, error } = await supabase.rpc("reject_coach_request", {
    p_request_id: requestId,
  })

  if (error) throw error
  if (!data) {
    throw new Error("Request not found.")
  }

  return data
}

export async function rejectRequest(requestId: string): Promise<CoachRequest> {
  const supabase = await createClient()
  return rejectCoachRequest(supabase, requestId)
}

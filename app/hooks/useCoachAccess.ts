"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  hasAssignedCoach,
  hasCoachAccess,
  isCoachAccessPending,
  isCoachAccessRejected,
} from "@/lib/coach-access"
import { fetchCoachRequestForMember } from "@/lib/coach-requests"
import { resolveLinkedMemberId } from "@/lib/member-link"
import { createClient } from "@/lib/supabase/client"

export function useCoachAccess(coachId: string | null) {
  const supabase = useMemo(() => createClient(), [])
  const [status, setStatus] = useState<string | null>(null)
  const [memberCoachId, setMemberCoachId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!coachId) {
      setStatus(null)
      setMemberCoachId(null)
      setError(null)
      setLoading(false)
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user?.email) {
      setStatus(null)
      setMemberCoachId(null)
      setError(null)
      setLoading(false)
      return
    }

    const memberId = await resolveLinkedMemberId(supabase)

    if (!memberId) {
      setStatus(null)
      setMemberCoachId(null)
      setError(null)
      setLoading(false)
      return
    }

    const { data: member, error: memberError } = await supabase
      .from("members")
      .select("id, coach_id")
      .eq("id", memberId)
      .maybeSingle()

    if (memberError) {
      setStatus(null)
      setMemberCoachId(null)
      setError(memberError.message)
      setLoading(false)
      return
    }

    if (!member) {
      setStatus(null)
      setMemberCoachId(null)
      setError(null)
      setLoading(false)
      return
    }

    setMemberCoachId(member.coach_id)

    const { data: request, error: requestError } =
      await fetchCoachRequestForMember(supabase, member.id, coachId)

    if (requestError) {
      setStatus(null)
      setError(requestError.message)
      setLoading(false)
      return
    }

    setStatus(request?.status ?? null)
    setError(null)
    setLoading(false)
  }, [coachId, supabase])

  useEffect(() => {
    setLoading(true)
    void load()
  }, [load])

  const hasAccess = useMemo(
    () =>
      hasCoachAccess(status) || hasAssignedCoach(memberCoachId, coachId),
    [status, memberCoachId, coachId],
  )

  return {
    status,
    hasAccess,
    isPending: isCoachAccessPending(status),
    isRejected: isCoachAccessRejected(status),
    loading,
    error,
    refetch: load,
  }
}

"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { fetchDashboardStats } from "@/lib/dashboard-stats"
import { resolveLinkedMemberId } from "@/lib/member-link"
import { createClient } from "@/lib/supabase/client"
import type { DashboardStats } from "@/lib/types/dashboard-stats"
import { useDebouncedCallback } from "./useDebouncedCallback"
import { useRole } from "./useRole"

export function useDashboardStats() {
  const supabase = useRef(createClient()).current
  const { role, loading: roleLoading, error: roleError } = useRole()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [memberId, setMemberId] = useState<string | null>(null)
  const [noMemberProfile, setNoMemberProfile] = useState(false)

  const isMember = role === "member"

  const load = useCallback(async () => {
    if (!role || !isMember) return

    setError(null)

    const linkedMemberId = await resolveLinkedMemberId(supabase)
    setMemberId(linkedMemberId)
    setNoMemberProfile(!linkedMemberId)

    const result = await fetchDashboardStats(supabase, role)

    if (result.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    setStats(result.stats)
    setLoading(false)
  }, [role, isMember, supabase])

  const debouncedLoad = useDebouncedCallback(load, 1000)

  useEffect(() => {
    if (roleLoading) return

    if (!role) {
      setLoading(false)
      return
    }

    if (!isMember) {
      setLoading(false)
      setStats(null)
      return
    }

    setLoading(true)
    void load()

    const onFocus = () => void load()
    window.addEventListener("focus", onFocus)

    return () => window.removeEventListener("focus", onFocus)
  }, [role, roleLoading, isMember, load])

  useEffect(() => {
    if (!isMember || !memberId) return

    const channel = supabase
      .channel(`dashboard-stats-member-${memberId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_assignments",
          filter: `member_id=eq.${memberId}`,
        },
        () => {
          debouncedLoad()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isMember, memberId, supabase, debouncedLoad])

  const resolvedError =
    error ??
    roleError ??
    (!roleLoading && !role
      ? "Your account has no role assigned. Contact support or sign in again."
      : null)

  return {
    stats,
    loading: roleLoading || (isMember && loading),
    error: resolvedError,
    refetch: load,
    role,
    memberId,
    noMemberProfile,
  }
}

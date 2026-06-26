"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { fetchCoachOverview } from "@/lib/coach-dashboard/fetch-coach-overview"
import type { CoachOverviewData } from "@/lib/coach-dashboard/types"
import { COACHING_CORE_CHANGED_EVENT } from "@/lib/coaching-core/notify"
import { createClient } from "@/lib/supabase/client"
import { useDebouncedCallback } from "./useDebouncedCallback"
import { useRole } from "./useRole"

export function useCoachOverview() {
  const supabase = useRef(createClient()).current
  const { role, loading: roleLoading } = useRole()
  const [data, setData] = useState<CoachOverviewData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const isCoach = role === "coach" || role === "admin"

  const load = useCallback(async () => {
    if (!isCoach) return

    setError(null)
    const result = await fetchCoachOverview(supabase)

    if (result.error) {
      setError(result.error)
      setData(null)
    } else {
      setData(result.data)
    }

    setLoading(false)
  }, [isCoach, supabase])

  const debouncedLoad = useDebouncedCallback(load, 1000)

  useEffect(() => {
    if (roleLoading) return

    if (!isCoach) {
      setLoading(false)
      return
    }

    setLoading(true)
    void load()

    const onFocus = () => void load()
    const onCoachingCoreChanged = () => void load()
    window.addEventListener("focus", onFocus)
    window.addEventListener(COACHING_CORE_CHANGED_EVENT, onCoachingCoreChanged)

    return () => {
      window.removeEventListener("focus", onFocus)
      window.removeEventListener(COACHING_CORE_CHANGED_EVENT, onCoachingCoreChanged)
    }
  }, [isCoach, roleLoading, load])

  useEffect(() => {
    if (!isCoach) return

    const channel = supabase
      .channel("coach-overview")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workout_assignments" },
        () => debouncedLoad(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workout_completions" },
        () => debouncedLoad(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "progress_logs" },
        () => debouncedLoad(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => debouncedLoad(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        () => debouncedLoad(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_checkins" },
        () => debouncedLoad(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_goals" },
        () => debouncedLoad(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_reminders" },
        () => debouncedLoad(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_habits" },
        () => debouncedLoad(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "coach_business_settings" },
        () => debouncedLoad(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isCoach, supabase, debouncedLoad])

  return {
    data,
    loading: roleLoading || (isCoach && loading),
    error,
    refetch: load,
    isCoach,
  }
}

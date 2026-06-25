"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { getCoachScope } from "@/lib/auth/coach-scope"
import { fetchCoachAssignments } from "@/lib/workout-assignments"
import { COACHING_CORE_CHANGED_EVENT } from "@/lib/coaching-core/notify"
import { createClient } from "@/lib/supabase/client"
import type { CoachWorkoutAssignment } from "@/lib/types/workout-assignments"

export function useWorkoutAssignments() {
  const supabase = useRef(createClient()).current
  const [assignments, setAssignments] = useState<CoachWorkoutAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)

    try {
      const scope = await getCoachScope(supabase)
      const data = await fetchCoachAssignments(supabase, {
        coachUserId: scope.userId,
        isAdmin: scope.isAdmin,
      })
      setAssignments(data)
      setLoading(false)
      return data
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load assignments."
      setError(message)
      setLoading(false)
      return null
    }
  }, [supabase])

  useEffect(() => {
    setLoading(true)
    load()

    const onFocus = () => load()
    const onCoachingCoreChanged = () => load()
    window.addEventListener("focus", onFocus)
    window.addEventListener(COACHING_CORE_CHANGED_EVENT, onCoachingCoreChanged)

    const channel = supabase
      .channel("coach-workout-assignments")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_assignments",
        },
        () => {
          load()
        },
      )
      .subscribe()

    return () => {
      window.removeEventListener("focus", onFocus)
      window.removeEventListener(COACHING_CORE_CHANGED_EVENT, onCoachingCoreChanged)
      supabase.removeChannel(channel)
    }
  }, [load, supabase])

  return { assignments, loading, error, refetch: load }
}

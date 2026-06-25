"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { fetchMyWorkouts } from "@/lib/my-workouts"
import { createClient } from "@/lib/supabase/client"
import type { MyWorkoutsLoadState } from "@/lib/types/my-workouts"

const initialData: MyWorkoutsLoadState["data"] = {
  assignments: [],
  memberId: null,
  noMemberProfile: false,
}

export function useMyWorkouts() {
  const supabase = useRef(createClient()).current
  const [state, setState] = useState<MyWorkoutsLoadState>({
    loading: true,
    error: null,
    data: initialData,
  })

  const load = useCallback(async () => {
    setState((prev) => ({ ...prev, error: null }))

    try {
      const data = await fetchMyWorkouts(supabase)
      setState({ loading: false, error: null, data })
      return data
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load workouts."
      setState((prev) => ({
        loading: false,
        error: message,
        data: prev.data,
      }))
      return null
    }
  }, [supabase])

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true }))
    load()

    const onFocus = () => {
      load()
    }

    window.addEventListener("focus", onFocus)

    return () => {
      window.removeEventListener("focus", onFocus)
    }
  }, [load])

  useEffect(() => {
    const memberId = state.data.memberId
    if (!memberId) return

    const channel = supabase
      .channel(`my-workouts-${memberId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "workout_assignments",
          filter: `member_id=eq.${memberId}`,
        },
        () => {
          load()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [state.data.memberId, supabase, load])

  return {
    assignments: state.data.assignments,
    memberId: state.data.memberId,
    noMemberProfile: state.data.noMemberProfile,
    loading: state.loading,
    error: state.error,
    refetch: load,
  }
}

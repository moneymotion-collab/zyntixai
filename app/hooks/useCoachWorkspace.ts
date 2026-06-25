"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { fetchCoachWorkspace } from "@/lib/coach-workspace/fetch-coach-workspace"
import {
  readTaskStatuses,
  writeTaskStatus,
} from "@/lib/coach-workspace/task-status-store"
import type {
  CoachWorkspaceData,
  TaskStatus,
} from "@/lib/coach-workspace/types"
import { COACHING_CORE_CHANGED_EVENT } from "@/lib/coaching-core/notify"
import { createClient } from "@/lib/supabase/client"
import { useRole } from "./useRole"

export function useCoachWorkspace() {
  const supabase = useRef(createClient()).current
  const { role, loading: roleLoading } = useRole()
  const [data, setData] = useState<CoachWorkspaceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [coachUserId, setCoachUserId] = useState<string | null>(null)
  const [refreshRevision, setRefreshRevision] = useState(0)
  const [taskStatuses, setTaskStatuses] = useState<Record<string, TaskStatus>>(
    {},
  )
  const isMountedRef = useRef(true)

  const isCoach = role === "coach" || role === "admin"

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const syncTaskStatuses = useCallback(async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id ?? null
    if (!isMountedRef.current) return

    setCoachUserId(userId)
    if (userId) {
      setTaskStatuses(readTaskStatuses(userId))
    }
  }, [supabase])

  const applyWorkspaceData = useCallback(
    (next: CoachWorkspaceData | null, nextError: string | null) => {
      if (!isMountedRef.current) return

      if (nextError) {
        setError(nextError)
        setData(null)
        return
      }

      setError(null)
      setData(next)
      setRefreshRevision((current) => current + 1)
    },
    [],
  )

  const fetchWorkspace = useCallback(async () => {
    if (!isCoach) return null

    const result = await fetchCoachWorkspace(supabase)
    applyWorkspaceData(result.data, result.error)
    await syncTaskStatuses()

    return result.error ? null : result.data
  }, [applyWorkspaceData, isCoach, supabase, syncTaskStatuses])

  const load = useCallback(async () => {
    if (!isCoach) return null

    setError(null)
    const workspace = await fetchWorkspace()

    if (isMountedRef.current) {
      setLoading(false)
    }

    return workspace
  }, [fetchWorkspace, isCoach])

  const refetch = useCallback(async () => {
    if (!isCoach) return null

    setRefreshing(true)
    const workspace = await fetchWorkspace()

    if (isMountedRef.current) {
      setRefreshing(false)
    }

    return workspace
  }, [fetchWorkspace, isCoach])

  useEffect(() => {
    if (roleLoading) return

    if (!isCoach) {
      setLoading(false)
      return
    }

    setLoading(true)
    void load()

    const onFocus = () => void refetch()
    const onCoachingCoreChanged = () => void refetch()
    window.addEventListener("focus", onFocus)
    window.addEventListener(COACHING_CORE_CHANGED_EVENT, onCoachingCoreChanged)

    return () => {
      window.removeEventListener("focus", onFocus)
      window.removeEventListener(COACHING_CORE_CHANGED_EVENT, onCoachingCoreChanged)
    }
  }, [isCoach, roleLoading, load, refetch])

  useEffect(() => {
    if (!isCoach) return

    const channel = supabase
      .channel("coach-workspace")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "members" },
        () => void refetch(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "progress_logs" },
        () => void refetch(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "workout_assignments" },
        () => void refetch(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "member_nutrition_assignments" },
        () => void refetch(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "sessions" },
        () => void refetch(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_checkins" },
        () => void refetch(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_goals" },
        () => void refetch(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_habits" },
        () => void refetch(),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "client_reminders" },
        () => void refetch(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [isCoach, supabase, refetch])

  const setTaskStatus = useCallback(
    (taskId: string, status: TaskStatus) => {
      if (!coachUserId) return
      setTaskStatuses(writeTaskStatus(coachUserId, taskId, status))
    },
    [coachUserId],
  )

  return {
    data,
    loading: roleLoading || (isCoach && loading),
    refreshing,
    refreshRevision,
    error,
    refetch,
    isCoach,
    taskStatuses,
    setTaskStatus,
    supabase,
  }
}

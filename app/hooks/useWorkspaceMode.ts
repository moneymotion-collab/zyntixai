"use client"

import { useCallback, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { WorkspaceMode } from "@/lib/workspace/workspace-mode"

export function useWorkspaceMode(enabled: boolean) {
  const [mode, setMode] = useState<WorkspaceMode | null>(null)
  const [loading, setLoading] = useState(enabled)

  const refetch = useCallback(async () => {
    if (!enabled) {
      setMode(null)
      setLoading(false)
      return
    }

    setLoading(true)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data } = user
      ? await supabase
          .from("gym_settings")
          .select("is_demo_workspace")
          .eq("owner_id", user.id)
          .maybeSingle()
      : { data: null }

    return {
      mode: data?.is_demo_workspace ? ("demo" as const) : ("live" as const),
      hasUser: Boolean(user),
    }
  }, [enabled])

  useEffect(() => {
    let active = true

    void (async () => {
      if (!enabled) {
        if (!active) return
        setMode(null)
        setLoading(false)
        return
      }

      setLoading(true)
      const result = await refetch()

      if (!active || !result) {
        return
      }

      if (!result.hasUser) {
        setMode(null)
        setLoading(false)
        return
      }

      setMode(result.mode)
      setLoading(false)
    })()

    return () => {
      active = false
    }
  }, [enabled, refetch])

  const refetchSafe = useCallback(async () => {
    setLoading(true)
    const result = await refetch()

    if (!result) {
      setLoading(false)
      return
    }

    if (!result.hasUser) {
      setMode(null)
      setLoading(false)
      return
    }

    setMode(result.mode)
    setLoading(false)
  }, [refetch])

  return { mode, loading, refetch: refetchSafe }
}

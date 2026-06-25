"use client"

import { useEffect, useState } from "react"
import { useRole } from "@/app/hooks/useRole"
import { useWorkspaceMode } from "@/app/hooks/useWorkspaceMode"
import {
  readPersistedWorkspaceMode,
  type WorkspaceMode,
} from "@/lib/workspace/workspace-mode"

export function useIsDemoWorkspace() {
  const { role, loading: roleLoading } = useRole()
  const isCoach = role === "coach" || role === "admin"
  const { mode, loading: modeLoading } = useWorkspaceMode(isCoach)
  const [persistedMode, setPersistedMode] = useState<WorkspaceMode | null>(null)
  const [persistedReady, setPersistedReady] = useState(false)

  useEffect(() => {
    setPersistedMode(readPersistedWorkspaceMode())
    setPersistedReady(true)
  }, [])

  const isDemoWorkspace =
    isCoach && (mode === "demo" || persistedMode === "demo")

  return {
    isDemoWorkspace,
    loading:
      roleLoading || !persistedReady || (isCoach && modeLoading),
  }
}

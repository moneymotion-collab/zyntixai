import type { WorkspaceMode } from "@/lib/workspace/workspace-mode"

function isTruthyEnv(value: string | undefined): boolean {
  if (!value?.trim()) return false
  const normalized = value.trim().toLowerCase()
  return normalized === "1" || normalized === "true" || normalized === "yes"
}

/** Mock sync only in demo workspace or when ANALYTICS_MOCK_SYNC is explicitly enabled. */
export function isMockSyncEnabled(workspaceMode: WorkspaceMode = "live"): boolean {
  if (isTruthyEnv(process.env.ANALYTICS_MOCK_SYNC)) {
    return true
  }

  return workspaceMode === "demo"
}

import type { SupabaseClient } from "@supabase/supabase-js"
import { saveCoachGymName } from "@/lib/auth/save-coach-gym"
import { DEMO_COACH_PROFILE_NAME } from "@/lib/demo/demo-coach-profile"
import { loadDemoWorkspaceForCoach } from "@/lib/demo/load-demo-workspace"
import type { Database } from "@/lib/database.types"

export { DEMO_COACH_PROFILE_NAME as DEMO_GYM_NAME }
export const WORKSPACE_MODE_KEY = "fitcore-workspace-mode"

export type WorkspaceMode = "live" | "demo"

export function persistWorkspaceMode(mode: WorkspaceMode): void {
  if (typeof window !== "undefined") {
    sessionStorage.setItem(WORKSPACE_MODE_KEY, mode)
  }
}

export function readPersistedWorkspaceMode(): WorkspaceMode | null {
  if (typeof window === "undefined") return null
  const value = sessionStorage.getItem(WORKSPACE_MODE_KEY)
  return value === "demo" || value === "live" ? value : null
}

export function clearPersistedWorkspaceMode(): void {
  if (typeof window !== "undefined") {
    sessionStorage.removeItem(WORKSPACE_MODE_KEY)
  }
}

export async function setDemoWorkspaceFlag(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  isDemo: boolean,
): Promise<void> {
  const { data: existing } = await supabase
    .from("gym_settings")
    .select("id")
    .eq("owner_id", ownerId)
    .maybeSingle()

  const payload = {
    is_demo_workspace: isDemo,
    ...(isDemo ? { gym_name: DEMO_COACH_PROFILE_NAME } : {}),
  }

  if (existing) {
    const { error } = await supabase
      .from("gym_settings")
      .update(payload)
      .eq("owner_id", ownerId)

    if (error?.message.includes("is_demo_workspace")) {
      return
    }

    return
  }

  const { error } = await supabase.from("gym_settings").insert({
    owner_id: ownerId,
    gym_name: isDemo ? DEMO_COACH_PROFILE_NAME : "",
    ...payload,
  })

  if (error?.message.includes("is_demo_workspace")) {
    return
  }
}

export async function enterDemoWorkspace(
  supabase: SupabaseClient<Database>,
  userId: string,
  userEmail: string | null,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const gymResult = await saveCoachGymName(supabase, userId, DEMO_COACH_PROFILE_NAME)

  if (gymResult.error) {
    return { ok: false, error: gymResult.error }
  }

  const demoResult = await loadDemoWorkspaceForCoach(
    supabase,
    userId,
    userEmail,
  )

  if (!demoResult.ok) {
    return { ok: false, error: demoResult.error }
  }

  return { ok: true }
}

export async function enterLiveWorkspace(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<void> {
  await setDemoWorkspaceFlag(supabase, ownerId, false)
}

export async function fetchWorkspaceMode(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<WorkspaceMode> {
  const { data } = await supabase
    .from("gym_settings")
    .select("is_demo_workspace")
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (data && "is_demo_workspace" in data && data.is_demo_workspace) {
    return "demo"
  }

  return "live"
}

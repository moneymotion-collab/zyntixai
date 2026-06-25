import { DEMO_MEMBER_SEEDS } from "@/lib/demo/demo-members"

/** Single source of truth for demo member count shown in UI copy. */
export const DEMO_MEMBER_COUNT = DEMO_MEMBER_SEEDS.length

export const DEMO_WORKSPACE_BANNER_TEXT =
  "Demo workspace — sample data only"

export const DEMO_WORKSPACE_LOAD_ACTION = "Load demo workspace"
export const DEMO_WORKSPACE_LOADING_LABEL = "Loading demo workspace…"
export const DEMO_WORKSPACE_LOAD_SUCCESS = "Demo workspace loaded successfully."

export const DEMO_WORKSPACE_CLEAR_DESCRIPTION =
  "Remove all demo workspace data (members, plans, sessions, progress, marketing, and video projects) without affecting your real client records."

export const DEMO_WORKSPACE_CLEAR_SUCCESS =
  "Demo data has been cleared from your account."

export const DEMO_WORKSPACE_CLEAR_LOADING_LABEL = "Clearing demo data…"

export const DEMO_WORKSPACE_CLEAR_NONE_FOUND =
  "No demo data found to clear."

export const DEMO_WORKSPACE_CLEAR_SUCCESS_MESSAGE =
  "Demo workspace data cleared successfully."

export function demoMemberCountPhrase(count = DEMO_MEMBER_COUNT): string {
  const noun = count === 1 ? "member" : "members"
  return `${count} sample ${noun}`
}

export function demoWorkspaceIncludesCopy(): string {
  return `Demo data includes ${demoMemberCountPhrase()}, workout and nutrition plans, sessions, workout completions, progress logs, check-ins, and dashboard activity — ideal for product demos and launch videos.`
}

/** Platform-wide AI operating assistant — shared types */

export type PlatformAssistantRole = "admin" | "coach" | "member" | null

export type PageContextKind =
  | "dashboard"
  | "member_profile"
  | "workouts"
  | "workout_detail"
  | "nutrition"
  | "sessions"
  | "progress"
  | "marketing"
  | "marketing_content"
  | "ai_coach"
  | "analytics"
  | "members"
  | "coach_workspace"
  | "settings"
  | "generic"

export type PlatformPageContext = {
  pathname: string
  kind: PageContextKind
  memberId?: string
  memberName?: string
  workoutPlanId?: string
  marketingModule?: string
}

export type SessionEntityRef = {
  type: "member" | "workout" | "nutrition" | "session" | "marketing" | "generic"
  id?: string
  label: string
}

export type PlatformSessionMemory = {
  messages: PlatformChatMessage[]
  lastEntity?: SessionEntityRef
  createdAt: number
}

export type PlatformChatMessage = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  timestamp: number
}

export type CommandBarChatRequest = {
  prompt: string
  history?: { role: "user" | "assistant"; content: string }[]
  pageContext?: PlatformPageContext
}

export type CommandBarChatResponse = {
  reply: string
}

export type SuggestedAction = {
  id: string
  label: string
  href?: string
  variant?: "primary" | "secondary" | "ghost"
  /** Client calls execute API when this is set */
  executeKind?: PlatformActionKind
  executePayload?: Record<string, unknown>
}

export type PlatformActionKind =
  | "schedule_session"
  | "assign_workout"
  | "navigate"

export type PendingConfirmation = {
  id: string
  summary: string
  kind: PlatformActionKind
  payload: Record<string, unknown>
}

export type ActivityLogEntry = {
  id: string
  type: string
  label: string
  detail?: string
  href?: string
  timestamp: string
}

export type PlatformCommandRequest = {
  command: string
  pageContext: PlatformPageContext
  sessionMemory: Pick<PlatformSessionMemory, "messages" | "lastEntity">
  confirmActionId?: string
}

export type PlatformCommandResponse = {
  reply: string
  suggestedActions: SuggestedAction[]
  pendingConfirmation?: PendingConfirmation
  activityEntry?: ActivityLogEntry
  navigateTo?: string
  updatedEntity?: SessionEntityRef
  /** Voice-ready: structured speech summary */
  speakableSummary?: string
}

/** Future module plugin contract */
export type PlatformAssistantModule = {
  id: string
  name: string
  /** Route prefixes this module owns */
  routePrefixes: string[]
  /** Optional intent patterns */
  intents?: RegExp[]
  handle?: (input: PlatformModuleHandleInput) => Promise<PlatformCommandResponse | null>
}

export type PlatformModuleHandleInput = {
  command: string
  pageContext: PlatformPageContext
  role: PlatformAssistantRole
  sessionMemory: Pick<PlatformSessionMemory, "messages" | "lastEntity">
}

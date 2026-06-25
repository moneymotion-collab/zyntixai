export type AiCoachRequestBody = {
  prompt: string
  memberId?: string
  threadId?: string
}

export type AiCoachResponseBody = {
  reply: string
  threadId: string
  topic: string
  status: string
  messageId: string
  contentType: string
}

export type AiMessageContentType =
  | "general"
  | "workout"
  | "nutrition"
  | "progress"

export type AiCoachThreadStatus =
  | "Awaiting reply"
  | "Suggestion sent"
  | "Resolved"

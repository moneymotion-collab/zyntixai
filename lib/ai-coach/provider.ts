import type { AiCoachContext } from "./context"

export type ChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type CreateChatCompletionOptions = {
  prompt?: string
  context?: AiCoachContext
}

export type ChatCompletionError = {
  ok: false
  error: string
  status?: number
}

export type AiProvider = "openai" | "groq"

export function getConfiguredAiProvider(): AiProvider | null {
  const explicit = process.env.AI_PROVIDER?.trim().toLowerCase()

  if (explicit === "groq" && process.env.GROQ_API_KEY?.trim()) {
    return "groq"
  }

  if (explicit === "openai" && process.env.OPENAI_API_KEY?.trim()) {
    return "openai"
  }

  if (process.env.GROQ_API_KEY?.trim()) {
    return "groq"
  }

  if (process.env.OPENAI_API_KEY?.trim()) {
    return "openai"
  }

  return null
}

export function hasAiApiKey(): boolean {
  return getConfiguredAiProvider() !== null
}

export function isAiQuotaError(error: string, status?: number): boolean {
  if (status === 429 || status === 402) return true
  const lower = error.toLowerCase()
  return (
    lower.includes("quota") ||
    lower.includes("billing") ||
    lower.includes("rate limit") ||
    lower.includes("insufficient_quota") ||
    lower.includes("exceeded your current")
  )
}

/** @deprecated Use isAiQuotaError */
export const isOpenAiQuotaError = isAiQuotaError

export function formatAiErrorMessage(
  error: string,
  status?: number,
  provider: AiProvider = "openai",
): string {
  if (isAiQuotaError(error, status)) {
    if (provider === "groq") {
      return "Groq API limit reached. Check console.groq.com, switch AI_PROVIDER=openai, or set AI_MOCK_MODE=true."
    }
    return "OpenAI API quota reached. Add credits at platform.openai.com/account/billing, set AI_PROVIDER=groq with GROQ_API_KEY, or set AI_MOCK_MODE=true."
  }
  return error
}

/** @deprecated Use formatAiErrorMessage */
export const formatOpenAiErrorMessage = formatAiErrorMessage

export function lastUserMessage(messages: ChatMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === "user") {
      return messages[i].content
    }
  }
  return ""
}

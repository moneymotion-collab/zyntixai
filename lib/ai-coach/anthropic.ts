import Anthropic from "@anthropic-ai/sdk"
import { APIError } from "@anthropic-ai/sdk"

export type AnthropicChatMessage = {
  role: "system" | "user" | "assistant"
  content: string
}

export type AnthropicChatResult =
  | { ok: true; content: string }
  | { ok: false; error: string; status?: number }

function getAnthropicClient(): Anthropic {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  })
}

export function hasAnthropicApiKey(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY?.trim())
}

export async function createAnthropicChatCompletion(
  messages: AnthropicChatMessage[],
): Promise<AnthropicChatResult> {
  if (!hasAnthropicApiKey()) {
    return {
      ok: false,
      error: "ANTHROPIC_API_KEY is not configured on the server.",
    }
  }

  const system = messages.find((message) => message.role === "system")?.content
  const conversation = messages.filter(
    (message) => message.role === "user" || message.role === "assistant",
  )

  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-20250514"

  try {
    const anthropic = getAnthropicClient()
    const response = await anthropic.messages.create({
      model,
      max_tokens: 2500,
      temperature: 0.65,
      system: system || undefined,
      messages: conversation.map((message) => ({
        role: message.role,
        content: message.content,
      })),
    })

    const content = response.content
      .filter((block) => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim()

    if (!content) {
      return { ok: false, error: "Anthropic returned an empty response." }
    }

    return { ok: true, content }
  } catch (err) {
    if (err instanceof APIError) {
      return {
        ok: false,
        error: err.message || `Anthropic request failed (${err.status ?? "unknown"}).`,
        status: err.status,
      }
    }

    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reach Anthropic.",
    }
  }
}

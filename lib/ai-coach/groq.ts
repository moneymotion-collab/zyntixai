import OpenAI from "openai"
import { APIError } from "openai"
import type {
  ChatCompletionError,
  ChatMessage,
  CreateChatCompletionOptions,
} from "@/lib/ai-coach/provider"
import { formatAiErrorMessage } from "@/lib/ai-coach/provider"

let groqClient: OpenAI | null = null

function getGroqClient(): OpenAI {
  if (!groqClient) {
    groqClient = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: "https://api.groq.com/openai/v1",
    })
  }

  return groqClient
}

export async function createGroqChatCompletion(
  messages: ChatMessage[],
  _options: CreateChatCompletionOptions = {},
): Promise<{ ok: true; content: string } | ChatCompletionError> {
  if (!process.env.GROQ_API_KEY?.trim()) {
    return {
      ok: false,
      error: "GROQ_API_KEY is not configured on the server.",
    }
  }

  const model = process.env.GROQ_MODEL ?? "llama-3.3-70b-versatile"

  try {
    const client = getGroqClient()
    const response = await client.chat.completions.create({
      model,
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      temperature: 0.65,
      max_tokens: 2500,
    })

    const content = response.choices[0]?.message?.content?.trim() ?? ""

    if (!content) {
      return { ok: false, error: "Groq returned an empty response." }
    }

    return { ok: true, content }
  } catch (err) {
    if (err instanceof APIError) {
      const message =
        err.message || `Groq request failed (${err.status ?? "unknown"}).`
      return {
        ok: false,
        error: formatAiErrorMessage(message, err.status, "groq"),
        status: err.status,
      }
    }

    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reach Groq.",
    }
  }
}

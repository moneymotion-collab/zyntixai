import OpenAI from "openai"
import { APIError } from "openai"
import { createGroqChatCompletion } from "@/lib/ai-coach/groq"
import { generateMockResponse, isAiMockMode } from "@/lib/ai-coach/mock-mode"
import type {
  ChatCompletionError,
  ChatMessage,
  CreateChatCompletionOptions,
} from "@/lib/ai-coach/provider"
import {
  formatAiErrorMessage,
  getConfiguredAiProvider,
  isAiQuotaError,
  lastUserMessage,
} from "@/lib/ai-coach/provider"

export type { ChatCompletionError, ChatMessage, CreateChatCompletionOptions }
export {
  formatAiErrorMessage,
  formatOpenAiErrorMessage,
  getConfiguredAiProvider,
  isAiQuotaError,
  isOpenAiQuotaError,
} from "@/lib/ai-coach/provider"

let openaiClient: OpenAI | null = null

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    openaiClient = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })
  }

  return openaiClient
}

async function createOpenAiChatCompletion(
  messages: ChatMessage[],
): Promise<{ ok: true; content: string } | ChatCompletionError> {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    return {
      ok: false,
      error: "OPENAI_API_KEY is not configured on the server.",
    }
  }

  const model = process.env.OPENAI_MODEL ?? "gpt-4o-mini"

  try {
    const openai = getOpenAIClient()
    const response = await openai.chat.completions.create({
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
      return { ok: false, error: "OpenAI returned an empty response." }
    }

    return { ok: true, content }
  } catch (err) {
    if (err instanceof APIError) {
      const message =
        err.message || `OpenAI request failed (${err.status ?? "unknown"}).`
      return {
        ok: false,
        error: formatAiErrorMessage(message, err.status, "openai"),
        status: err.status,
      }
    }

    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to reach OpenAI.",
    }
  }
}

export async function createChatCompletion(
  messages: ChatMessage[],
  options: CreateChatCompletionOptions = {},
): Promise<{ ok: true; content: string } | ChatCompletionError> {
  if (isAiMockMode()) {
    const prompt = options.prompt?.trim() || lastUserMessage(messages)
    return {
      ok: true,
      content: generateMockResponse(prompt, options.context),
    }
  }

  const provider = getConfiguredAiProvider()

  if (provider === "groq") {
    return createGroqChatCompletion(messages, options)
  }

  if (provider === "openai") {
    return createOpenAiChatCompletion(messages)
  }

  return {
    ok: false,
    error:
      "No AI provider configured. Set GROQ_API_KEY or OPENAI_API_KEY in .env.local.",
  }
}

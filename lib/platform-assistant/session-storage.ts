import type { PlatformSessionMemory } from "./types"

const STORAGE_KEY = "zyntix-platform-assistant-session"
const MAX_AGE_MS = 1000 * 60 * 60 * 4

export function readSessionMemory(): PlatformSessionMemory {
  if (typeof window === "undefined") {
    return { messages: [], createdAt: Date.now() }
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return { messages: [], createdAt: Date.now() }
    }

    const parsed = JSON.parse(raw) as PlatformSessionMemory
    if (!parsed?.createdAt || Date.now() - parsed.createdAt > MAX_AGE_MS) {
      return { messages: [], createdAt: Date.now() }
    }

    return {
      messages: parsed.messages ?? [],
      lastEntity: parsed.lastEntity,
      createdAt: parsed.createdAt,
    }
  } catch {
    return { messages: [], createdAt: Date.now() }
  }
}

export function writeSessionMemory(memory: PlatformSessionMemory): void {
  if (typeof window === "undefined") return
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(memory))
}

export function clearSessionMemory(): void {
  if (typeof window === "undefined") return
  window.sessionStorage.removeItem(STORAGE_KEY)
}

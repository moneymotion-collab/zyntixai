import type { VoiceAssistantBridge } from "./types"

/**
 * Default voice bridge — no-op until a speech provider is plugged in.
 * Swap via PlatformAssistantProvider when Web Speech / Whisper is added.
 */
export const NULL_VOICE_BRIDGE: VoiceAssistantBridge = {
  input: null,
  output: null,
}

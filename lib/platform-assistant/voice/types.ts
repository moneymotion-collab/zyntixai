/**
 * Voice-ready adapter contract — implement when adding speech input/output.
 * The command bar calls these interfaces without coupling to a specific provider.
 */

export type VoiceTranscriptionResult = {
  text: string
  confidence?: number
  isFinal: boolean
}

export interface VoiceInputAdapter {
  readonly isSupported: boolean
  startListening(): Promise<void>
  stopListening(): Promise<VoiceTranscriptionResult | null>
  onPartialTranscript?(callback: (text: string) => void): void
}

export interface VoiceOutputAdapter {
  readonly isSupported: boolean
  speak(text: string): Promise<void>
  stop(): void
}

export type VoiceAssistantBridge = {
  input: VoiceInputAdapter | null
  output: VoiceOutputAdapter | null
}

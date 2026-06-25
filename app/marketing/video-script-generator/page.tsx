"use client"

import { useState } from "react"
import ProtectedShell from "@/app/components/ProtectedShell"
import Toast from "@/app/components/Toast"
import VideoScriptGeneratorResult from "@/components/marketing/VideoScriptGeneratorResult"
import {
  DEFAULT_INSTAGRAM_REEL_BRIEF,
} from "@/lib/video-script-generator/system-prompt"
import type { VideoScriptGeneratorOutput } from "@/lib/video-script-generator/types"
import { Clapperboard, Loader2, Sparkles } from "lucide-react"
import { premiumTextareaClass } from "@/lib/ui/premium-input"

type ApiResponse = VideoScriptGeneratorOutput & {
  error?: string
  warning?: string
}

const EXAMPLE_PROMPT = DEFAULT_INSTAGRAM_REEL_BRIEF

export default function VideoScriptGeneratorPage() {
  const [prompt, setPrompt] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [script, setScript] = useState<VideoScriptGeneratorOutput | null>(null)
  const [toast, setToast] = useState<string | null>(null)

  async function handleGenerate() {
    const trimmed = prompt.trim()
    if (!trimmed) return

    setLoading(true)
    setError(null)
    setWarning(null)
    setScript(null)

    try {
      const response = await fetch("/api/video-script-generator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: trimmed }),
      })

      const data = (await response.json()) as ApiResponse

      if (!response.ok) {
        setError(data.error ?? "Failed to generate script.")
        return
      }

      setScript({
        title: data.title,
        hook: data.hook,
        scenes: data.scenes,
        voiceover: data.voiceover,
        captions: data.captions ?? data.scenes.map((scene) => scene.text),
        subtitles: data.subtitles,
        CTA: data.CTA,
      })

      if (data.warning) {
        setWarning(data.warning)
      } else {
        setToast("Video script generated.")
      }
    } catch {
      setError("Network error — could not reach the server.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedShell allowed={["coach", "admin"]}>
      <div className="mx-auto max-w-3xl space-y-6 p-6">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-black p-3 text-white">
              <Clapperboard className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Video Script Generator
              </h1>
              <p className="text-sm text-gray-500">
                Input a prompt — get hook, scenes, voiceover, captions, and CTA.
              </p>
            </div>
          </div>
        </header>

        <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <label
            htmlFor="video-script-prompt"
            className="mb-2 block text-sm font-medium text-gray-700"
          >
            Prompt
          </label>
          <textarea
            id="video-script-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={EXAMPLE_PROMPT}
            rows={5}
            className={premiumTextareaClass}
          />
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setPrompt(EXAMPLE_PROMPT)}
              className="text-sm text-gray-500 underline-offset-2 hover:text-gray-700 hover:underline"
            >
              Use example prompt
            </button>
            <button
              type="button"
              onClick={() => void handleGenerate()}
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate script
            </button>
          </div>
        </section>

        {warning ? (
          <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {warning}
          </p>
        ) : null}

        {error ? (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : null}

        {script ? <VideoScriptGeneratorResult script={script} /> : null}

        {toast ? (
          <Toast title={toast} variant="success" onDismiss={() => setToast(null)} />
        ) : null}
      </div>
    </ProtectedShell>
  )
}

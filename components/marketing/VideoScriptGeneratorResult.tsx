"use client"

import SubtitlePreview from "@/components/marketing/SubtitlePreview"
import type { VideoScriptGeneratorOutput } from "@/lib/video-script-generator/types"
import { subtitleTrackToSrt } from "@/lib/subtitles"
import {
  Clapperboard,
  Clock,
  Copy,
  Captions,
  Megaphone,
  MessageSquare,
  Mic,
  Sparkles,
} from "lucide-react"

type VideoScriptGeneratorResultProps = {
  script: VideoScriptGeneratorOutput
}

function CopyButton({ value, label }: { value: string; label: string }) {
  return (
    <button
      type="button"
      onClick={() => void navigator.clipboard.writeText(value)}
      className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2 py-1 text-xs font-medium text-gray-600 transition hover:bg-gray-50"
      title={`Copy ${label}`}
    >
      <Copy className="h-3 w-3" />
      Copy
    </button>
  )
}

function Section({
  title,
  icon: Icon,
  children,
  copyValue,
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  children: React.ReactNode
  copyValue?: string
}) {
  return (
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gray-100 p-2 text-gray-700">
            <Icon className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        {copyValue ? <CopyButton value={copyValue} label={title} /> : null}
      </div>
      {children}
    </section>
  )
}

export default function VideoScriptGeneratorResult({
  script,
}: VideoScriptGeneratorResultProps) {
  const totalDuration = script.scenes.reduce(
    (sum, scene) => sum + scene.duration,
    0,
  )

  const jsonExport = JSON.stringify(
    {
      title: script.title,
      hook: script.hook,
      scenes: script.scenes,
      voiceover: script.voiceover,
      subtitles: script.subtitles,
      CTA: script.CTA,
    },
    null,
    2,
  )

  const srtExport = subtitleTrackToSrt(script.subtitles)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4">
        <div className="flex items-center gap-2 text-emerald-800">
          <Sparkles className="h-4 w-4" />
          <span className="text-sm font-semibold">Script ready</span>
        </div>
        <div className="flex items-center gap-3 text-sm text-emerald-700">
          <span className="inline-flex items-center gap-1">
            <Clapperboard className="h-4 w-4" />
            {script.scenes.length} scenes
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="h-4 w-4" />
            ~{totalDuration}s
          </span>
          <CopyButton value={jsonExport} label="full JSON" />
        </div>
      </div>

      <Section title="Title" icon={Sparkles} copyValue={script.title}>
        <p className="text-lg font-bold text-gray-900">{script.title}</p>
      </Section>

      <Section title="Hook (first 2s)" icon={Megaphone} copyValue={script.hook}>
        <p className="text-base font-medium text-gray-900">{script.hook}</p>
      </Section>

      <Section title="Scenes" icon={Clapperboard}>
        <div className="space-y-3">
          {script.scenes.map((scene, index) => (
            <div
              key={`${scene.text}-${index}`}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Scene {index + 1}
                </span>
                <span className="text-xs text-gray-500">{scene.duration}s</span>
              </div>
              <p className="mb-2 font-medium text-gray-900">{scene.text}</p>
              <p className="text-sm text-gray-600">{scene.visual}</p>
              {script.captions[index] ? (
                <p className="mt-2 text-xs text-gray-500">
                  Caption: {script.captions[index]}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </Section>

      <Section title="Voiceover" icon={Mic} copyValue={script.voiceover}>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
          {script.voiceover}
        </p>
      </Section>

      <Section title="Animated subtitles" icon={Captions} copyValue={srtExport}>
        <p className="mb-4 text-sm text-gray-500">
          Auto-generated from voiceover — center-aligned, word highlighting,
          Instagram Reels style ({script.subtitles.phrases.length} phrases, ~
          {script.subtitles.totalDuration.toFixed(0)}s).
        </p>
        <SubtitlePreview track={script.subtitles} />
        <div className="mt-4 space-y-2">
          {script.subtitles.phrases.map((phrase, index) => (
            <div
              key={`${phrase.start}-${index}`}
              className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
            >
              <span className="mr-2 font-mono text-xs text-gray-400">
                {phrase.start.toFixed(1)}s–{phrase.end.toFixed(1)}s
              </span>
              {phrase.text}
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="Scene captions"
        icon={MessageSquare}
        copyValue={script.captions.join("\n")}
      >
        <ul className="space-y-2">
          {script.captions.map((caption, index) => (
            <li
              key={`${caption}-${index}`}
              className="rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700"
            >
              <span className="mr-2 font-medium text-gray-400">
                {index + 1}.
              </span>
              {caption}
            </li>
          ))}
        </ul>
      </Section>

      <Section title="CTA" icon={Megaphone} copyValue={script.CTA}>
        <p className="text-base font-semibold text-gray-900">{script.CTA}</p>
      </Section>
    </div>
  )
}

"use client"

import { BookOpen } from "lucide-react"
import {
  buildStoryStructureFlowSummary,
  STORY_STRUCTURE_SCENES,
  type StoryStructureSceneOutput,
} from "@/lib/marketing/story-structure"

type StoryStructurePanelProps = {
  scenes?: StoryStructureSceneOutput[]
  hook?: string
  cta?: string
  compact?: boolean
  showReference?: boolean
}

export default function StoryStructurePanel({
  scenes = [],
  hook,
  cta,
  compact = false,
  showReference = true,
}: StoryStructurePanelProps) {
  const hasGenerated = scenes.length > 0

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Story Structure Engine</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-700">
          7-scene narrative arc: {buildStoryStructureFlowSummary()}. Each scene
          builds on the last so viewers stay through the CTA.
        </p>
        {hook ? (
          <p className="mt-3 text-sm font-medium text-indigo-900">
            Hook: <span className="font-normal text-gray-800">{hook}</span>
          </p>
        ) : null}
        {cta ? (
          <p className="mt-1 text-sm font-medium text-indigo-900">
            CTA: <span className="font-normal text-gray-800">{cta}</span>
          </p>
        ) : null}
      </div>

      {showReference && !compact ? (
        <div className="relative">
          <div className="absolute bottom-4 left-5 top-4 hidden w-px bg-gradient-to-b from-indigo-300 via-violet-200 to-transparent md:block" />
          <div className="space-y-3">
            {STORY_STRUCTURE_SCENES.map((scene) => {
              const generated = scenes.find((item) => item.order === scene.order)

              return (
                <article
                  key={scene.id}
                  className="relative rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:pl-10"
                >
                  <div className="absolute left-0 top-4 hidden h-7 w-7 items-center justify-center rounded-full border-2 border-indigo-500 bg-white text-[11px] font-bold text-indigo-700 md:flex">
                    {scene.order}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-semibold text-indigo-700">
                      Scene {scene.order}: {scene.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {scene.narrativeRole}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-600">{scene.purpose}</p>
                  {generated ? (
                    <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm font-medium text-gray-900">
                      {generated.text}
                    </p>
                  ) : (
                    <p className="mt-2 text-xs italic text-gray-400">
                      {scene.flowHint}
                    </p>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      ) : null}

      {hasGenerated && compact ? (
        <ol className="space-y-2">
          {scenes.map((scene) => (
            <li
              key={scene.order}
              className="flex gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {scene.order}
              </span>
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                  {scene.story_beat}
                </p>
                <p className="mt-0.5 text-sm font-medium text-gray-900">
                  {scene.text}
                </p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}
    </div>
  )
}

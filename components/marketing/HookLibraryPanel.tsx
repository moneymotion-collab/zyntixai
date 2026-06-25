"use client"

import { useMemo, useState } from "react"
import { Check, Copy, Fish } from "lucide-react"
import HookCategoryBadge from "@/components/marketing/HookCategoryBadge"
import {
  HOOK_CATEGORY_META,
  HOOK_CATEGORIES,
  HOOKS_PER_CAMPAIGN,
  groupHooksByCategory,
  type HookLibraryItem,
} from "@/lib/marketing/hook-library"

type HookLibraryPanelProps = {
  hooks: HookLibraryItem[]
  campaignName?: string
  compact?: boolean
}

function HookCard({
  hook,
  index,
}: {
  hook: HookLibraryItem
  index: number
}) {
  const [copied, setCopied] = useState(false)

  async function copyHook() {
    try {
      await navigator.clipboard.writeText(hook.text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Clipboard unavailable
    }
  }

  return (
    <article className="group flex items-start justify-between gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-gray-300 hover:shadow-md">
      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
            Hook {index + 1}
          </span>
          <HookCategoryBadge category={hook.category} />
        </div>
        <p className="text-base font-medium leading-snug text-gray-900">
          {hook.text}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void copyHook()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
        aria-label={`Copy hook ${index + 1}`}
      >
        {copied ? (
          <>
            <Check className="h-3.5 w-3.5 text-emerald-600" />
            Copied
          </>
        ) : (
          <>
            <Copy className="h-3.5 w-3.5" />
            Copy
          </>
        )}
      </button>
    </article>
  )
}

export default function HookLibraryPanel({
  hooks,
  campaignName,
  compact = false,
}: HookLibraryPanelProps) {
  const grouped = useMemo(() => groupHooksByCategory(hooks), [hooks])

  if (!hooks.length) return null

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-cyan-50 p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Fish className="h-5 w-5 text-violet-600" />
          <h3 className="font-semibold text-gray-900">Hook Library</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-700">
          {HOOKS_PER_CAMPAIGN} scroll-stopping hooks
          {campaignName ? ` for "${campaignName}"` : ""} — spread across{" "}
          {HOOK_CATEGORIES.length} storytelling categories. Use them as reel
          openers, ad headlines, or campaign post hooks.
        </p>
      </div>

      {!compact ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {HOOK_CATEGORIES.map((category) => {
            const meta = HOOK_CATEGORY_META[category]

            return (
              <div
                key={category}
                className="rounded-xl border border-gray-200 bg-gray-50/80 p-4"
              >
                <HookCategoryBadge category={category} />
                <p className="mt-2 text-sm text-gray-600">{meta.description}</p>
                <p className="mt-2 text-xs italic text-gray-500">
                  e.g. &ldquo;{meta.examples[0]}&rdquo;
                </p>
              </div>
            )
          })}
        </div>
      ) : null}

      <div className="space-y-3">
        {hooks.map((hook, index) => (
          <HookCard key={`${hook.category}-${hook.text}`} hook={hook} index={index} />
        ))}
      </div>

      {!compact ? (
        <div className="rounded-xl border border-dashed border-gray-200 bg-white p-4">
          <p className="text-sm font-medium text-gray-700">By category</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            {HOOK_CATEGORIES.map((category) => {
              const categoryHooks = grouped[category]
              if (!categoryHooks.length) return null

              return (
                <div key={category}>
                  <HookCategoryBadge category={category} />
                  <ul className="mt-2 space-y-1.5">
                    {categoryHooks.map((hook) => (
                      <li
                        key={hook.text}
                        className="text-sm text-gray-700 before:mr-2 before:text-gray-300 before:content-['•']"
                      >
                        {hook.text}
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      ) : null}
    </div>
  )
}

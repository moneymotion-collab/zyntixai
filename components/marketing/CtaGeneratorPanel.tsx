"use client"

import { useState } from "react"
import { Check, Copy, Megaphone } from "lucide-react"
import CtaCategoryBadge from "@/components/marketing/CtaCategoryBadge"
import {
  CTA_CATEGORY_META,
  CTA_CATEGORIES,
  CTAS_PER_GENERATION,
  type CtaGeneratorItem,
} from "@/lib/marketing/cta-generator"

type CtaGeneratorPanelProps = {
  ctas: CtaGeneratorItem[]
  campaignName?: string
  compact?: boolean
  showReference?: boolean
}

function CtaCard({ cta, index }: { cta: CtaGeneratorItem; index: number }) {
  const [copied, setCopied] = useState(false)

  async function copyCta() {
    try {
      await navigator.clipboard.writeText(cta.text)
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
            CTA {index + 1}
          </span>
          <CtaCategoryBadge category={cta.category} />
        </div>
        <p className="text-base font-semibold leading-snug text-gray-900">
          {cta.text}
        </p>
      </div>

      <button
        type="button"
        onClick={() => void copyCta()}
        className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-2.5 py-1.5 text-xs font-medium text-gray-600 transition hover:bg-gray-100"
        aria-label={`Copy CTA ${index + 1}`}
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

export default function CtaGeneratorPanel({
  ctas,
  campaignName,
  compact = false,
  showReference = true,
}: CtaGeneratorPanelProps) {
  if (!ctas.length && !showReference) return null

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-cyan-50 p-5 sm:p-6">
        <div className="mb-2 flex items-center gap-2">
          <Megaphone className="h-5 w-5 text-emerald-600" />
          <h3 className="font-semibold text-gray-900">CTA Generator</h3>
        </div>
        <p className="text-sm leading-relaxed text-gray-700">
          {CTAS_PER_GENERATION} conversion-ready CTAs
          {campaignName ? ` for "${campaignName}"` : ""} — one per category for
          video outros, ad end cards, and landing pages.
        </p>
      </div>

      {showReference && !compact ? (
        <div className="grid gap-3 sm:grid-cols-2">
          {CTA_CATEGORIES.map((category) => {
            const meta = CTA_CATEGORY_META[category]
            const generated = ctas.find((item) => item.category === category)

            return (
              <div
                key={category}
                className="rounded-xl border border-gray-200 bg-gray-50/80 p-4"
              >
                <CtaCategoryBadge category={category} />
                <p className="mt-2 text-sm text-gray-600">{meta.description}</p>
                {generated ? (
                  <p className="mt-3 rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900">
                    {generated.text}
                  </p>
                ) : (
                  <p className="mt-2 text-xs italic text-gray-400">
                    e.g. &ldquo;{meta.examples[0]}&rdquo;
                  </p>
                )}
              </div>
            )
          })}
        </div>
      ) : null}

      {ctas.length > 0 ? (
        <div className="space-y-3">
          {ctas.map((cta, index) => (
            <CtaCard key={`${cta.category}-${cta.text}`} cta={cta} index={index} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

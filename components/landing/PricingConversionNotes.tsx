import { ShieldCheck } from "lucide-react"
import { TRIAL_MESSAGING } from "@/components/landing/landing-cta"

const TRUST_POINTS = [
  "7-day free trial on every plan",
  "No credit card required to start",
  "Cancel anytime",
] as const

export default function PricingConversionNotes() {
  return (
    <div className="mx-auto mt-10 max-w-3xl rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:mt-12 sm:p-6">
      <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:text-left">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/25">
          <ShieldCheck className="h-5 w-5 text-emerald-400" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-slate-200 sm:text-base">
            {TRIAL_MESSAGING.tagline}
          </p>
          <p className="mt-2 text-xs leading-relaxed text-slate-500 sm:text-sm">
            {TRIAL_MESSAGING.pricingPageNote}
          </p>
        </div>
      </div>
      <ul className="mt-5 grid gap-2 sm:grid-cols-3">
        {TRUST_POINTS.map((point) => (
          <li
            key={point}
            className="rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2.5 text-center text-xs text-slate-400 sm:text-sm"
          >
            {point}
          </li>
        ))}
      </ul>
    </div>
  )
}

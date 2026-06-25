"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import {
  LANDING_HERO_CTA,
} from "@/components/landing/landing-cta"

export default function MobileLandingCta() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:hidden">
      <div className="pointer-events-auto mx-auto max-w-md">
        <Link
          href={LANDING_HERO_CTA.href}
          className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-500 px-5 text-base font-semibold text-white shadow-[0_8px_32px_rgba(0,0,0,0.45),0_8px_32px_rgba(99,102,241,0.35)] ring-1 ring-white/10 backdrop-blur-sm"
        >
          {LANDING_HERO_CTA.label}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  )
}

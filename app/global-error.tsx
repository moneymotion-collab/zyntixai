"use client"

import Link from "next/link"

import { ZyntixLogoFull } from "@/components/brand/FitCoreLogo"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html lang="en">
      <body className="bg-[#06080f] text-slate-100 antialiased">
        <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 text-center">
          <ZyntixLogoFull size="lg" className="mb-8" />
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400/90">
            Something went wrong
          </p>
          <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            We hit an unexpected error
          </h1>
          <p className="mt-3 max-w-md text-sm text-slate-400">
            {error.message || "Please try again or return to the dashboard."}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => reset()}
              className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Try again
            </button>
            <Link
              href="/dashboard"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-5 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Go to dashboard
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}

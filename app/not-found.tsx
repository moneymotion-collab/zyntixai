import Link from "next/link"

import { ZyntixLogoFull } from "@/components/brand/FitCoreLogo"

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#06080f] px-4 py-16 text-center text-white">
      <div className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[800px] -translate-x-1/2 rounded-full bg-violet-600/15 blur-[120px]" />

      <div className="relative z-10 flex max-w-md flex-col items-center">
        <ZyntixLogoFull size="lg" className="mb-8" priority />
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400/90">
          404
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          The page you are looking for does not exist or may have been moved.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 px-6 text-sm font-semibold text-white transition hover:opacity-90"
        >
          Back to home
        </Link>
      </div>
    </div>
  )
}

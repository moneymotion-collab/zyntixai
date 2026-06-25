"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Menu, X } from "lucide-react"
import FitCoreLogo from "@/components/brand/FitCoreLogo"
import { LANDING_HEADER_CTA } from "@/components/landing/landing-cta"
import { landingCtaPrimaryClass } from "@/components/landing/landing-layout"
import { MOBILE_SAFE_TOP, MOBILE_TAP_TARGET } from "@/lib/ui/mobile-layout"

const NAV_LINKS = [
  { href: "/#features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#demo-video", label: "Demo" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const

export default function LandingHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false)
    }

    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [menuOpen])

  const closeMenu = () => setMenuOpen(false)

  return (
    <header
      className={`sticky top-0 z-40 w-full border-b transition-[background-color,border-color,backdrop-filter] duration-300 ${MOBILE_SAFE_TOP} ${
        scrolled
          ? "border-white/10 bg-[#06080f]/85 backdrop-blur-xl"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:gap-4 sm:px-6 sm:py-4">
        <FitCoreLogo size="sm" showWordmark href="/" wordmarkClassName="text-sm sm:text-base" />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium text-slate-400 transition-colors hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/login"
            className="hidden min-h-11 items-center px-3 text-sm font-medium text-slate-400 transition-colors hover:text-white sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href={LANDING_HEADER_CTA.href}
            className={`${landingCtaPrimaryClass} hidden !min-h-11 !w-auto !px-4 !text-sm sm:inline-flex sm:!px-5`}
          >
            {LANDING_HEADER_CTA.label}
          </Link>

          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className={`${MOBILE_TAP_TARGET} rounded-xl border border-white/12 bg-white/[0.04] text-slate-300 transition hover:bg-white/[0.08] hover:text-white lg:hidden`}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuOpen ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={closeMenu}
            aria-label="Close menu"
          />
          <div className="fixed inset-x-0 top-0 z-50 max-h-[100dvh] overflow-y-auto border-b border-white/10 bg-[#06080f]/95 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(3.5rem,env(safe-area-inset-top))] backdrop-blur-xl lg:hidden">
            <nav className="mx-auto max-w-7xl px-4 py-4" aria-label="Mobile">
              <ul className="space-y-1">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="flex min-h-11 items-center rounded-xl px-4 text-base font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
                <li className="border-t border-white/10 pt-3">
                  <Link
                    href="/login"
                    onClick={closeMenu}
                    className="flex min-h-11 items-center rounded-xl px-4 text-base font-medium text-slate-400 transition hover:bg-white/[0.06] hover:text-white"
                  >
                    Sign in
                  </Link>
                </li>
                <li className="pt-2">
                  <Link
                    href={LANDING_HEADER_CTA.href}
                    onClick={closeMenu}
                    className={`${landingCtaPrimaryClass} !min-h-12`}
                  >
                    {LANDING_HEADER_CTA.label}
                  </Link>
                </li>
              </ul>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  )
}

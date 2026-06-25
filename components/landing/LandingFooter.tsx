import Link from "next/link"
import FitCoreLogo from "@/components/brand/FitCoreLogo"
import { FITCORE_AI_TAGLINE } from "@/lib/brand/fitcore-ai"
import {
  LANDING_FOOTER_CTA,
  LANDING_SECONDARY_CTA,
  LANDING_TERTIARY_CTA,
} from "@/components/landing/landing-cta"

const PRODUCT_LINKS = [
  { label: "Overview", href: "/#product-preview" },
  { label: "Product Demo", href: "/#demo-video" },
  { label: "Features", href: "/#features" },
  { label: "FAQ", href: "/#faq" },
  { label: "Pricing", href: "/pricing" },
  { label: LANDING_FOOTER_CTA.label, href: LANDING_FOOTER_CTA.href },
] as const

const FEATURE_LINKS = [
  { label: "Client Management", href: "/#features" },
  { label: "Workout Programming", href: "/#features" },
  { label: "Nutrition Coaching", href: "/#features" },
  { label: "Progress Tracking", href: "/#features" },
  { label: "Marketing AI", href: "/#features" },
  { label: "Video Generator", href: "/#features" },
] as const

const COMPANY_LINKS = [
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
  { label: "Pricing", href: "/pricing" },
] as const

const CONTACT_LINKS = [
  {
    label: "hello@fitcore.app",
    href: "mailto:hello@fitcore.app",
    external: true,
  },
  {
    label: "Support",
    href: "mailto:support@fitcore.app",
    external: true,
  },
  { label: "Sign In", href: "/login" },
  { label: LANDING_SECONDARY_CTA.label, href: LANDING_SECONDARY_CTA.href },
  { label: LANDING_TERTIARY_CTA.label, href: LANDING_TERTIARY_CTA.href },
] as const

function FooterLinkGroup({
  title,
  links,
}: {
  title: string
  links: readonly { label: string; href: string; external?: boolean }[]
}) {
  return (
    <div>
      <h3 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {title}
      </h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.href}
                className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-200"
              >
                {link.label}
              </a>
            ) : (
              <Link
                href={link.href}
                className="text-sm text-slate-500 transition-colors duration-200 hover:text-slate-200"
              >
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function LandingFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="relative w-full border-t border-white/8 bg-[#04060b]/80 backdrop-blur-xl">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <FitCoreLogo
              size="md"
              showWordmark
              subtitle="Coaching Platform"
              href="/"
              wordmarkClassName="text-lg"
            />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-slate-500">
              {FITCORE_AI_TAGLINE}
            </p>
            <Link
              href={LANDING_FOOTER_CTA.href}
              className="mt-6 flex min-h-11 w-full items-center justify-center rounded-xl border border-white/12 bg-white/[0.04] px-5 text-sm font-semibold text-slate-200 transition-[background-color,border-color] duration-200 hover:border-white/20 hover:bg-white/[0.08] sm:inline-flex sm:w-auto"
            >
              {LANDING_FOOTER_CTA.label}
            </Link>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-8 gap-y-10 sm:grid-cols-4 lg:col-span-8">
            <FooterLinkGroup title="Product" links={PRODUCT_LINKS} />
            <FooterLinkGroup title="Features" links={FEATURE_LINKS} />
            <FooterLinkGroup title="Company" links={COMPANY_LINKS} />
            <FooterLinkGroup title="Contact" links={CONTACT_LINKS} />
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-white/6 pt-8 sm:flex-row">
          <p className="text-xs text-slate-600">
            © {year} FitCore AI. All rights reserved.
          </p>
          <p className="text-xs text-slate-600">
            Built for modern coaches worldwide.
          </p>
        </div>
      </div>
    </footer>
  )
}

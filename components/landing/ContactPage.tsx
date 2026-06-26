"use client"

import { type FormEvent, useState } from "react"
import Link from "next/link"
import { Clock, Mail, MessageSquare } from "lucide-react"
import MarketingPageShell from "@/components/landing/MarketingPageShell"
import { SITE_CONTACT } from "@/lib/landing/site-contact"
import { premiumInputClass } from "@/lib/ui/premium-input"
import { landingTouchInputClass } from "@/components/landing/landing-layout"
import Button from "@/components/ui/button"

export default function ContactPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const subject = encodeURIComponent(`ZyntixAI contact — ${name.trim() || "Enquiry"}`)
    const body = encodeURIComponent(
      `Name: ${name.trim()}\nEmail: ${email.trim()}\n\n${message.trim()}`,
    )

    window.location.href = `mailto:${SITE_CONTACT.supportEmail}?subject=${subject}&body=${body}`
  }

  return (
    <MarketingPageShell
      badge="Support"
      title="Contact Us"
      description="Questions about ZyntixAI, your account, or beta access? We're here to help."
      narrow
    >
      <div className="grid gap-6 lg:grid-cols-5 lg:gap-8">
        <div className="space-y-4 lg:col-span-2">
          <div className="glass-panel rounded-2xl border-white/12 p-5 sm:p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 ring-1 ring-indigo-400/20">
              <Mail className="h-5 w-5 text-indigo-300" />
            </div>
            <p className="text-sm font-semibold text-white">General enquiries</p>
            <a
              href={`mailto:${SITE_CONTACT.helloEmail}`}
              className="mt-2 block text-sm text-indigo-400 hover:text-indigo-300"
            >
              {SITE_CONTACT.helloEmail}
            </a>
          </div>

          <div className="glass-panel rounded-2xl border-white/12 p-5 sm:p-6">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 ring-1 ring-emerald-400/20">
              <MessageSquare className="h-5 w-5 text-emerald-300" />
            </div>
            <p className="text-sm font-semibold text-white">Support</p>
            <a
              href={`mailto:${SITE_CONTACT.supportEmail}`}
              className="mt-2 block text-sm text-indigo-400 hover:text-indigo-300"
            >
              {SITE_CONTACT.supportEmail}
            </a>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Account issues, billing questions, and technical help.
            </p>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-5 w-5 shrink-0 text-slate-500" />
              <div>
                <p className="text-sm font-semibold text-slate-300">
                  Response expectations
                </p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  We aim to reply within {SITE_CONTACT.responseTime} during{" "}
                  {SITE_CONTACT.supportHours}. Urgent billing or access issues
                  are prioritized.
                </p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600">
            Privacy requests:{" "}
            <a
              href={`mailto:${SITE_CONTACT.privacyEmail}`}
              className="text-indigo-400 hover:text-indigo-300"
            >
              {SITE_CONTACT.privacyEmail}
            </a>
            . See our{" "}
            <Link href="/privacy" className="text-indigo-400 hover:text-indigo-300">
              Privacy Policy
            </Link>
            .
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="glass-panel space-y-4 rounded-2xl border-white/12 p-5 sm:space-y-5 sm:p-8 lg:col-span-3"
          noValidate
        >
          <p className="text-sm text-slate-400">
            Send a message using the form below — it opens your email client with
            a pre-filled message to our support team.
          </p>

          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-medium text-slate-300">
              Name
            </label>
            <input
              id="contact-name"
              type="text"
              name="name"
              autoComplete="name"
              required
              minLength={2}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`${premiumInputClass} ${landingTouchInputClass}`}
            />
          </div>

          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-medium text-slate-300">
              Email
            </label>
            <input
              id="contact-email"
              type="email"
              name="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${premiumInputClass} ${landingTouchInputClass}`}
            />
          </div>

          <div>
            <label htmlFor="contact-message" className="mb-2 block text-sm font-medium text-slate-300">
              Message
            </label>
            <textarea
              id="contact-message"
              name="message"
              required
              minLength={10}
              rows={5}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className={`${premiumInputClass} ${landingTouchInputClass} min-h-[8rem] resize-y`}
            />
          </div>

          <Button type="submit" className="!min-h-12 w-full text-base font-semibold">
            Send via Email
          </Button>
        </form>
      </div>
    </MarketingPageShell>
  )
}

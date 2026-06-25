"use client"

import { type FormEvent, useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Sparkles } from "lucide-react"
import Button from "@/components/ui/button"
import {
  landingContainerClass,
  landingHeadingClass,
  landingSectionClass,
  landingSubheadingClass,
  landingTouchInputClass,
} from "@/components/landing/landing-layout"
import { premiumInputClass, premiumSelectClass } from "@/lib/ui/premium-input"

const BUSINESS_TYPES = [
  "Online Coach",
  "Personal Trainer",
  "Gym Owner",
  "Beta Tester",
  "Other",
] as const

const SUCCESS_MESSAGE =
  "You're on the list. We'll contact you when beta access opens."

export default function WaitlistSignup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [businessType, setBusinessType] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const response = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          business_type: businessType,
        }),
      })

      const data = (await response.json()) as {
        success?: boolean
        message?: string
        error?: string
      }

      if (!response.ok) {
        setError(data.error ?? "Something went wrong. Please try again.")
        return
      }

      setSuccess(true)
      setName("")
      setEmail("")
      setBusinessType("")
    } catch {
      setError("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section id="waitlist" className={landingSectionClass}>
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[450px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/12 blur-[120px]" />
      </div>

      <div className={`${landingContainerClass} max-w-xl`}>
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <span className="badge-premium mb-6 inline-flex">
            <Sparkles className="h-3 w-3" />
            Beta Access
          </span>
          <h2 className={landingHeadingClass}>
            Join the{" "}
            <span className="text-gradient">Beta Waitlist</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-slate-400 sm:text-lg">
            Be first in line for early access. Built for personal trainers,
            online coaches, and gym owners.
          </p>
        </motion.div>

        <motion.div
          className="mt-8 sm:mt-12"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
        >
          {success ? (
            <div
              className="glass-panel flex flex-col items-center rounded-2xl border-emerald-400/25 bg-emerald-500/[0.06] px-5 py-8 text-center sm:px-8 sm:py-10"
              role="status"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-400/30">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
              <p className="text-base font-semibold leading-relaxed text-white sm:text-lg">
                {SUCCESS_MESSAGE}
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="glass-panel space-y-4 rounded-2xl p-5 sm:space-y-5 sm:p-8"
              noValidate
            >
              <div>
                <label
                  htmlFor="waitlist-name"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Name
                </label>
                <input
                  id="waitlist-name"
                  type="text"
                  name="name"
                  autoComplete="name"
                  required
                  minLength={2}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className={`${premiumInputClass} ${landingTouchInputClass}`}
                />
              </div>

              <div>
                <label
                  htmlFor="waitlist-email"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Email
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  name="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`${premiumInputClass} ${landingTouchInputClass}`}
                />
              </div>

              <div>
                <label
                  htmlFor="waitlist-business-type"
                  className="mb-2 block text-sm font-medium text-slate-300"
                >
                  Business Type
                </label>
                <select
                  id="waitlist-business-type"
                  name="business_type"
                  required
                  value={businessType}
                  onChange={(e) => setBusinessType(e.target.value)}
                  className={`${premiumSelectClass} ${landingTouchInputClass}`}
                >
                  <option value="" disabled>
                    Select your business type
                  </option>
                  {BUSINESS_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              {error ? (
                <p className="text-sm text-rose-400" role="alert">
                  {error}
                </p>
              ) : null}

              <Button
                type="submit"
                loading={loading}
                disabled={loading}
                className="!min-h-[3.25rem] w-full text-base font-semibold"
              >
                Join Beta Waitlist
              </Button>
            </form>
          )}
        </motion.div>
      </div>
    </section>
  )
}

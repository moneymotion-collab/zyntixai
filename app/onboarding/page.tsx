"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { FitCoreLogoMark } from "@/components/brand/FitCoreLogo"
import { FITCORE_AI_BRAND_NAME } from "@/lib/brand/fitcore-ai"
import { hasCompletedCoachOnboarding, markCoachOnboardingComplete } from "@/lib/auth/coach-onboarding"
import { saveCoachGymName } from "@/lib/auth/save-coach-gym"
import { normalizeMemberEmail } from "@/lib/member-link"
import { createClient } from "@/lib/supabase/client"
import { premiumInputClass } from "@/lib/ui/premium-input"

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [checkingExisting, setCheckingExisting] = useState(true)
  const [step, setStep] = useState(1)
  const [gymName, setGymName] = useState("")
  const [memberName, setMemberName] = useState("")
  const [memberEmail, setMemberEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.replace("/login")
        return
      }

      if (await hasCompletedCoachOnboarding(supabase, user.id)) {
        router.replace("/dashboard")
        return
      }

      const { data: gymSettings } = await supabase
        .from("gym_settings")
        .select("gym_name")
        .eq("owner_id", user.id)
        .maybeSingle()

      const savedName = gymSettings?.gym_name?.trim()
      if (savedName) {
        setGymName(savedName)
        setStep(2)
      }

      setCheckingExisting(false)
    })()
  }, [router, supabase])

  async function continueToMemberStep() {
    if (!gymName.trim()) {
      setErrorMessage("Enter a gym name.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const { error } = await saveCoachGymName(supabase, user.id, gymName)

    setLoading(false)

    if (error) {
      setErrorMessage(error)
      return
    }

    const completion = await markCoachOnboardingComplete(supabase, user.id, gymName)
    if (completion.error) {
      setErrorMessage(completion.error)
      return
    }

    setStep(2)
  }

  async function skipMemberStep() {
    setLoading(true)
    setErrorMessage(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    const completion = await markCoachOnboardingComplete(
      supabase,
      user.id,
      gymName.trim() || undefined,
    )

    setLoading(false)

    if (completion.error) {
      setErrorMessage(completion.error)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  async function finish() {
    if (!memberName.trim() || !memberEmail.trim()) {
      setErrorMessage("Enter name and email.")
      return
    }

    setLoading(true)
    setErrorMessage(null)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      router.push("/login")
      return
    }

    if (gymName.trim()) {
      const gymResult = await saveCoachGymName(supabase, user.id, gymName)
      if (gymResult.error) {
        setErrorMessage(gymResult.error)
        setLoading(false)
        return
      }
    }

    const completion = await markCoachOnboardingComplete(
      supabase,
      user.id,
      gymName.trim() || undefined,
    )
    if (completion.error) {
      setErrorMessage(completion.error)
      setLoading(false)
      return
    }

    const { error } = await supabase.from("members").insert([
      {
        full_name: memberName.trim(),
        email: normalizeMemberEmail(memberEmail),
        coach_id: user.id,
      },
    ])

    if (error) {
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  async function tryDemoGym() {
    setLoading(true)
    setErrorMessage(null)

    const res = await fetch("/api/workspace/enter-demo", {
      method: "POST",
      credentials: "include",
    })

    const data = (await res.json()) as { error?: string }

    if (!res.ok) {
      setErrorMessage(data.error ?? "Could not load demo workspace.")
      setLoading(false)
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  if (checkingExisting) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-gray-400">
        Loading setup…
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 text-white">
      <div className="absolute left-[-100px] top-[-100px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
        <div className="mb-8 flex flex-col items-center">
          <FitCoreLogoMark size="lg" className="mb-4 shadow-lg shadow-cyan-500/10" />
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-cyan-400/90">
            {FITCORE_AI_BRAND_NAME}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight">Setup</h1>
          <p className="mt-2 text-center text-gray-400">
            Step {step} of 2 · {FITCORE_AI_BRAND_NAME}
          </p>
        </div>

        {errorMessage ? (
          <p className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        ) : null}

        {step === 1 ? (
          <div className="space-y-5">
            <div>
              <h2 className="mb-2 text-xl font-semibold">Create your gym</h2>
              <p className="mb-4 text-sm text-gray-400">
                Name your gym to get started.
              </p>
              <input
                type="text"
                placeholder="Gym name"
                value={gymName}
                onChange={(e) => setGymName(e.target.value)}
                className={premiumInputClass}
              />
            </div>
            <button
              type="button"
              disabled={!gymName.trim() || loading}
              onClick={() => void continueToMemberStep()}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? "Saving…" : "Next"}
            </button>

            <div className="relative py-2 text-center">
              <span className="bg-transparent px-3 text-sm text-gray-500">or</span>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => void tryDemoGym()}
              className="h-12 w-full rounded-xl border border-white/10 font-semibold transition hover:bg-white/5 disabled:opacity-50"
            >
              {loading ? "Loading demo workspace…" : "Explore Demo Workspace"}
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            <div>
              <h2 className="mb-2 text-xl font-semibold">Add first member</h2>
              <p className="mb-4 text-sm text-gray-400">
                Add your first member for {gymName || "your gym"}.
              </p>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Member name"
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className={premiumInputClass}
                />
                <input
                  type="email"
                  placeholder="Member email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className={premiumInputClass}
                />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="h-12 flex-1 rounded-xl border border-white/10 font-semibold transition hover:bg-white/5"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => void finish()}
                  className="h-12 flex-1 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                  {loading ? "Saving…" : "Finish"}
                </button>
              </div>
              <button
                type="button"
                disabled={loading}
                onClick={() => void skipMemberStep()}
                className="h-11 w-full rounded-xl border border-white/10 text-sm font-medium text-gray-300 transition hover:bg-white/5 disabled:opacity-50"
              >
                Skip for now — go to dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

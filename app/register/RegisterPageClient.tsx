"use client"

import { type FormEvent, useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import AuthBranding from "@/components/brand/AuthBranding"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ensureUserProfile } from "@/lib/auth/ensure-profile"
import { resolvePostLoginRoute } from "@/lib/auth/post-login"
import { resolveLinkedMemberId } from "@/lib/member-link"
import { createClient } from "@/lib/supabase/client"
import { persistWorkspaceMode } from "@/lib/workspace/workspace-mode"
import { premiumInputClass, premiumSelectClass } from "@/lib/ui/premium-input"
import { TRIAL_MESSAGING } from "@/components/landing/landing-cta"
import { demoMemberCountPhrase } from "@/lib/demo/demo-copy"

export default function RegisterPageClient() {
  const searchParams = useSearchParams()
  const demoIntent = searchParams.get("demo") === "1"
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState(demoIntent ? "coach" : "")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    if (demoIntent) {
      setRole("coach")
      persistWorkspaceMode("demo")
    }
  }, [demoIntent])

  const signup = async () => {
    setErrorMessage(null)
    setLoading(true)

    const selectedRole = role || "member"

    if (demoIntent) {
      persistWorkspaceMode("demo")
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: selectedRole },
      },
    })

    if (error) {
      console.error(error.message)
      setErrorMessage(error.message)
      setLoading(false)
      return
    }

    if (!data.session) {
      setLoading(false)
      window.location.assign(
        demoIntent ? "/login?registered=1&demo=1" : "/login?registered=1",
      )
      return
    }

    await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    })

    if (data.user) {
      const profileResult = await ensureUserProfile(supabase, {
        email: data.user.email,
        role: selectedRole,
      })

      if (!profileResult.ok) {
        console.error("PROFILE ERROR:", profileResult.error)
        setErrorMessage(profileResult.error)
        setLoading(false)
        return
      }

      if (selectedRole === "member") {
        await resolveLinkedMemberId(supabase).catch(() => null)
      }
    }

    if (demoIntent && selectedRole === "coach") {
      const demoRes = await fetch("/api/workspace/enter-demo", {
        method: "POST",
        credentials: "include",
      })

      if (demoRes.ok) {
        window.location.assign("/dashboard")
        return
      }
    }

    setLoading(false)

    const syncResponse = await fetch("/api/access/sync", {
      method: "POST",
      credentials: "include",
    })

    let destination =
      selectedRole === "coach"
        ? demoIntent
          ? "/workspace"
          : "/onboarding"
        : "/my-workouts"

    if (syncResponse.ok) {
      const payload = (await syncResponse.json()) as { destination?: string }
      destination = payload.destination ?? destination
    } else {
      destination =
        selectedRole === "coach"
          ? demoIntent
            ? "/workspace"
            : "/onboarding"
          : await resolvePostLoginRoute(supabase)
    }

    if (demoIntent && selectedRole === "coach" && destination === "/onboarding") {
      destination = "/workspace"
    }

    window.location.assign(destination)
  }

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    signup()
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white">
      <div className="absolute left-[-100px] top-[-100px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md">
        <AuthBranding
          formTitle={demoIntent ? "Create Account" : "Start Your Free Trial"}
          formSubtitle={
            demoIntent
              ? "Create a coach account to explore the ZyntixAI demo workspace"
              : TRIAL_MESSAGING.tagline
          }
        />

        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">

        {demoIntent ? (
          <p className="mb-5 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100/90">
            You&apos;ll get instant access to a fully populated ZyntixAI demo
            workspace with {demoMemberCountPhrase()}.
          </p>
        ) : null}

        <form onSubmit={handleRegister} className="space-y-5">
          {errorMessage ? (
            <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </p>
          ) : null}

          <div>
            <label htmlFor="email" className="mb-2 block text-sm text-gray-300">
              Email Address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className={premiumInputClass}
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm text-gray-300">
              Password
            </label>

            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                required
                autoComplete="new-password"
                minLength={6}
                className={`${premiumInputClass} pr-12`}
              />

              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-white"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          {!demoIntent ? (
            <div>
              <label htmlFor="role" className="mb-2 block text-sm text-gray-300">
                Role
              </label>

              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                required
                className={premiumSelectClass}
              >
                <option value="" disabled>
                  Select your role
                </option>
                <option value="coach">
                  Coach
                </option>
                <option value="member">
                  Member
                </option>
              </select>
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading
              ? "Creating Account..."
              : demoIntent
                ? "Create & Explore Demo"
                : "Start Free Trial"}
          </button>
        </form>

        {!demoIntent ? (
          <p className="mt-4 text-center text-xs text-gray-500">
            {TRIAL_MESSAGING.footnote}
          </p>
        ) : null}

        <p className="mt-8 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link
            href={demoIntent ? "/login?demo=1" : "/login"}
            className="text-blue-400 hover:text-blue-300"
          >
            Sign In
          </Link>
        </p>
        </div>
      </div>
    </div>
  )
}

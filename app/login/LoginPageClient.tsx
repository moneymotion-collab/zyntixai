"use client"

import { type FormEvent, useEffect, useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import AuthBranding from "@/components/brand/AuthBranding"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import WorkspacePickerCards from "@/components/workspace/WorkspacePickerCards"
import { resolvePostLoginRoute } from "@/lib/auth/post-login"
import { createClient } from "@/lib/supabase/client"
import {
  persistWorkspaceMode,
  readPersistedWorkspaceMode,
  type WorkspaceMode,
} from "@/lib/workspace/workspace-mode"
import { premiumInputClass } from "@/lib/ui/premium-input"

async function resolveDestination(
  supabase: ReturnType<typeof createClient>,
  workspaceMode: WorkspaceMode,
): Promise<string> {
  if (workspaceMode === "demo") {
    const demoRes = await fetch("/api/workspace/enter-demo", {
      method: "POST",
      credentials: "include",
    })

    if (demoRes.ok) {
      return "/dashboard"
    }
  } else {
    await fetch("/api/workspace/enter-live", {
      method: "POST",
      credentials: "include",
    })
  }

  const syncResponse = await fetch("/api/access/sync", {
    method: "POST",
    credentials: "include",
  })

  if (syncResponse.ok) {
    const payload = (await syncResponse.json()) as { destination?: string }
    const base = payload.destination ?? "/dashboard"

    if (workspaceMode === "demo" && base === "/onboarding") {
      return "/workspace"
    }

    return workspaceMode === "demo" ? "/workspace" : base
  }

  const route = await resolvePostLoginRoute(supabase)
  return workspaceMode === "demo" && route === "/onboarding" ? "/workspace" : route
}

export default function LoginPageClient() {
  const searchParams = useSearchParams()
  const supabase = createClient()
  const registered = searchParams.get("registered") === "1"
  const demoParam = searchParams.get("demo") === "1"
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(
    demoParam ? "demo" : "live",
  )
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const persisted = readPersistedWorkspaceMode()
    if (persisted) {
      setWorkspaceMode(persisted)
    } else if (demoParam) {
      setWorkspaceMode("demo")
    }
  }, [demoParam])

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    persistWorkspaceMode(workspaceMode)

    const form = new FormData(e.currentTarget)
    const email = String(form.get("email") ?? "").trim()
    const password = String(form.get("password") ?? "")

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setLoading(false)
      setError(signInError.message)
      return
    }

    const destination = await resolveDestination(supabase, workspaceMode)
    window.location.assign(destination)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4 py-10 text-white">
      <div className="absolute left-[-100px] top-[-100px] h-[500px] w-[500px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-[-100px] right-[-100px] h-[400px] w-[400px] rounded-full bg-purple-500/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-3xl">
        <AuthBranding
          formTitle="Welcome Back"
          formSubtitle="Choose a workspace, then sign in to continue."
        />

        <WorkspacePickerCards
          selected={workspaceMode}
          onSelect={(mode) => {
            setWorkspaceMode(mode)
            persistWorkspaceMode(mode)
          }}
          onContinue={(mode) => {
            setWorkspaceMode(mode)
            persistWorkspaceMode(mode)
          }}
          compact
        />

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-2xl">
          {workspaceMode === "demo" ? (
            <p className="mb-5 rounded-xl border border-cyan-400/25 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-100/90">
              Sign in with your coach account to open the fully populated demo
              environment. New here?{" "}
              <Link
                href="/register?demo=1"
                className="font-semibold text-cyan-300 hover:text-cyan-200"
              >
                Create a free coach account
              </Link>
              .
            </p>
          ) : null}

          <form onSubmit={handleLogin} className="space-y-5">
            {registered ? (
              <p className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-300">
                Account created. Check your email to confirm, then sign in.
              </p>
            ) : null}

            {error ? (
              <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
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
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
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

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-400">
                <input type="checkbox" className="accent-blue-500" />
                Remember me
              </label>

              <button
                type="button"
                className="text-blue-400 transition hover:text-blue-300"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading
                ? "Signing In..."
                : workspaceMode === "demo"
                  ? "Sign In & Open Demo"
                  : "Sign In to My Workspace"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link
              href={
                workspaceMode === "demo" ? "/register?demo=1" : "/register"
              }
              className="text-blue-400 hover:text-blue-300"
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

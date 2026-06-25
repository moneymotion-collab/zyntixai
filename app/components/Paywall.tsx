"use client"

import Link from "next/link"
import { FitCoreLogoMark } from "@/components/brand/FitCoreLogo"
import { useBillingPortal } from "@/app/hooks/useBillingPortal"
import { useSubscribe } from "@/app/hooks/useSubscribe"
import { useSubscriptionAccess } from "@/app/hooks/useSubscriptionAccess"
import { shouldShowPaywallPortal } from "@/lib/billing/manage-billing"
import { getTrialStatusMessage } from "@/lib/coach-trial"
import {
  BILLING_PLAN_DETAILS,
  getBillingPlanLabel,
  parseBillingPlan,
  type BillingPlan,
} from "@/lib/stripe-config"

export default function Paywall() {
  const { subscribe, loading, errorMessage } = useSubscribe()
  const { profile, trialEndsAt } = useSubscriptionAccess()
  const {
    openPortal,
    loading: portalLoading,
    errorMessage: portalError,
  } = useBillingPortal()
  const trialStatus = getTrialStatusMessage(trialEndsAt)
  const showPortal = shouldShowPaywallPortal(profile)
  const checkoutPlan: BillingPlan =
    parseBillingPlan(profile?.billing_plan) ?? "basic"
  const checkoutLabel = BILLING_PLAN_DETAILS[checkoutPlan]
  const heading =
    trialStatus === "trial ended"
      ? "Your trial has ended"
      : trialStatus === "trial not started"
        ? "Activate your free trial"
        : "Your free trial is active"
  const description =
    trialStatus === "trial ended"
      ? "Subscribe to keep using FitCore AI with your coach, workouts, and nutrition plans."
      : trialStatus === "trial not started"
        ? "Your account needs a trial before you can use FitCore AI. Sign out and sign in again, or contact support if this keeps happening."
        : "Something went wrong while loading your access. Try signing out and back in."
  const currentPlanLabel = getBillingPlanLabel(profile?.billing_plan)

  return (
    <div className="relative flex min-h-[70vh] items-center justify-center overflow-hidden rounded-3xl border border-zinc-200 bg-black px-4 py-12 text-white">
      <div className="absolute left-[-100px] top-[-100px] h-[400px] w-[400px] rounded-full bg-blue-500/20 blur-[120px]" />
      <div className="absolute bottom-[-100px] right-[-100px] h-[320px] w-[320px] rounded-full bg-purple-500/20 blur-[120px]" />

      <div className="relative z-10 w-full max-w-md text-center">
        <FitCoreLogoMark size="lg" className="mx-auto mb-6 shadow-lg shadow-cyan-500/10" />

        <h1 className="text-4xl font-bold tracking-tight">{heading}</h1>
        <p className="mt-3 text-gray-400">{description}</p>

        {currentPlanLabel ? (
          <p className="mt-4 text-sm text-gray-500">
            Previous plan: {currentPlanLabel}
          </p>
        ) : null}

        {errorMessage ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {errorMessage}
          </p>
        ) : null}

        {portalError ? (
          <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {portalError}
          </p>
        ) : null}

        {showPortal ? (
          <button
            type="button"
            disabled={portalLoading}
            onClick={() => void openPortal()}
            className="mt-8 h-12 w-full rounded-xl border border-white/20 bg-white/10 font-semibold transition-all hover:bg-white/15 disabled:opacity-50"
          >
            {portalLoading ? "Opening portal…" : "Manage billing"}
          </button>
        ) : (
          <button
            type="button"
            disabled={loading}
            onClick={() => void subscribe(checkoutPlan)}
            className="mt-8 h-12 w-full rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 font-semibold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {loading
              ? "Redirecting…"
              : `Subscribe — ${checkoutLabel.name} €${checkoutLabel.price}/month`}
          </button>
        )}

        <p className="mt-6 text-sm text-gray-500">
          Questions?{" "}
          <Link href="/pricing" className="text-blue-400 hover:text-blue-300">
            View plan details
          </Link>
        </p>
      </div>
    </div>
  )
}

"use client"

import { Loader2 } from "lucide-react"
import { useSubscribe } from "@/app/hooks/useSubscribe"
import {
  BILLING_PLAN_DETAILS,
  type BillingPlan,
} from "@/lib/stripe-config"
import {
  landingCtaPrimaryClass,
  landingCtaSecondaryClass,
} from "@/components/landing/landing-layout"

type PricingSubscribeButtonProps = {
  plan: BillingPlan
  highlighted?: boolean
  label?: string
}

export default function PricingSubscribeButton({
  plan,
  highlighted = false,
  label,
}: PricingSubscribeButtonProps) {
  const { subscribe, loading, errorMessage } = useSubscribe(plan)
  const planDetails = BILLING_PLAN_DETAILS[plan]
  const buttonLabel =
    label ?? `Subscribe — ${planDetails.name} €${planDetails.price}/mo`

  return (
    <div>
      <button
        type="button"
        disabled={loading}
        onClick={() => void subscribe(plan)}
        className={`w-full ${highlighted ? landingCtaPrimaryClass : landingCtaSecondaryClass} disabled:opacity-50`}
      >
        {loading ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting…
          </span>
        ) : (
          buttonLabel
        )}
      </button>
      {errorMessage ? (
        <p className="mt-2 text-center text-xs text-red-400">{errorMessage}</p>
      ) : null}
    </div>
  )
}

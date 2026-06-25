"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ManageBillingProfile } from "@/lib/billing/manage-billing"
import { createClient } from "@/lib/supabase/client"

export function useSubscriptionAccess() {
  const supabase = useMemo(() => createClient(), [])
  const [profile, setProfile] = useState<ManageBillingProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setProfile(null)
      setLoading(false)
      return
    }

    const { data } = await supabase
      .from("profiles")
      .select(
        "role, coach_status, subscription_status, trial_ends_at, stripe_customer_id, billing_plan",
      )
      .eq("id", user.id)
      .maybeSingle()

    setProfile(data)
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    void load()
  }, [load])

  return {
    profile,
    loading,
    trialEndsAt: profile?.trial_ends_at,
    subscriptionStatus: profile?.subscription_status,
    role: profile?.role,
  }
}

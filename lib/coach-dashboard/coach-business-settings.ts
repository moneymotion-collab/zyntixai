import type { SupabaseClient } from "@supabase/supabase-js"
import {
  DEFAULT_REVENUE_PER_MEMBER,
} from "@/lib/coach-dashboard/compute-business-overview"
import type { CoachBusinessSettings } from "@/lib/coach-dashboard/types"
import type { Database } from "@/lib/database.types"

type SettingsRow = Database["public"]["Tables"]["coach_business_settings"]["Row"]

export function mapCoachBusinessSettings(
  row: SettingsRow | null,
): CoachBusinessSettings {
  if (!row) {
    return {
      revenuePerMember: DEFAULT_REVENUE_PER_MEMBER,
      currency: "USD",
      stripeAccountId: null,
      stripeConnected: false,
    }
  }

  return {
    revenuePerMember: Number(row.revenue_per_member) || DEFAULT_REVENUE_PER_MEMBER,
    currency: row.currency ?? "USD",
    stripeAccountId: row.stripe_account_id,
    stripeConnected: row.stripe_connected ?? false,
  }
}

export async function fetchCoachBusinessSettings(
  supabase: SupabaseClient<Database>,
  ownerId: string,
): Promise<CoachBusinessSettings> {
  const { data, error } = await supabase
    .from("coach_business_settings")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle()

  if (error) {
    console.warn("coach_business_settings fetch failed:", error.message)
    return mapCoachBusinessSettings(null)
  }

  return mapCoachBusinessSettings(data)
}

export async function upsertCoachBusinessSettings(
  supabase: SupabaseClient<Database>,
  ownerId: string,
  input: { revenuePerMember: number },
): Promise<{ settings: CoachBusinessSettings; error: string | null }> {
  const revenuePerMember = Math.max(0, input.revenuePerMember)

  const { data, error } = await supabase
    .from("coach_business_settings")
    .upsert(
      {
        owner_id: ownerId,
        revenue_per_member: revenuePerMember,
      },
      { onConflict: "owner_id" },
    )
    .select("*")
    .single()

  if (error) {
    return { settings: mapCoachBusinessSettings(null), error: error.message }
  }

  return { settings: mapCoachBusinessSettings(data), error: null }
}

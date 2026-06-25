import { NextResponse } from "next/server"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import { canAccess, type AccessProfile } from "@/lib/access/canAccess"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"

const PROFILE_ACCESS_FIELDS =
  "role, coach_status, subscription_status, trial_ends_at" as const

export type AppAccessContext = {
  supabase: SupabaseClient<Database>
  user: User
  profile: AccessProfile
}

export type RequireAppAccessResult =
  | { ok: true; context: AppAccessContext }
  | { ok: false; response: NextResponse }

async function fetchAccessProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<AccessProfile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_ACCESS_FIELDS)
    .eq("id", userId)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export async function requireAppAccess(
  existingSupabase?: SupabaseClient<Database>,
): Promise<RequireAppAccessResult> {
  const supabase = existingSupabase ?? (await createClient())

  const { data: userData, error: authError } = await supabase.auth.getUser()

  if (authError) {
    return {
      ok: false,
      response: NextResponse.json({ error: authError.message }, { status: 500 }),
    }
  }

  if (!userData.user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    }
  }

  const user = userData.user

  let profile: AccessProfile | null
  try {
    profile = await fetchAccessProfile(supabase, user.id)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Could not load profile."
    return {
      ok: false,
      response: NextResponse.json({ error: message }, { status: 500 }),
    }
  }

  if (!profile) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Profile not found." }, { status: 403 }),
    }
  }

  if (!canAccess(profile)) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Active subscription or trial required." },
        { status: 403 },
      ),
    }
  }

  return {
    ok: true,
    context: { supabase, user, profile },
  }
}

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"

type InviteRole = "coach" | "member"

export async function createGym(
  name: string,
  supabase?: SupabaseClient<Database>,
) {
  const client = supabase ?? createClient()

  const {
    data: { user },
  } = await client.auth.getUser()

  if (!user) {
    return { data: null, error: new Error("Not authenticated.") }
  }

  const { data, error } = await client
    .from("gyms")
    .insert({
      name: name.trim(),
      owner_id: user.id,
    })
    .select("id, name, owner_id")
    .single()

  return { data, error }
}

export async function createInvite(
  email: string,
  gymId: string,
  role: InviteRole = "coach",
  supabase?: SupabaseClient<Database>,
) {
  const client = supabase ?? createClient()
  const normalizedEmail = email.trim().toLowerCase()

  if (!normalizedEmail) {
    return { data: null, error: new Error("Email is required.") }
  }

  if (!gymId) {
    return { data: null, error: new Error("Gym ID is required.") }
  }

  const { data, error } = await client
    .from("invites")
    .insert({
      email: normalizedEmail,
      gym_id: gymId,
      role,
    })
    .select("id, email, gym_id, role, token, created_at")
    .single()

  return { data, error }
}

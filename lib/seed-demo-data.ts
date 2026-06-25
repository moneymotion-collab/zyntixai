import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/client"

export { createDemoGym } from "@/lib/create-demo-gym"

const DEMO_MEMBERS = [
  {
    full_name: "John Doe",
    email: "john.demo@example.com",
    goal: "Weight Loss",
    plan: "Pro",
    status: "Active",
  },
  {
    full_name: "Sarah Fit",
    email: "sarah.demo@example.com",
    goal: "Muscle Gain",
    plan: "Elite",
    status: "Active",
  },
  {
    full_name: "Mike Strong",
    email: "mike.demo@example.com",
    goal: "Hypertrophy",
    plan: "Pro",
    status: "Active",
  },
] as const

/** Members only — use createDemoGym for members + plans */
export async function seedDemoData(
  supabase?: SupabaseClient<Database>,
  coachId?: string | null,
) {
  const client = supabase ?? createClient()

  let resolvedCoachId = coachId
  if (resolvedCoachId === undefined) {
    const {
      data: { user },
    } = await client.auth.getUser()
    resolvedCoachId = user?.id ?? null
  }

  const { data, error } = await client
    .from("members")
    .insert(
      DEMO_MEMBERS.map((member) => ({
        ...member,
        coach_id: resolvedCoachId,
      })),
    )
    .select("id, full_name, email")

  return { data, error }
}

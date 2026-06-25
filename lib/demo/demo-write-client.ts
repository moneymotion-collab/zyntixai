import { NextResponse } from "next/server"
import type { SupabaseClient } from "@supabase/supabase-js"
import { getCoachScope } from "@/lib/auth/coach-scope"
import { createAdminClient } from "@/lib/supabase/admin"
import type { Database } from "@/lib/database.types"
import { createClient } from "@/lib/supabase/server"

export type DemoWriteClientResult =
  | {
      ok: true
      supabase: SupabaseClient<Database>
      writeClient: SupabaseClient<Database>
      userId: string
      userEmail: string | null
    }
  | { ok: false; response: NextResponse }

export async function getDemoWriteClient(): Promise<DemoWriteClientResult> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const scope = await getCoachScope(supabase)

  if (!scope.userId || !user) {
    return {
      ok: false,
      response: NextResponse.json({ error: "Not authenticated." }, { status: 401 }),
    }
  }

  if (!scope.isAdmin && !scope.isCoach) {
    return {
      ok: false,
      response: NextResponse.json(
        { error: "Demo data is only available for coach and admin accounts." },
        { status: 403 },
      ),
    }
  }

  const writeClient = (
    process.env.SUPABASE_SERVICE_ROLE_KEY ? createAdminClient() : supabase
  ) as SupabaseClient<Database>

  return {
    ok: true,
    supabase,
    writeClient,
    userId: scope.userId,
    userEmail: user.email ?? null,
  }
}

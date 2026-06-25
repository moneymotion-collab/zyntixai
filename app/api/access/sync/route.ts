import { NextResponse } from "next/server"
import { canAccess } from "@/lib/access/canAccess"
import {
  resolveRouteAfterAccessSync,
  syncProfileAccess,
} from "@/lib/auth/sync-profile-access"
import { createClient } from "@/lib/supabase/server"

export async function POST() {
  const supabase = await createClient()
  const profile = await syncProfileAccess(supabase)

  return NextResponse.json({
    profile,
    canAccess: canAccess(profile),
    destination: await resolveRouteAfterAccessSync(supabase, profile),
  })
}

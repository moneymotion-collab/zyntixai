import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import {
  ANALYTICS_SYNC_NO_POSTS_MESSAGE,
  REAL_ANALYTICS_NOT_CONNECTED_MESSAGE,
} from "@/lib/marketing/analytics/analytics-messages"
import { isMockSyncEnabled } from "@/lib/marketing/analytics/is-mock-sync-enabled"
import { syncPostAnalytics } from "@/lib/marketing/analytics/sync-post-analytics"
import { syncInstagramMetricsForUser } from "@/lib/marketing/instagram/sync-instagram-metrics"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"
import { createClient } from "@/lib/supabase/server"

function messageForSkipReason(
  reason: "no_instagram_connection" | "no_syncable_posts",
): string {
  if (reason === "no_instagram_connection") {
    return REAL_ANALYTICS_NOT_CONNECTED_MESSAGE
  }

  return ANALYTICS_SYNC_NO_POSTS_MESSAGE
}

export async function handleSyncAnalyticsRequest() {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  const workspaceMode = await fetchWorkspaceMode(
    supabase,
    authResult.auth.userId,
  )

  if (isMockSyncEnabled(workspaceMode)) {
    const result = await syncPostAnalytics(
      supabase,
      authResult.auth.userId,
      workspaceMode,
    )

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    revalidatePath("/marketing/analytics")

    return NextResponse.json({
      success: true,
      updated: result.updated,
      mode: result.mode,
      message: null,
    })
  }

  const result = await syncInstagramMetricsForUser(
    supabase,
    authResult.auth.userId,
    { workspaceMode },
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  revalidatePath("/marketing/analytics")

  if (result.skipped) {
    return NextResponse.json({
      success: true,
      updated: 0,
      skipped: 0,
      mode: "skipped",
      message: messageForSkipReason(result.reason),
    })
  }

  return NextResponse.json({
    success: true,
    updated: result.synced,
    skipped: result.failed,
    mode: result.mode,
    message: null,
  })
}

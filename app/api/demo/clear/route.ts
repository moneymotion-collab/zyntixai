import { NextResponse } from "next/server"
import { clearFullDemoForCoach } from "@/lib/demo/clear-full-demo"
import {
  DEMO_WORKSPACE_CLEAR_NONE_FOUND,
  DEMO_WORKSPACE_CLEAR_SUCCESS_MESSAGE,
} from "@/lib/demo/demo-copy"
import { createClient } from "@/lib/supabase/server"
import { enterLiveWorkspace } from "@/lib/workspace/workspace-mode"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Not authenticated." }, { status: 401 })
  }

  console.log("[demo/clear] current user id:", user.id)

  const result = await clearFullDemoForCoach(supabase, user.id)

  if (!result.ok) {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        members_deleted: result.membersDeleted,
      },
      { status: 500 },
    )
  }

  await enterLiveWorkspace(supabase, user.id)

  const message =
    result.membersDeleted > 0
      ? DEMO_WORKSPACE_CLEAR_SUCCESS_MESSAGE
      : DEMO_WORKSPACE_CLEAR_NONE_FOUND

  console.log("[demo/clear] deleted members:", result.membersDeleted)

  return NextResponse.json({
    success: true,
    message,
    members_deleted: result.membersDeleted,
  })
}

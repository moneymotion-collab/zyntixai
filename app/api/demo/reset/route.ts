import { NextResponse } from "next/server"
import { resetDemoWorkspaceForCoach } from "@/lib/demo/reset-demo-workspace"
import { getDemoWriteClient } from "@/lib/demo/demo-write-client"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const auth = await getDemoWriteClient()
  if (!auth.ok) {
    return auth.response
  }

  const { writeClient, userId, userEmail } = auth

  const result = await resetDemoWorkspaceForCoach(
    writeClient,
    userId,
    userEmail,
  )

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({
    success: true,
    message: "Demo workspace restored successfully.",
  })
}

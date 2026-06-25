import { NextResponse } from "next/server"
import { getDemoWriteClient } from "@/lib/demo/demo-write-client"
import { enterDemoWorkspace } from "@/lib/workspace/workspace-mode"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const auth = await getDemoWriteClient()
  if (!auth.ok) {
    return auth.response
  }

  const { writeClient, userId, userEmail } = auth

  const result = await enterDemoWorkspace(writeClient, userId, userEmail)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ success: true, mode: "demo" })
}

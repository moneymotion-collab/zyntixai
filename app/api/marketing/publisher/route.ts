import { NextResponse } from "next/server"
import { processScheduledPosts } from "@/lib/marketing/publisher/process-scheduled-posts"
import { cronAuthResponse, verifyCronRequest } from "@/lib/security/cron-auth"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const denied = verifyCronRequest(req)
  if (denied) {
    if (typeof denied.body === "string") {
      return new NextResponse(denied.body, { status: denied.status })
    }

    return NextResponse.json(denied.body, { status: denied.status })
  }

  const result = await processScheduledPosts()

  return NextResponse.json(result)
}

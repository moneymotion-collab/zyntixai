import { handleHookLibraryRequest } from "@/lib/marketing/handle-hook-library-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleHookLibraryRequest(req)
}

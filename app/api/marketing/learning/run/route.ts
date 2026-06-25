import { handleLearningRunRequest } from "@/lib/marketing/handle-learning-run-request"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function POST() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  return handleLearningRunRequest()
}

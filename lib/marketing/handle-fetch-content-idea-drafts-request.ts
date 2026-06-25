import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { fetchContentIdeaDrafts } from "@/lib/marketing/content-idea-drafts"
import { fetchWorkspaceMode } from "@/lib/workspace/workspace-mode"
import { createClient } from "@/lib/supabase/server"

export async function handleFetchContentIdeaDraftsRequest() {
  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return Response.json(
      { ideas: [], error: { message: authResult.error } },
      { status: authResult.status },
    )
  }

  const workspaceMode = await fetchWorkspaceMode(supabase, authResult.auth.userId)

  const { data: brand } = await supabase
    .from("brand_profiles")
    .select("id")
    .eq("owner_id", authResult.auth.userId)
    .maybeSingle()

  const result = await fetchContentIdeaDrafts({
    supabase,
    userId: authResult.auth.userId,
    isAdmin: authResult.auth.isAdmin,
    workspaceMode,
    brandId: brand?.id ?? null,
  })

  if (!result.ok) {
    return Response.json(
      { ideas: [], error: { message: result.error } },
      { status: 500 },
    )
  }

  return Response.json({ ideas: result.ideas, error: null })
}

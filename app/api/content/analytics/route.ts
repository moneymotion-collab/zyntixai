import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { calculateEngagementRate } from "@/lib/social/analytics"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data, error } = await supabase
    .from("content_performance")
    .select("*")
    .eq("created_by", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const totalReach = data.reduce((sum, item) => sum + Number(item.views || 0), 0)
  const totalLikes = data.reduce((sum, item) => sum + Number(item.likes || 0), 0)
  const totalComments = data.reduce((sum, item) => sum + Number(item.comments || 0), 0)
  const totalShares = data.reduce((sum, item) => sum + Number(item.shares || 0), 0)
  const totalSaves = data.reduce((sum, item) => sum + Number(item.saves || 0), 0)
  const followersGained = data.reduce(
    (sum, item) => sum + Number(item.followers_gained || 0),
    0,
  )

  const avgEngagement =
    data.length > 0
      ? Number(
          (
            data.reduce(
              (sum, item) =>
                sum +
                calculateEngagementRate({
                  reach: Number(item.views || 0),
                  likes: Number(item.likes || 0),
                  comments: Number(item.comments || 0),
                  shares: Number(item.shares || 0),
                  saves: Number(item.saves || 0),
                }),
              0,
            ) / data.length
          ).toFixed(2),
        )
      : 0

  return NextResponse.json({
    success: true,
    summary: {
      totalReach,
      totalLikes,
      totalComments,
      totalShares,
      totalSaves,
      followersGained,
      avgEngagement,
      postsAnalyzed: data.length,
    },
    rows: data,
  })
}

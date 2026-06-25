import { NextResponse } from "next/server"
import { getAiCoachAuth } from "@/lib/ai-coach/access"
import { analyzePerformanceInsights } from "@/lib/marketing/analyze-performance-insights"
import type { AnalyticsRowWithPost } from "@/lib/marketing/fetch-analytics-rows"
import { fetchAnalyticsRows } from "@/lib/marketing/fetch-analytics-rows"
import {
  analyzeAnalyticsWithOpenAi,
  generatePerformanceInsights,
} from "@/lib/marketing/generate-performance-insights"
import { aggregateContentPerformance } from "@/lib/marketing/aggregate-content-performance"
import { createClient } from "@/lib/supabase/server"
import { requireAppAccess } from "@/lib/auth/requireAppAccess"

function isAnalyticsRowWithPost(value: unknown): value is AnalyticsRowWithPost {
  if (typeof value !== "object" || value === null) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.id === "string" &&
    typeof record.brand_id === "string" &&
    typeof record.platform === "string" &&
    typeof record.views === "number"
  )
}

function parseAnalyticsRows(body: unknown): AnalyticsRowWithPost[] | null {
  if (!body || typeof body !== "object") return null

  const record = body as Record<string, unknown>
  const raw =
    Array.isArray(record.analytics)
      ? record.analytics
      : Array.isArray(record.analytics_data)
        ? record.analytics_data
        : Array.isArray(record.rows)
          ? record.rows
          : null

  if (!raw) return null

  return raw.filter(isAnalyticsRowWithPost)
}

export async function GET() {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  const { data, error } = await fetchAnalyticsRows(supabase, {
    userId: authResult.auth.userId,
    isAdmin: authResult.auth.isAdmin,
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const rows = data ?? []
  const generated = await generatePerformanceInsights(rows)

  if (!generated.ok) {
    return NextResponse.json({
      insights: generated.fallback?.insights,
      warning: generated.error,
    })
  }

  return NextResponse.json({ insights: generated.result.insights })
}

export async function POST(req: Request) {
  const access = await requireAppAccess()
  if (!access.ok) return access.response

  const supabase = await createClient()
  const authResult = await getAiCoachAuth(supabase)

  if (!authResult.ok) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status },
    )
  }

  const body = await req.json()
  const { analytics } = body

  let payload = analytics

  if (payload === undefined) {
    const rows = parseAnalyticsRows(body)

    if (rows) {
      payload = {
        totals: aggregateContentPerformance(rows),
        posts: rows,
      }
    } else {
      const { data, error } = await fetchAnalyticsRows(supabase, {
        userId: authResult.auth.userId,
        isAdmin: authResult.auth.isAdmin,
      })

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      const dbRows = data ?? []
      payload = {
        totals: aggregateContentPerformance(dbRows),
        posts: dbRows,
      }
    }
  }

  if (body?.source === "rules") {
    const rows =
      parseAnalyticsRows(body) ??
      (typeof payload === "object" &&
      payload !== null &&
      Array.isArray((payload as { posts?: unknown }).posts)
        ? (payload as { posts: AnalyticsRowWithPost[] }).posts.filter(
            isAnalyticsRowWithPost,
          )
        : [])

    return NextResponse.json({
      insights: analyzePerformanceInsights(rows).insights,
    })
  }

  const result = await analyzeAnalyticsWithOpenAi(payload)

  if (!result.ok) {
    if (result.fallback) {
      return NextResponse.json({
        insights: result.fallback,
        warning: result.error,
      })
    }

    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ insights: result.insights })
}

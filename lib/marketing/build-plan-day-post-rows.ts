import type { Database } from "@/lib/database.types"
import type { MarketingPlanItem } from "@/lib/marketing/marketing-strategy-types"

type ContentPostInsert = Database["public"]["Tables"]["content_posts"]["Insert"]

type BuildPlanDayPostRowsInput = {
  plan: MarketingPlanItem[]
  contentPlanId: string
  brandId: string
  platform: string
  createdBy: string
}

function buildCaption(caption: string, cta: string): string {
  const trimmedCaption = caption.trim()
  const trimmedCta = cta.trim()

  if (!trimmedCta) return trimmedCaption
  if (!trimmedCaption) return trimmedCta

  return `${trimmedCaption}\n\n${trimmedCta}`
}

export function buildPlanDayPostRows({
  plan,
  contentPlanId,
  brandId,
  platform,
  createdBy,
}: BuildPlanDayPostRowsInput): ContentPostInsert[] {
  return plan.map((item) => ({
    user_id: createdBy,
    created_by: createdBy,
    brand_id: brandId,
    content_plan_id: contentPlanId,
    plan_day: item.day,
    title: item.hook,
    caption: buildCaption(item.caption, item.cta),
    topic: item.hook,
    platform,
    category: item.type,
    goal: item.goal,
    status: "draft",
  }))
}

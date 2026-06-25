import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"
import {
  resolveCanonicalMetricKey,
  type MetricLogCategory,
} from "@/lib/progress/metrics"

export type InsertProgressLogInput = {
  memberId: string
  metricCategory: MetricLogCategory
  customMetricName?: string
  startValue: number
  currentValue: number
}

export async function insertProgressLog(
  supabase: SupabaseClient<Database>,
  input: InsertProgressLogInput,
): Promise<{ error: string | null }> {
  const metric = resolveCanonicalMetricKey(
    input.metricCategory,
    input.customMetricName,
  )
  const changeValue = input.currentValue - input.startValue

  const { error } = await supabase.from("progress_logs").insert([
    {
      member_id: input.memberId,
      metric,
      start_value: input.startValue,
      current_value: input.currentValue,
      change_value: changeValue,
      updated_at: new Date().toISOString(),
    },
  ])

  if (error) {
    return { error: error.message }
  }

  return { error: null }
}

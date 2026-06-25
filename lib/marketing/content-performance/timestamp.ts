import type { ContentPerformanceRow } from "@/lib/marketing/content-performance/types"

export function getContentPerformanceTimestamp(
  row: ContentPerformanceRow,
): string {
  return row.created_at
}

import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

/** Untyped filter chain for demo-only optional columns (e.g. is_demo). */
export type DemoFilterChain = {
  eq(column: string, value: unknown): DemoFilterChain
  in(column: string, values: readonly unknown[]): DemoFilterChain
  or(filters: string): DemoFilterChain
  order(column: string, options?: { ascending?: boolean }): DemoFilterChain
  select(
    columns?: string,
    options?: { count?: "exact"; head?: boolean },
  ): Promise<{
    data: unknown
    error: { message: string } | null
    count?: number | null
  }>
  delete(options?: { count?: "exact" }): DemoFilterChain
  insert(values: Record<string, unknown> | Record<string, unknown>[]): {
    select(columns?: string): Promise<{
      data: unknown
      error: { message: string } | null
    }>
  }
}

export function demoFilter(
  supabase: SupabaseClient<Database>,
  table: string,
): DemoFilterChain {
  return supabase.from(
    table as keyof Database["public"]["Tables"],
  ) as unknown as DemoFilterChain
}

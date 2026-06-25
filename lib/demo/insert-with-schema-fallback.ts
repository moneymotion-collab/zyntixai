import type { SupabaseClient } from "@supabase/supabase-js"
import type { Database } from "@/lib/database.types"

const DEFAULT_MAX_ATTEMPTS = 16

export type DemoInsertResult = {
  data: Array<Record<string, unknown>> | null
  error: { message: string } | null
}

export function parseMissingColumn(errorMessage: string): string | null {
  const schemaCache = errorMessage.match(/Could not find the '([^']+)' column/)
  if (schemaCache) {
    return schemaCache[1]
  }

  const postgres = errorMessage.match(
    /column "([^"]+)" (?:of relation )?does not exist/,
  )
  if (postgres) {
    return postgres[1]
  }

  return null
}

function roundDecimalFields(
  row: Record<string, unknown>,
): Record<string, unknown> {
  const next = { ...row }

  for (const [key, value] of Object.entries(next)) {
    if (typeof value === "number" && !Number.isInteger(value)) {
      next[key] = Math.round(value)
    }
  }

  return next
}

function isIntegerSyntaxError(message: string): boolean {
  return message.includes("invalid input syntax for type integer")
}

function isContentTypeCheckError(message: string): boolean {
  return (
    message.includes("content_performance_content_type_check") ||
    (message.includes("check constraint") && message.includes("content_type"))
  )
}

function toLegacyPerformanceContentType(value: unknown): string {
  const normalized = String(value ?? "").toLowerCase()
  if (normalized === "promotion" || normalized === "promotional") {
    return "promotional"
  }
  return "educational"
}

type InsertWithSchemaFallbackOptions = {
  maxAttempts?: number
  select?: string
  useDemoFlag?: boolean
}

type LooseSupabaseClient = {
  from: (table: string) => {
    insert: (payload: Record<string, unknown>[]) => {
      select: (columns: string) => Promise<DemoInsertResult>
    }
  }
}

export async function insertWithSchemaFallback(
  supabase: SupabaseClient<Database>,
  table: string,
  rows: Array<Record<string, unknown>>,
  options: InsertWithSchemaFallbackOptions = {},
): Promise<DemoInsertResult> {
  const {
    maxAttempts = DEFAULT_MAX_ATTEMPTS,
    select = "id",
    useDemoFlag = true,
  } = options

  let payload: Record<string, unknown>[] = useDemoFlag
    ? rows.map((row) => ({ ...row, is_demo: true }))
    : rows.map((row) => ({ ...row }))
  let demoStripped = !useDemoFlag
  let contentTypeLegacyApplied = false
  let decimalsRounded = false

  const client = supabase as unknown as LooseSupabaseClient

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const result = await client.from(table).insert(payload).select(select)

    if (!result.error) {
      return result
    }

    const message = result.error.message

    if (!demoStripped && message.includes("is_demo")) {
      payload = payload.map(({ is_demo: _isDemo, ...rest }) => rest)
      demoStripped = true
      continue
    }

    const missingColumn = parseMissingColumn(message)
    if (missingColumn) {
      payload = payload.map((row) => {
        const next = { ...row }
        delete next[missingColumn]
        return next
      })
      continue
    }

    if (
      table === "content_performance" &&
      !contentTypeLegacyApplied &&
      isContentTypeCheckError(message)
    ) {
      payload = payload.map((row) => ({
        ...row,
        content_type: toLegacyPerformanceContentType(row.content_type),
      }))
      contentTypeLegacyApplied = true
      continue
    }

    if (!decimalsRounded && isIntegerSyntaxError(message)) {
      payload = payload.map((row) => roundDecimalFields(row))
      decimalsRounded = true
      continue
    }

    return result
  }

  return {
    data: null,
    error: { message: `${table} insert failed after schema retries.` },
  }
}

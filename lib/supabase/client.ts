import { createBrowserClient } from "@supabase/ssr"
import type { Database } from "@/lib/database.types"

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !key) {
    throw new Error(
      "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local, then restart the dev server.",
    )
  }

  return { url, key }
}

export function createClient() {
  const { url, key } = getSupabaseEnv()

  // Middleware refreshes the session on each request; disabling browser-side
  // auto-refresh avoids racing refresh_token calls that surface as "Failed to fetch".
  return createBrowserClient<Database>(url, key, {
    auth: {
      autoRefreshToken: false,
    },
  })
}

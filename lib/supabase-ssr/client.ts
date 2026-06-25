// FITAI -> Supabase: browser client (scaffold)
//
// To enable real Supabase calls from client components, install:
//
//   npm install @supabase/supabase-js @supabase/ssr
//
// ...then uncomment the implementation below and remove the stub at the
// bottom of this file. Configure the required env vars in `.env.local`:
//
//   NEXT_PUBLIC_SUPABASE_URL=...
//   NEXT_PUBLIC_SUPABASE_ANON_KEY=...

// import { createBrowserClient } from "@supabase/ssr"
// import type { Database } from "./database.types"
//
// export function createClient() {
//   return createBrowserClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//   )
// }

export function createClient(): never {
  throw new Error(
    "Supabase browser client not configured. See lib/supabase/client.ts for setup steps.",
  )
}
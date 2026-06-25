// FITAI -> Supabase: server client (scaffold)
//
// Used from Server Components, Route Handlers, and Server Actions.
//
// To enable, install:
//
//   npm install @supabase/supabase-js @supabase/ssr
//
// ...then uncomment the implementation below and remove the stub. The
// `cookies()` helper is required by @supabase/ssr to read/write the
// session cookie on the server.

// import { cookies } from "next/headers"
// import { createServerClient } from "@supabase/ssr"
// import type { Database } from "./database.types"
//
// export async function createClient() {
//   const cookieStore = await cookies()
//
//   return createServerClient<Database>(
//     process.env.NEXT_PUBLIC_SUPABASE_URL!,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
//     {
//       cookies: {
//         getAll() {
//           return cookieStore.getAll()
//         },
//         setAll(cookiesToSet) {
//           try {
//             cookiesToSet.forEach(({ name, value, options }) =>
//               cookieStore.set(name, value, options),
//             )
//           } catch {
//             // Setting cookies from a Server Component throws; safe to ignore
//             // when the middleware refreshes sessions.
//           }
//         },
//       },
//     },
//   )
// }

export async function createClient(): Promise<never> {
  throw new Error(
    "Supabase server client not configured. See lib/supabase/server.ts for setup steps.",
  )
}
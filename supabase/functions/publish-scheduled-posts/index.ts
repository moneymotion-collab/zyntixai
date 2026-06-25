import { createClient } from "npm:@supabase/supabase-js@2"
import { processScheduledPosts } from "../../../lib/marketing/publisher/process-scheduled-posts.ts"
import { socialEnvFromGetter } from "../../../lib/marketing/social-publish/index.ts"
import {
  cronAuthResponse,
  verifyCronRequest,
} from "../../../lib/security/cron-auth.ts"

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
)

const socialEnv = socialEnvFromGetter((key) => Deno.env.get(key) ?? undefined)

const envGetter = (key: string) => Deno.env.get(key) ?? undefined

Deno.serve(async (req) => {
  const denied = verifyCronRequest(req, envGetter)
  if (denied) {
    return cronAuthResponse(denied)
  }

  try {
    const result = await processScheduledPosts({ supabase, env: socialEnv })

    if (result.published === 0) {
      return new Response(result.message ?? "No posts to publish")
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Cron publish failed."
    return new Response(message, { status: 500 })
  }
})

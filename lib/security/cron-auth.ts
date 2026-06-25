export type CronAuthFailure = {
  status: number
  body: string | Record<string, unknown>
}

type EnvGetter = (key: string) => string | undefined

function defaultEnvGetter(key: string): string | undefined {
  return process.env[key]
}

export function getCronSecret(
  envGetter: EnvGetter = defaultEnvGetter,
): string | undefined {
  return envGetter("CRON_SECRET")?.trim() || undefined
}

/** True when cron endpoints must reject unauthenticated or unconfigured requests. */
export function isProductionCronRuntime(
  envGetter: EnvGetter = defaultEnvGetter,
): boolean {
  if (envGetter("NODE_ENV") === "production") return true
  if (envGetter("VERCEL_ENV") === "production") return true

  const supabaseUrl =
    envGetter("SUPABASE_URL") ??
    envGetter("NEXT_PUBLIC_SUPABASE_URL") ??
    ""

  if (supabaseUrl && !/localhost|127\.0\.0\.1/i.test(supabaseUrl)) {
    return true
  }

  return false
}

export function verifyCronRequest(
  req: Request,
  envGetter: EnvGetter = defaultEnvGetter,
): CronAuthFailure | null {
  const cronSecret = getCronSecret(envGetter)

  if (isProductionCronRuntime(envGetter) && !cronSecret) {
    return {
      status: 503,
      body: { error: "CRON_SECRET is required in production." },
    }
  }

  if (!cronSecret) {
    return null
  }

  const authHeader = req.headers.get("Authorization")
  if (authHeader !== `Bearer ${cronSecret}`) {
    return { status: 401, body: "Unauthorized" }
  }

  return null
}

export function cronAuthResponse(failure: CronAuthFailure): Response {
  if (typeof failure.body === "string") {
    return new Response(failure.body, { status: failure.status })
  }

  return Response.json(failure.body, { status: failure.status })
}

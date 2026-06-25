import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"
import { createClient } from "@supabase/supabase-js"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, "..")

function loadEnvLocal() {
  const envPath = path.join(rootDir, ".env.local")
  if (!fs.existsSync(envPath)) return
  for (const line of fs.readFileSync(envPath, "utf8").split("\n")) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq).trim()
    let value = trimmed.slice(eq + 1).trim()
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }
    if (process.env[key] === undefined) process.env[key] = value
  }
}

loadEnvLocal()

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

const { data, error } = await supabase
  .from("social_connections")
  .select("user_id, access_token, instagram_business_account_id, account_username, page_id, created_at")
  .eq("provider", "instagram")

if (error) {
  console.error(error)
  process.exit(1)
}

for (const row of data ?? []) {
  const token = row.access_token ?? ""
  const masked =
    token.length > 12
      ? `${token.slice(0, 6)}…${token.slice(-4)}`
      : token || "(empty)"

  console.log({
    user_id: row.user_id,
    ig_account: row.instagram_business_account_id,
    username: row.account_username,
    page_id: row.page_id,
    token_length: token.length,
    token_masked: masked,
    token_has_space: /\s/.test(token),
    token_starts_with_bearer: token.toLowerCase().startsWith("bearer"),
    updated_at: row.created_at,
  })

  if (token.trim()) {
    const res = await fetch(
      `https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${encodeURIComponent(token.trim())}`,
    )
    const payload = await res.json()
    console.log("graph_me:", payload)
  }
}

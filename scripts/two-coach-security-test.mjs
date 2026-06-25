/**
 * Fase 3 — Two-coach end-to-end tenant isolation test.
 * Run: node scripts/two-coach-security-test.mjs
 */
import { createClient } from "@supabase/supabase-js"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"

function loadEnvFile(filePath) {
  try {
    const content = readFileSync(filePath, "utf8")
    for (const line of content.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      let value = trimmed.slice(eq + 1).trim()
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = value
    }
  } catch {
    // optional
  }
}

loadEnvFile(resolve(process.cwd(), ".env.local"))

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const TEST_PASSWORD = "E2eSecurityTest!2026"
const RUN_ID = Date.now().toString(36)

const ACCOUNTS = {
  coachA: `e2e-coach-a-${RUN_ID}@security.fitcore.test`,
  coachB: `e2e-coach-b-${RUN_ID}@security.fitcore.test`,
  memberA: `e2e-member-a-${RUN_ID}@security.fitcore.test`,
  memberB: `e2e-member-b-${RUN_ID}@security.fitcore.test`,
}

const results = []
const leaks = []
const failedApis = []

function record(name, pass, detail = "") {
  results.push({ name, pass, detail })
  const status = pass ? "PASS" : "FAIL"
  console.log(`${status}  ${name}${detail ? ` — ${detail}` : ""}`)
  if (!pass) leaks.push({ name, detail })
}

function authClient(accessToken) {
  return createClient(url, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}

async function ensureAuthUser(admin, email, password) {
  const { data: created, error: createError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (!createError && created.user) {
    return created.user
  }

  if (createError?.message?.toLowerCase().includes("already")) {
    const { data: listed } = await admin.auth.admin.listUsers({ perPage: 1000 })
    const existing = listed?.users?.find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    )
    if (existing) return existing
  }

  throw new Error(`Could not create user ${email}: ${createError?.message ?? "unknown"}`)
}

async function signIn(email, password) {
  const client = createClient(url, anonKey)
  const { data, error } = await client.auth.signInWithPassword({ email, password })
  if (error || !data.session?.access_token) {
    throw new Error(`Sign-in failed for ${email}: ${error?.message ?? "no session"}`)
  }
  return data.session.access_token
}

async function upsertProfile(admin, userId, role, email) {
  const trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
  const row = {
    id: userId,
    email,
    role,
    subscription_status: "trialing",
    trial_ends_at: trialEndsAt,
    coach_status: role === "coach" ? "approved" : null,
  }

  let { error } = await admin.from("profiles").upsert(row, { onConflict: "id" })
  if (error?.message?.includes("subscription_status")) {
    ;({ error } = await admin
      .from("profiles")
      .upsert({ ...row, subscription_status: "trial" }, { onConflict: "id" }))
  }
  if (error) throw new Error(`Profile upsert failed (${role}): ${error.message}`)
}

async function main() {
  if (!url || !anonKey || !serviceKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL, ANON_KEY, or SERVICE_ROLE_KEY in .env.local")
    process.exit(2)
  }

  const admin = createClient(url, serviceKey)

  console.log(`\n=== Fase 3 Two-Coach Security Test (run ${RUN_ID}) ===\n`)

  const coachAUser = await ensureAuthUser(admin, ACCOUNTS.coachA, TEST_PASSWORD)
  const coachBUser = await ensureAuthUser(admin, ACCOUNTS.coachB, TEST_PASSWORD)
  const memberAUser = await ensureAuthUser(admin, ACCOUNTS.memberA, TEST_PASSWORD)
  const memberBUser = await ensureAuthUser(admin, ACCOUNTS.memberB, TEST_PASSWORD)

  await upsertProfile(admin, coachAUser.id, "coach", ACCOUNTS.coachA)
  await upsertProfile(admin, coachBUser.id, "coach", ACCOUNTS.coachB)
  await upsertProfile(admin, memberAUser.id, "member", ACCOUNTS.memberA)
  await upsertProfile(admin, memberBUser.id, "member", ACCOUNTS.memberB)

  const { data: memberA, error: memberAError } = await admin
    .from("members")
    .insert({
      coach_id: coachAUser.id,
      full_name: "E2E Member A",
      email: ACCOUNTS.memberA,
      goal: "Strength",
      plan: "Pro",
      status: "Active",
    })
    .select("id")
    .single()

  if (memberAError) throw new Error(`Member A insert: ${memberAError.message}`)

  const { data: memberB, error: memberBError } = await admin
    .from("members")
    .insert({
      coach_id: coachBUser.id,
      full_name: "E2E Member B",
      email: ACCOUNTS.memberB,
      goal: "Fat Loss",
      plan: "Pro",
      status: "Active",
    })
    .select("id")
    .single()

  if (memberBError) throw new Error(`Member B insert: ${memberBError.message}`)

  await admin.from("members").update({ user_id: memberAUser.id }).eq("id", memberA.id)
  await admin.from("members").update({ user_id: memberBUser.id }).eq("id", memberB.id)

  const { data: workoutPlanA } = await admin
    .from("workout_plans")
    .insert({
      title: `E2E Plan A ${RUN_ID}`,
      goal: "Security test",
      weeks: 4,
      created_by: coachAUser.id,
    })
    .select("id")
    .single()

  const { data: nutritionPlanA } = await admin
    .from("nutrition_plans")
    .insert({
      title: `E2E Nutrition A ${RUN_ID}`,
      calories: 2000,
      protein: 150,
      carbs: 200,
      fats: 60,
      created_by: coachAUser.id,
    })
    .select("id")
    .single()

  await admin.from("workout_assignments").insert({
    member_id: memberA.id,
    workout_plan_id: workoutPlanA.id,
    status: "active",
  })

  await admin.from("member_nutrition_assignments").insert({
    member_id: memberA.id,
    nutrition_plan_id: nutritionPlanA.id,
    status: "active",
  })

  await admin.from("progress_logs").insert({
    member_id: memberA.id,
    metric: "weight",
    start_value: 80,
    current_value: 78,
    change_value: -2,
  })

  await admin.from("sessions").insert({
    member_id: memberA.id,
    coach: "Coach A",
    session_type: "Personal Training",
    scheduled_date: new Date().toISOString().slice(0, 10),
    scheduled_time: "10:00",
    duration: 60,
    status: "gepland",
  })

  await admin.from("content_posts").insert({
    user_id: coachAUser.id,
    created_by: coachAUser.id,
    title: `E2E Marketing A ${RUN_ID}`,
    caption: "Coach A private post",
    platform: "instagram",
    status: "draft",
  })

  await admin.from("check_ins").insert({
    member_id: memberA.id,
    weight_kg: 80,
    energy: 8,
    sleep: 7,
    motivation: 8,
    notes: `E2E check-in A ${RUN_ID}`,
  })

  await admin.from("client_reminders").insert({
    member_id: memberA.id,
    coach_id: coachAUser.id,
    title: `E2E Reminder A ${RUN_ID}`,
    message: "Follow up",
    reminder_type: "check_in",
    priority: "medium",
    due_date: new Date().toISOString().slice(0, 10),
    status: "open",
  })

  const coachAToken = await signIn(ACCOUNTS.coachA, TEST_PASSWORD)
  const coachBToken = await signIn(ACCOUNTS.coachB, TEST_PASSWORD)
  const memberAToken = await signIn(ACCOUNTS.memberA, TEST_PASSWORD)
  const memberBToken = await signIn(ACCOUNTS.memberB, TEST_PASSWORD)

  const coachAClient = authClient(coachAToken)
  const coachBClient = authClient(coachBToken)
  const memberAClient = authClient(memberAToken)
  const memberBClient = authClient(memberBToken)

  async function coachBSeesNone(table, filter) {
    const query = coachBClient.from(table).select("*")
    const { data, error } = await filter(query)
    if (error) {
      record(`Coach B isolation: ${table}`, false, error.message)
      return
    }
    const leaked = (data ?? []).filter((row) =>
      JSON.stringify(row).includes(memberA.id) ||
      JSON.stringify(row).includes(coachAUser.id) ||
      JSON.stringify(row).includes(`E2E`) && JSON.stringify(row).includes(RUN_ID),
    )
    record(
      `Coach B cannot see Coach A ${table}`,
      leaked.length === 0,
      leaked.length > 0 ? `leaked ${leaked.length} row(s)` : `${data?.length ?? 0} visible`,
    )
  }

  await coachBSeesNone("members", (q) => q.eq("id", memberA.id))
  await coachBSeesNone("workout_plans", (q) => q.eq("id", workoutPlanA.id))
  await coachBSeesNone("workout_assignments", (q) => q.eq("member_id", memberA.id))
  await coachBSeesNone("nutrition_plans", (q) => q.eq("id", nutritionPlanA.id))
  await coachBSeesNone("member_nutrition_assignments", (q) => q.eq("member_id", memberA.id))
  await coachBSeesNone("progress_logs", (q) => q.eq("member_id", memberA.id))
  await coachBSeesNone("sessions", (q) => q.eq("member_id", memberA.id))
  await coachBSeesNone("content_posts", (q) => q.eq("created_by", coachAUser.id))

  const { data: coachBCheckIns } = await coachBClient
    .from("check_ins")
    .select("*")
    .eq("member_id", memberA.id)

  record(
    "Coach B cannot see Coach A check_ins",
    (coachBCheckIns ?? []).length === 0,
    (coachBCheckIns ?? []).length > 0
      ? `LEAK: ${coachBCheckIns.length} check_in row(s) visible`
      : "0 rows",
  )

  const { data: memberBSeesMemberA } = await memberBClient
    .from("members")
    .select("id")
    .eq("id", memberA.id)

  record(
    "Member B cannot see Member A profile",
    (memberBSeesMemberA ?? []).length === 0,
    `${memberBSeesMemberA?.length ?? 0} rows`,
  )

  const { data: memberASeesCoachBPosts } = await memberAClient
    .from("content_posts")
    .select("id")
    .eq("created_by", coachBUser.id)

  record(
    "Member A cannot access Coach B marketing",
    (memberASeesCoachBPosts ?? []).length === 0,
    `${memberASeesCoachBPosts?.length ?? 0} rows`,
  )

  const { data: coachASeesOwnMember } = await coachAClient
    .from("members")
    .select("id")
    .eq("id", memberA.id)

  record(
    "Coach A flow: can see own member",
    (coachASeesOwnMember ?? []).length === 1,
    `${coachASeesOwnMember?.length ?? 0} rows`,
  )

  const { data: coachBAllMembers } = await coachBClient
    .from("members")
    .select("id, email")
    .ilike("email", `%${RUN_ID}%`)

  const coachBOnlyOwn = (coachBAllMembers ?? []).every((m) => m.id === memberB.id)
  record(
    "Coach B sees only own test members",
    coachBOnlyOwn && (coachBAllMembers ?? []).length === 1,
    `visible: ${(coachBAllMembers ?? []).map((m) => m.email).join(", ") || "none"}`,
  )

  // API-style checks via Supabase REST (same JWT the app uses for RLS)
  const restBase = `${url}/rest/v1`
  async function restGet(path, token) {
    const res = await fetch(`${restBase}${path}`, {
      headers: {
        apikey: anonKey,
        Authorization: `Bearer ${token}`,
      },
    })
    const body = await res.json().catch(() => null)
    return { status: res.status, body }
  }

  const memberAProgressAsB = await restGet(
    `/progress_logs?member_id=eq.${memberA.id}&select=id`,
    coachBToken,
  )
  const progressLeaked = Array.isArray(memberAProgressAsB.body) && memberAProgressAsB.body.length > 0
  record(
    "API/RLS: Coach B GET progress_logs for Member A",
    !progressLeaked,
    progressLeaked ? `leaked ${memberAProgressAsB.body.length}` : "empty",
  )
  if (progressLeaked) failedApis.push("GET /rest/v1/progress_logs (Coach B → Coach A member)")

  const checkInsAsB = await restGet(
    `/check_ins?member_id=eq.${memberA.id}&select=id`,
    coachBToken,
  )
  const checkInsLeaked = Array.isArray(checkInsAsB.body) && checkInsAsB.body.length > 0
  record(
    "API/RLS: Coach B GET check_ins for Member A",
    !checkInsLeaked,
    checkInsLeaked ? `leaked ${checkInsAsB.body.length}` : "empty",
  )
  if (checkInsLeaked) failedApis.push("GET /rest/v1/check_ins (Coach B → Coach A member)")

  const passed = results.filter((r) => r.pass).length
  const failed = results.filter((r) => !r.pass).length
  const total = results.length
  const overall = failed === 0 ? "PASS" : failed <= 2 ? "PARTIAL" : "FAIL"

  console.log(`\n=== Summary: ${passed}/${total} security ${overall} ===`)
  if (failed === 0) {
    console.log(`Expected launch gate: ${total}/${total} security PASS`)
  }
  console.log(`Overall isolation: ${overall}`)
  if (leaks.length > 0) {
    console.log("\nLeaked data:")
    for (const leak of leaks) {
      console.log(`  - ${leak.name}: ${leak.detail}`)
    }
  }
  if (failedApis.length > 0) {
    console.log("\nFailed APIs:")
    for (const api of failedApis) console.log(`  - ${api}`)
  }

  // Cleanup test data
  await admin.from("client_reminders").delete().ilike("title", `%${RUN_ID}%`)
  await admin.from("check_ins").delete().eq("member_id", memberA.id)
  await admin.from("content_posts").delete().ilike("title", `%${RUN_ID}%`)
  await admin.from("sessions").delete().eq("member_id", memberA.id)
  await admin.from("progress_logs").delete().eq("member_id", memberA.id)
  await admin.from("member_nutrition_assignments").delete().eq("member_id", memberA.id)
  await admin.from("workout_assignments").delete().eq("member_id", memberA.id)
  await admin.from("nutrition_plans").delete().eq("id", nutritionPlanA.id)
  await admin.from("workout_plans").delete().eq("id", workoutPlanA.id)
  await admin.from("members").delete().in("id", [memberA.id, memberB.id])

  process.exit(failed === 0 ? 0 : 1)
}

main().catch((error) => {
  console.error("Security test aborted:", error.message)
  process.exit(2)
})

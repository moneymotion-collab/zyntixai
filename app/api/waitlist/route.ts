import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const BUSINESS_TYPES = [
  "Online Coach",
  "Personal Trainer",
  "Gym Owner",
  "Beta Tester",
  "Other",
] as const

type BusinessType = (typeof BUSINESS_TYPES)[number]

const SUCCESS_MESSAGE =
  "You're on the list. We'll contact you when beta access opens."

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      name?: string
      email?: string
      business_type?: string
    }

    const name = body.name?.trim() ?? ""
    const email = normalizeEmail(body.email ?? "")
    const businessType = body.business_type?.trim() ?? ""

    if (name.length < 2) {
      return NextResponse.json(
        { error: "Please enter your name." },
        { status: 400 },
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 },
      )
    }

    if (!BUSINESS_TYPES.includes(businessType as BusinessType)) {
      return NextResponse.json(
        { error: "Please select a business type." },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()

    const { error } = await supabase.from("beta_waitlist").insert({
      name,
      email,
      business_type: businessType,
    })

    if (error) {
      if (error.code === "23505") {
        return NextResponse.json({
          success: true,
          message: SUCCESS_MESSAGE,
        })
      }

      console.error("beta_waitlist insert error:", error)
      return NextResponse.json(
        { error: "Could not join the waitlist. Please try again." },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      message: SUCCESS_MESSAGE,
    })
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Unknown error"

    if (message.includes("SUPABASE_SERVICE_ROLE_KEY")) {
      return NextResponse.json(
        { error: "Waitlist is temporarily unavailable." },
        { status: 503 },
      )
    }

    console.error("waitlist API error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

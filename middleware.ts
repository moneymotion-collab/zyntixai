import { NextResponse, type NextRequest } from "next/server"
import { canAccess } from "@/lib/access/canAccess"
import {
  getProfileFromSession,
  refreshSessionFromRequest,
} from "@/lib/access/getProfileFromSession"
import { hasCompletedCoachOnboarding } from "@/lib/auth/coach-onboarding"
import { normalizeRole } from "@/lib/auth/roles"
import { isCoachOnboardingExemptPath } from "@/lib/navigation/coach-onboarding-paths"
import { isPublicAppPath } from "@/lib/navigation/is-public-path"

function isApiPath(pathname: string) {
  return pathname === "/api" || pathname.startsWith("/api/")
}

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname

  if (isPublicAppPath(path)) {
    const { response } = await refreshSessionFromRequest(req)
    return response
  }

  if (isApiPath(path)) {
    const { user, profile, response, supabase } = await getProfileFromSession(req)

    if (
      user &&
      profile &&
      canAccess(profile) &&
      normalizeRole(profile.role) === "coach" &&
      !isCoachOnboardingExemptPath(path) &&
      !(await hasCompletedCoachOnboarding(supabase, user.id))
    ) {
      return NextResponse.json(
        { error: "Coach onboarding incomplete.", redirect: "/onboarding" },
        { status: 403, headers: response.headers },
      )
    }

    return response
  }

  const { user, profile, response, supabase } = await getProfileFromSession(req)

  if (!user) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (!profile) {
    return response
  }

  if (!canAccess(profile)) {
    const url = req.nextUrl.clone()
    url.pathname = "/trial-ended"
    return NextResponse.redirect(url)
  }

  const normalizedRole = normalizeRole(profile.role)

  if (
    normalizedRole === "coach" &&
    !isCoachOnboardingExemptPath(path) &&
    !(await hasCompletedCoachOnboarding(supabase, user.id))
  ) {
    const url = req.nextUrl.clone()
    url.pathname = "/onboarding"
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}

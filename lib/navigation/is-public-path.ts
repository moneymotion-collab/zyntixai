const PUBLIC_EXACT_PATHS = ["/"]
const PUBLIC_PREFIXES = [
  "/login",
  "/register",
  "/auth",
  "/onboarding",
  "/pricing",
  "/privacy",
  "/terms",
  "/about",
  "/contact",
  "/workspace",
  "/trial-ended",
]

export function isPublicAppPath(pathname: string): boolean {
  if (PUBLIC_EXACT_PATHS.includes(pathname)) {
    return true
  }

  return PUBLIC_PREFIXES.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  )
}

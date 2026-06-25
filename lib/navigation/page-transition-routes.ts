/** Public/marketing landing routes — skip enter/exit transitions. */
const PUBLIC_EXACT = new Set(["/", "/pricing", "/trial-ended"])

const PUBLIC_PREFIXES = ["/login", "/register", "/auth"] as const

export function isPageTransitionRoute(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) {
    return false
  }

  return !PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )
}

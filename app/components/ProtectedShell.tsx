"use client"

import { type ReactNode, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/app/providers/AuthProvider"
import { hasRole } from "@/lib/auth/roles"
import type { UserRole } from "@/lib/types/roles"

type ProtectedShellProps = {
  children: ReactNode
  allowed?: UserRole[]
  fallbackHref?: string
}

export default function ProtectedShell({
  children,
  allowed,
  fallbackHref = "/dashboard",
}: ProtectedShellProps) {
  const router = useRouter()
  const { loading, role, user } = useAuth()

  const roleAllowed =
    !allowed || allowed.length === 0 || hasRole(role, allowed)

  useEffect(() => {
    if (loading || !user) return
    if (!roleAllowed) {
      router.replace(fallbackHref)
    }
  }, [loading, user, roleAllowed, fallbackHref, router])

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || !roleAllowed) {
    return null
  }

  return children
}

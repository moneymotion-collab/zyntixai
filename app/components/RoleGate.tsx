"use client"

import { type ReactNode } from "react"
import { hasRole } from "@/lib/auth/roles"
import type { UserRole } from "@/lib/types/roles"
import { useRole } from "../hooks/useRole"
import AuthLoadingState from "./AuthLoadingState"
import UnauthorizedState from "./UnauthorizedState"

type RoleGateProps = {
  allowed: UserRole[]
  children: ReactNode
  fallbackHref?: string
  loadingMessage?: string
}

export default function RoleGate({
  allowed,
  children,
  fallbackHref = "/dashboard",
  loadingMessage = "Checking permissions…",
}: RoleGateProps) {
  const { role, loading } = useRole()

  if (loading) {
    return <AuthLoadingState message={loadingMessage} />
  }

  if (!hasRole(role, allowed)) {
    return <UnauthorizedState role={role} fallbackHref={fallbackHref} />
  }

  return children
}

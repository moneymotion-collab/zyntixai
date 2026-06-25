"use client"

import { useAuth } from "@/app/providers/AuthProvider"

export function useRole() {
  const { role, rawRole, loading, error, setRole, refetch } = useAuth()

  return {
    role,
    rawRole,
    loading,
    error,
    setRole,
    refetch,
  }
}

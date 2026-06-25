"use client"

import { useState } from "react"
import { useAuth } from "@/app/providers/AuthProvider"
import { signOut } from "@/lib/auth/sign-out"

export default function SignOutButton() {
  const { setRole, setUser } = useAuth()
  const [loading, setLoading] = useState(false)

  const logout = async () => {
    setLoading(true)
    setRole(null)
    setUser(null)
    await signOut()
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="rounded-xl bg-red-500 px-4 py-2 text-white transition hover:bg-red-600 disabled:opacity-50"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  )
}

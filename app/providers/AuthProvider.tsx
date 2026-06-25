"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react"
import type { AuthChangeEvent, User } from "@supabase/supabase-js"
import { normalizeRole } from "@/lib/auth/roles"
import type { UserRole } from "@/lib/types/roles"
import { createClient } from "@/lib/supabase/client"

type AuthContextValue = {
  user: User | null
  role: UserRole | null
  rawRole: string
  loading: boolean
  error: string | null
  setUser: (user: User | null) => void
  setRole: (role: UserRole | null) => void
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => createClient(), [])
  const mountedRef = useRef(true)
  const [user, setUser] = useState<User | null>(null)
  const [role, setRoleState] = useState<UserRole | null>(null)
  const [rawRole, setRawRole] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const setRole = useCallback((nextRole: UserRole | null) => {
    setRoleState(nextRole)
    setRawRole(nextRole ?? "")
  }, [])

  const clearAuth = useCallback(() => {
    setUser(null)
    setRoleState(null)
    setRawRole("")
    setError(null)
    setLoading(false)
  }, [])

  const loadProfile = useCallback(
    async (userId: string) => {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle()

      if (!mountedRef.current) {
        return
      }

      if (profileError) {
        setError(profileError.message)
        setRoleState(null)
        setRawRole("")
        setLoading(false)
        return
      }

      const nextRawRole = profile?.role ?? ""
      setRawRole(nextRawRole)
      setRoleState(normalizeRole(nextRawRole))
      setError(null)
      setLoading(false)
    },
    [supabase],
  )

  const refetch = useCallback(async () => {
    if (!mountedRef.current) {
      return
    }

    setLoading(true)
    setError(null)

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (!mountedRef.current) {
      return
    }

    if (sessionError) {
      setError(sessionError.message)
      clearAuth()
      return
    }

    if (!session?.user) {
      clearAuth()
      return
    }

    setUser(session.user)
    await loadProfile(session.user.id)
  }, [supabase, clearAuth, loadProfile])

  useEffect(() => {
    mountedRef.current = true
    let active = true

    const handleAuthChange = async (
      event: AuthChangeEvent,
      session: { user: User } | null,
    ) => {
      if (!active) {
        return
      }

      if (!session?.user) {
        if (event === "INITIAL_SESSION" || event === "SIGNED_OUT") {
          clearAuth()
        }
        return
      }

      setUser(session.user)

      // Middleware already refreshed the session; avoid duplicate network calls.
      if (event === "TOKEN_REFRESHED") {
        setLoading(false)
        return
      }

      setLoading(true)
      await loadProfile(session.user.id)

      if (!active || !mountedRef.current) {
        return
      }
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      void handleAuthChange(event, session)
    })

    void supabase.auth.getSession().then(({ error: sessionError }) => {
      if (!active || !sessionError) {
        return
      }

      if (
        sessionError.message.includes("Failed to fetch") ||
        sessionError.message.includes("refresh")
      ) {
        void supabase.auth.signOut({ scope: "local" })
        clearAuth()
      }
    })

    return () => {
      active = false
      mountedRef.current = false
      subscription.unsubscribe()
    }
  }, [supabase, clearAuth, loadProfile])

  const value = useMemo(
    () => ({
      user,
      role,
      rawRole,
      loading,
      error,
      setUser,
      setRole,
      refetch,
    }),
    [user, role, rawRole, loading, error, setRole, refetch],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}

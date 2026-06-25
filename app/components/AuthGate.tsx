"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import AuthLoadingState from "./AuthLoadingState"

export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const supabase = createClient()

    const applySession = (hasSession: boolean) => {
      if (!hasSession) {
        setAllowed(false)
        setChecking(false)
        router.replace("/login")
        return
      }

      setAllowed(true)
      setChecking(false)
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      applySession(Boolean(session))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      applySession(Boolean(session))
    })

    return () => subscription.unsubscribe()
  }, [router])

  if (checking) {
    return <AuthLoadingState message="Loading session…" />
  }

  if (!allowed) {
    return null
  }

  return children
}

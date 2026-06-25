"use client"

import { type ReactNode, useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AuthGate({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem("fitai_logged_in") !== "true") {
      router.replace("/login")
      return
    }

    setAllowed(true)
  }, [router])

  if (!allowed) {
    return null
  }

  return children
}

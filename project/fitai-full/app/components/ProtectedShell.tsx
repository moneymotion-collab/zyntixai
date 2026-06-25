"use client"

import { type ReactNode } from "react"
import AuthGate from "./AuthGate"
import Sidebar from "./Sidebar"

export default function ProtectedShell({ children }: { children: ReactNode }) {
  return (
    <AuthGate>
      <div className="flex min-h-screen overflow-hidden bg-[#0a0a0a] text-white">
        <Sidebar />
        {children}
      </div>
    </AuthGate>
  )
}
